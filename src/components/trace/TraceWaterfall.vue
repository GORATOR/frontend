<script setup lang="ts">
import { computed, ref } from 'vue'
import { Transaction } from '../../models/trace.ts'

const props = defineProps<{
  transactions: Transaction[]
}>()

interface WaterfallNode {
  id: string
  parentId: string
  label: string
  op: string
  description: string
  status: string
  parsedData: Record<string, unknown> | null
  parsedTags: Record<string, unknown> | null
  parsedContexts: Record<string, unknown> | null
  startTs: number
  endTs: number
  durationMs: number
  isTransaction: boolean
  children: WaterfallNode[]
  depth: number
  /** Pre-normalization timestamp — used as the reference when computing
   *  relative offsets for child nodes that are in a different clock frame. */
  originalStartTs: number
}

function tryParseJson(s: string | null | undefined): Record<string, unknown> | null {
  if (!s) return null
  try {
    const parsed = JSON.parse(s)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function parseTs(s: string): number {
  if (!s) return 0
  // Use Number() instead of parseFloat() so ISO dates like "2026-06-20T..."
  // return NaN (not the numeric year prefix "2026") and fall through to Date.parse.
  const n = Number(s)
  return isNaN(n) ? (Date.parse(s) / 1000 || 0) : n
}

const OP_COLOR_MAP: Record<string, string> = {
  'http.server': '#7B5EA7',
  'http.client': '#E8592A',
  'db.query': '#1D6FBF',
  'db': '#1D6FBF',
  'cache.get': '#20843A',
  'cache.set': '#28A745',
  'cache': '#28A745',
  'function': '#8E44AD',
  'task': '#E67E22',
}

function getOpColor(op: string): string {
  if (!op) return '#6C757D'
  if (OP_COLOR_MAP[op]) return OP_COLOR_MAP[op]
  const base = op.split('.')[0]
  return OP_COLOR_MAP[base] || '#6C757D'
}

const tree = computed<WaterfallNode | null>(() => {
  const txs = props.transactions
  if (!txs?.length) return null

  const nodeMap = new Map<string, WaterfallNode>()

  for (const tx of txs) {
    if (!tx.span_id) continue
    const txStart = parseTs(tx.start_timestamp)
    const txEnd = parseTs(tx.end_timestamp)
    const node: WaterfallNode = {
      id: tx.span_id,
      parentId: tx.parent_span_id || '',
      label: tx.name || tx.op || 'transaction',
      op: tx.op || 'http.server',
      description: tx.name || '',
      status: tx.status || '',
      parsedData: null,
      parsedTags: tryParseJson(tx.tags),
      parsedContexts: tryParseJson(tx.contexts),
      startTs: txStart,
      endTs: txEnd,
      durationMs: (txEnd - txStart) * 1000,
      isTransaction: true,
      children: [],
      depth: 0,
      originalStartTs: txStart,
    }
    nodeMap.set(tx.span_id, node)

    for (const span of tx.spans || []) {
      if (!span.span_id) continue
      const spanStart = parseTs(span.start_timestamp)
      const spanEnd = parseTs(span.end_timestamp)
      const spanNode: WaterfallNode = {
        id: span.span_id,
        parentId: span.parent_span_id || '',
        label: span.description || span.op || 'span',
        op: span.op || '',
        description: span.description || '',
        status: span.status || '',
        parsedData: tryParseJson(span.data),
        parsedTags: null,
        parsedContexts: null,
        startTs: spanStart,
        endTs: spanEnd,
        durationMs: (spanEnd - spanStart) * 1000,
        isTransaction: false,
        children: [],
        depth: 0,
        originalStartTs: spanStart,
      }
      nodeMap.set(span.span_id, spanNode)
    }
  }

  let root: WaterfallNode | null = null
  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node)
    } else if (node.isTransaction) {
      // Pick root as the transaction with the earliest valid start timestamp.
      // If both have startTs = 0, fall back to the one with the larger endTs
      // (longer trace = more likely to be the actual root).
      if (!root) {
        root = node
      } else {
        const nodeTs = node.startTs > 0 ? node.startTs : Infinity
        const rootTs = root.startTs > 0 ? root.startTs : Infinity
        if (nodeTs < rootTs || (nodeTs === rootTs && node.endTs > root.endTs)) {
          root = node
        }
      }
    }
  }

  function setDepth(node: WaterfallNode, depth: number) {
    node.depth = depth

    // Distributed services each have their own clock reference frame.
    // A child is "out of frame" when:
    //   (a) its timestamps are tiny relative values (< 1e6, i.e. not Unix seconds), OR
    //   (b) its timestamps are absolute Unix but from a completely different epoch
    //       (e.g. different request batch in a demo, or an unsynchronised clock).
    //
    // We fix this by translating the child into the parent's reference frame using
    // the offset between their ORIGINAL (pre-normalization) timestamps.
    // If the offset is huge (> 1000 s), the clocks are unrelated — position the child
    // at the parent's start and use the child's duration to set its end.
    for (const child of node.children) {
      if (child.endTs <= 0) continue

      const childIsRelative = child.endTs > 0 && child.endTs < 1e6
      const childAcrossEras = !childIsRelative && child.startTs > node.endTs + 1000

      if (childIsRelative || childAcrossEras) {
        // rawOffset: how far into parent's ORIGINAL clock the child started.
        // node.originalStartTs is the parent's timestamp in its own service's clock
        // (set in tree builder, and preserved across earlier normalizations).
        const rawOffset = child.startTs - node.originalStartTs
        const offset = Math.abs(rawOffset) < 1000 ? Math.max(0, rawOffset) : 0

        // Save original before overwriting so child's OWN children can use it.
        child.originalStartTs = child.startTs
        child.startTs = node.startTs + offset
        child.endTs = child.startTs + child.durationMs / 1000
      }
    }

    node.children.sort((a, b) => a.startTs - b.startTs)
    for (const child of node.children) {
      setDepth(child, depth + 1)
    }
  }

  if (root) setDepth(root, 0)
  return root
})

