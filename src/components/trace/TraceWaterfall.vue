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
  startTs: number
  endTs: number
  durationMs: number
  isTransaction: boolean
  children: WaterfallNode[]
  depth: number
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
    const node: WaterfallNode = {
      id: tx.span_id,
      parentId: tx.parent_span_id || '',
      label: tx.name || tx.op || 'transaction',
      op: tx.op || 'http.server',
      startTs: parseTs(tx.start_timestamp),
      endTs: parseTs(tx.end_timestamp),
      durationMs: 0,
      isTransaction: true,
      children: [],
      depth: 0,
    }
    node.durationMs = (node.endTs - node.startTs) * 1000
    nodeMap.set(tx.span_id, node)

    for (const span of tx.spans || []) {
      if (!span.span_id) continue
      let spanStart = parseTs(span.start_timestamp)
      let spanEnd = parseTs(span.end_timestamp)

      // Sentry Node.js SDK (and some others) store span timestamps as seconds
      // RELATIVE to the parent transaction start, while the transaction itself
      // uses absolute Unix seconds. Detect this by checking that the tx timestamp
      // is a large Unix value (> 1e6) but the span timestamp is tiny (< 1e6).
      // In that case, convert span timestamps to absolute by adding tx start.
      if (node.startTs > 1e6 && spanEnd > 0 && spanEnd < 1e6) {
        spanStart = node.startTs + spanStart   // spanStart may be 0 → lands at tx start
        spanEnd = node.startTs + spanEnd
      }

      const spanNode: WaterfallNode = {
        id: span.span_id,
        parentId: span.parent_span_id || '',
        label: span.description || span.op || 'span',
        op: span.op || '',
        startTs: spanStart,
        endTs: spanEnd,
        durationMs: (spanEnd - spanStart) * 1000,
        isTransaction: false,
        children: [],
        depth: 0,
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
  <div class="waterfall" v-if="tree">
    <div class="waterfall-layout">
      <!-- Main table -->
      <div class="waterfall-table" :class="{ 'with-panel': selectedNode }">
        <!-- Header -->
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

        <!-- Rows -->
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

      <!-- Detail panel -->
      <div class="detail-panel" v-if="selectedNode">
        <div class="panel-header">
          <span class="panel-title">{{ selectedNode.label }}</span>
          <button class="panel-close" @click="selectedNodeId = null">✕</button>
        </div>
        <div class="panel-body">
          <div class="detail-row">
            <span class="detail-key">Op</span>
            <span class="op-tag" :style="{ backgroundColor: getOpColor(selectedNode.op) }">
              {{ selectedNode.op || '—' }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-key">Duration</span>
            <span class="detail-val">{{ formatDuration(selectedNode.durationMs) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">Type</span>
            <span class="detail-val">{{ selectedNode.isTransaction ? 'Transaction' : 'Span' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">Span ID</span>
            <span class="detail-val mono">{{ selectedNode.id }}</span>
          </div>
          <div class="detail-row" v-if="selectedNode.parentId">
            <span class="detail-key">Parent ID</span>
            <span class="detail-val mono">{{ selectedNode.parentId }}</span>
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

.waterfall {
  font-size: 12px;
  border: 1px solid $main_theme_border_color;
  border-radius: 6px;
  overflow: hidden;
}

.waterfall-layout {
  display: flex;
}

.waterfall-table {
  flex: 1;
  overflow-x: auto;
  min-width: 0;

  &.with-panel {
    flex: 0 0 65%;
  }
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

/* Detail panel */
.detail-panel {
  flex: 0 0 35%;
  border-left: 2px solid $main_theme_border_color;
  background: #fff;
  min-width: 220px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: $main_theme_border_color_lighter1;
  border-bottom: 1px solid $main_theme_border_color;
  font-weight: 600;
  font-size: 12px;
}

.panel-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: $main_theme_border_color_darker1;
}

.panel-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #888;
  padding: 0 4px;
  flex-shrink: 0;

  &:hover {
    color: #333;
  }
}

.panel-body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.detail-key {
  font-weight: 600;
  color: #666;
  width: 70px;
  flex-shrink: 0;
  font-size: 11px;
  padding-top: 2px;
}

.detail-val {
  color: #333;
  font-size: 12px;
  word-break: break-all;

  &.mono {
    font-family: monospace;
    font-size: 11px;
  }
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #888;
}
</style>