// Computes the trace time range.
//
// The Sentry SDK stores timestamps differently per service:
//   • Relative mode  — start_timestamp="" (→ 0), end_timestamp is seconds elapsed
//     since the transaction start (e.g. 0.01326 = 13.26 ms). The trace start is 0.
//   • Absolute mode  — both are full Unix seconds (~1.78e9 for 2026).
//
// Additionally, data from DIFFERENT requests can be stored under the same
// trace_id in a demo setup, creating timestamps that are 100+ seconds apart.
//
// Strategy:
//   1. Collect all positive endTs values.
//   2. Determine scale: if max(endTs) < 1e6 → relative (trace start = 0).
//      If max(endTs) > 1e9 → absolute Unix (trace start = minTs).
//   3. Apply a 10-second window around the anchor to drop outlier timestamps
//      from foreign request batches.
const traceRange = computed<{ start: number; end: number }>(() => {
  if (!tree.value) return { start: 0, end: 0 }

  const root = tree.value

  // Collect every positive endTs and startTs in the tree.
  const endTsAll: number[] = []
  const startTsAll: number[] = []
  function collectTs(node: WaterfallNode) {
    if (node.endTs > 0) endTsAll.push(node.endTs)
    if (node.startTs > 0) startTsAll.push(node.startTs)
    for (const c of node.children) collectTs(c)
  }
  collectTs(root)

  if (endTsAll.length === 0) return { start: 0, end: 0 }

  const maxEnd = Math.max(...endTsAll)

  // Relative timestamp mode: all end timestamps are small fractions of a second.
  if (maxEnd < 1e6) {
    const rootDuration = root.endTs > 0 ? root.endTs - Math.max(0, root.startTs) : 0
    const windowSec = Math.max(10, rootDuration * 2)
    // Anchor at 0 (the trace always starts at time 0 in relative mode).
    const filtered = endTsAll.filter((t) => t <= windowSec)
    const allFiltered = [...filtered, ...startTsAll.filter((t) => t > 0 && t <= windowSec)]
    if (allFiltered.length === 0) return { start: 0, end: maxEnd }
    return { start: 0, end: Math.max(...allFiltered) }
  }

  // Absolute Unix timestamp mode.
  const allTs = [...endTsAll, ...startTsAll.filter((t) => t > 0)]
  const minTs = Math.min(...allTs)
  const rootDuration =
    root.startTs > 0 && root.endTs > root.startTs ? root.endTs - root.startTs : 0
  const windowSec = Math.max(10, rootDuration * 2)
  const filtered = allTs.filter((t) => t <= minTs + windowSec)
  if (filtered.length === 0) return { start: minTs, end: minTs }
  return { start: minTs, end: Math.max(...filtered) }
})

const traceStart = computed<number>(() => traceRange.value.start)
const traceEnd = computed<number>(() => traceRange.value.end)

const totalDurationMs = computed<number>(() => {
  return (traceEnd.value - traceStart.value) * 1000
})

const collapsed = ref<Record<string, boolean>>({})

function toggleCollapse(id: string) {
  if (collapsed.value[id]) {
    delete collapsed.value[id]
  } else {
    collapsed.value[id] = true
  }
  // trigger reactivity
  collapsed.value = { ...collapsed.value }
}

const flatRows = computed<WaterfallNode[]>(() => {
  if (!tree.value) return []
  const rows: WaterfallNode[] = []
  function traverse(node: WaterfallNode) {
    rows.push(node)
    if (!collapsed.value[node.id]) {
      for (const child of node.children) {
        traverse(child)
      }
    }
  }
  traverse(tree.value)
  return rows
})

function barStyle(node: WaterfallNode): Record<string, string> {
  const total = totalDurationMs.value
  // startTs = 0 is valid (span starts at the beginning of the trace).
  // Only skip when endTs is missing or the total range is unknown.
  if (total <= 0 || node.endTs <= 0) return {}

  const left = ((node.startTs - traceStart.value) * 1000) / total * 100

  // Clamp small float-point drift; skip nodes that are truly outside the window.
  if (left < -0.5 || left > 100) return {}

  const clampedLeft = Math.max(0, left)
  const maxWidth = 100 - clampedLeft
  const width = Math.min(maxWidth, Math.max(0.3, node.durationMs / total * 100))
  return {
    left: `${clampedLeft}%`,
    width: `${width}%`,
    backgroundColor: getOpColor(node.op),
  }
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '—'
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`
  if (ms < 1000) return `${ms.toFixed(2)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const rulerMarks = computed<Array<{ percent: number; label: string }>>(() => {
  const total = totalDurationMs.value
  if (total <= 0) return []
  return [0, 25, 50, 75, 100].map((pct) => ({
    percent: pct,
    label: formatDuration(total * pct / 100),
  }))
})

const selectedNodeId = ref<string | null>(null)

function selectNode(id: string) {
  selectedNodeId.value = selectedNodeId.value === id ? null : id
}

const selectedNode = computed<WaterfallNode | null>(() => {
  if (!selectedNodeId.value || !tree.value) return null
  function find(node: WaterfallNode): WaterfallNode | null {
    if (node.id === selectedNodeId.value) return node
    for (const c of node.children) {
      const found = find(c)
      if (found) return found
    }
    return null
  }
  return find(tree.value)
})
</script>

<template>
  <div class="waterfall-wrap" v-if="tree">
    <!-- Waterfall table -->
    <div class="waterfall">
      <div class="waterfall-header">
        <div class="col-label">Span</div>
        <div class="col-bar">
          <div class="ruler">
            <div
              v-for="mark in rulerMarks"
              :key="mark.percent"
              class="ruler-mark"
              :style="{ left: `${mark.percent}%` }"
            >
              {{ mark.label }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-for="row in flatRows"
        :key="row.id"
        class="waterfall-row"
        :class="{
          'is-transaction': row.isTransaction,
          'is-selected': selectedNodeId === row.id,
        }"
        @click="selectNode(row.id)"
      >
        <div class="col-label" :style="{ paddingLeft: `${row.depth * 16 + 8}px` }">
          <span
            class="toggle"
            v-if="row.children.length > 0"
            @click.stop="toggleCollapse(row.id)"
          >
            {{ collapsed[row.id] ? '▶' : '▼' }}
          </span>
          <span v-else class="toggle-spacer"></span>
          <span class="op-tag" :style="{ backgroundColor: getOpColor(row.op) }">
            {{ row.op || '—' }}
          </span>
          <span class="row-name">{{ row.label }}</span>
        </div>

        <div class="col-bar">
          <div class="bar-track">
            <div class="bar" :style="barStyle(row)"></div>
          </div>
          <span class="dur-label">{{ formatDuration(row.durationMs) }}</span>
        </div>
      </div>
    </div>

    <!-- Span detail block below waterfall -->
    <div class="span-detail" v-if="selectedNode">
      <div class="span-detail-header">
        <span class="span-detail-title">{{ selectedNode.label }}</span>
        <button class="span-detail-close" @click="selectedNodeId = null">✕</button>
      </div>

      <div class="span-detail-body">
        <!-- Meta chips row -->
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Op</span>
            <span class="op-tag" :style="{ backgroundColor: getOpColor(selectedNode.op) }">
              {{ selectedNode.op || '—' }}
            </span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Duration</span>
            <span class="meta-value">{{ formatDuration(selectedNode.durationMs) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Type</span>
            <span class="meta-value">{{ selectedNode.isTransaction ? 'Transaction' : 'Span' }}</span>
          </div>
          <div class="meta-item" v-if="selectedNode.status">
            <span class="meta-label">Status</span>
            <span class="meta-value">{{ selectedNode.status }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Span ID</span>
            <span class="meta-value mono">{{ selectedNode.id }}</span>
          </div>
          <div class="meta-item" v-if="selectedNode.parentId">
            <span class="meta-label">Parent ID</span>
            <span class="meta-value mono">{{ selectedNode.parentId }}</span>
          </div>
        </div>

        <!-- Description -->
        <div class="detail-section" v-if="selectedNode.description">
          <span class="detail-section-title">Description</span>
          <pre class="detail-pre">{{ selectedNode.description }}</pre>
        </div>

        <!-- Data -->
        <div class="detail-section" v-if="selectedNode.parsedData">
          <span class="detail-section-title">Data</span>
          <div class="kv-grid">
            <template v-for="(val, key) in selectedNode.parsedData" :key="String(key)">
              <span class="kv-key">{{ key }}</span>
              <span class="kv-val">{{ typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val) }}</span>
            </template>
          </div>
        </div>

        <!-- Tags -->
        <div class="detail-section" v-if="selectedNode.parsedTags">
          <span class="detail-section-title">Tags</span>
          <div class="kv-grid">
            <template v-for="(val, key) in selectedNode.parsedTags" :key="String(key)">
              <span class="kv-key">{{ key }}</span>
              <span class="kv-val">{{ typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val) }}</span>
            </template>
          </div>
        </div>

        <!-- Contexts -->
        <div class="detail-section" v-if="selectedNode.parsedContexts">
          <span class="detail-section-title">Contexts</span>
          <div class="kv-grid">
            <template v-for="(val, key) in selectedNode.parsedContexts" :key="String(key)">
              <span class="kv-key">{{ key }}</span>
              <pre class="kv-val">{{ typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val) }}</pre>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="empty-state" v-else>
    No spans found for this trace.
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/_variables' as *;

.waterfall-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.waterfall {
  font-size: 12px;
  border: 1px solid $main_theme_border_color;
  border-radius: 6px;
  overflow: hidden;
}

.waterfall-header {
  display: flex;
  background: $main_theme_border_color_lighter1;
  border-bottom: 2px solid $main_theme_border_color;
  padding: 6px 0;
  font-weight: 600;
  font-size: 11px;
  color: $main_theme_border_color_darker1;
  position: sticky;
  top: 0;
  z-index: 1;
}

.waterfall-row {
  display: flex;
  border-top: 1px solid $main_theme_border_color;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: $main_theme_active_color_lighter4;
  }

  &.is-transaction {
    background: #fafafa;

    &:hover {
      background: $main_theme_active_color_lighter4;
    }
  }

  &.is-selected {
    background: $main_theme_active_color_lighter3;
  }
}

.col-label {
  flex: 0 0 42%;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  overflow: hidden;
  border-right: 1px solid $main_theme_border_color;
}

.col-bar {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  gap: 6px;
  position: relative;
  min-width: 0;
}

.ruler {
  position: relative;
  width: 100%;
  height: 20px;

  .ruler-mark {
    position: absolute;
    transform: translateX(-50%);
    font-size: 10px;
    color: #888;
    white-space: nowrap;
    user-select: none;

    &:first-child {
      transform: translateX(0);
    }

    &:last-child {
      transform: translateX(-100%);
    }
  }
}

.bar-track {
  flex: 1;
  position: relative;
  height: 16px;
}

.bar {
  position: absolute;
  height: 100%;
  border-radius: 2px;
  min-width: 2px;
  opacity: 0.85;
  transition: opacity 0.1s;

  &:hover {
    opacity: 1;
  }
}

.dur-label {
  flex-shrink: 0;
  font-size: 11px;
  color: #555;
  white-space: nowrap;
  min-width: 52px;
  text-align: right;
}

.toggle {
  cursor: pointer;
  font-size: 9px;
  color: #666;
  user-select: none;
  width: 12px;
  flex-shrink: 0;
  text-align: center;

  &:hover {
    color: $main_theme_active_color;
  }
}

.toggle-spacer {
  width: 12px;
  flex-shrink: 0;
}

.op-tag {
  color: white;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}

.row-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
}

/* Span detail block */
.span-detail {
  border: 1px solid $main_theme_border_color;
  border-radius: 6px;
  overflow: hidden;
  font-size: 12px;
}

.span-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: $main_theme_border_color_lighter1;
  border-bottom: 1px solid $main_theme_border_color;
}

.span-detail-title {
  font-weight: 600;
  font-size: 13px;
  color: $main_theme_border_color_darker1;
  font-family: monospace;
  word-break: break-all;
}

.span-detail-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #888;
  padding: 0 4px;
  flex-shrink: 0;
  margin-left: 12px;

  &:hover {
    color: #333;
  }
}

.span-detail-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Meta chips */
.meta-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 12px 16px;
  background: $main_theme_border_color_lighter1;
  border: 1px solid $main_theme_border_color;
  border-radius: 6px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.meta-label {
  font-size: 10px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-value {
  font-size: 13px;
  font-weight: 500;
  color: $main_theme_border_color_darker1;

  &.mono {
    font-family: monospace;
    font-size: 11px;
  }
}

/* Sections */
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-section-title {
  font-size: 11px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-pre {
  margin: 0;
  font-family: monospace;
  font-size: 12px;
  color: #222;
  background: $main_theme_border_color_lighter1;
  border: 1px solid $main_theme_border_color;
  border-radius: 4px;
  padding: 10px 12px;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}

/* Key-value grid */
.kv-grid {
  display: grid;
  grid-template-columns: minmax(120px, max-content) 1fr;
  gap: 0;
  border: 1px solid $main_theme_border_color;
  border-radius: 4px;
  overflow: hidden;
}

.kv-key,
.kv-val {
  padding: 6px 10px;
  font-size: 12px;
  border-bottom: 1px solid $main_theme_border_color;
  word-break: break-all;

  &:nth-last-child(-n+2) {
    border-bottom: none;
  }
}

.kv-key {
  font-family: monospace;
  font-weight: 600;
  color: #555;
  background: $main_theme_border_color_lighter1;
  border-right: 1px solid $main_theme_border_color;
  white-space: nowrap;
}

.kv-val {
  font-family: monospace;
  color: #222;
  background: #fff;
  margin: 0;
  white-space: pre-wrap;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #888;
}
</style>
