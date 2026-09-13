<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import Paging from '../../components/paging/Paging.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import { PageSelectEvent } from '../../models/pagingPageSelect.ts'
import { Transaction } from '../../models/trace.ts'
import { loadTraces, loadTracesCount } from '../../service/loadTrace.ts'
import { redirectTrace } from '../../utils/redirects.ts'
import { Project } from '../../models/project.ts'
import { loadProjects } from '../../service/loadList.ts'
import SelectBox from '../../components/SelectBox.vue'
import { SelectBoxOption } from '../../models/SelectBoxOption.ts'

const loaded = ref(false)
const transactions = ref<Transaction[]>([])
const selectedProjectId = ref<string>('')

const count = ref(0)
const page = ref(1)
const offset = ref(0)
const limit = 10

const projectsLoaded = ref(false)
const projects = ref<Project[]>([])

interface TraceRow {
  trace_id: string
  rootName: string
  rootOp: string
  services: string[]
  txCount: number
  durationMs: number
  project?: Project
  startTime: Date
}

function parseTs(s: string): number {
  if (!s) return 0
  const n = Number(s)
  return isNaN(n) ? (Date.parse(s) / 1000 || 0) : n
}

function formatDuration(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`
  if (ms < 1000) return `${ms.toFixed(2)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function formatDate(d: Date): string {
  return d.toLocaleString()
}

const traceRows = computed<TraceRow[]>(() => {
  const groups = new Map<string, Transaction[]>()
  for (const tx of transactions.value) {
    if (!tx.trace_id) continue
    if (!groups.has(tx.trace_id)) groups.set(tx.trace_id, [])
    groups.get(tx.trace_id)!.push(tx)
  }

  const rows: TraceRow[] = []
  for (const [traceId, txs] of groups) {
    const root = txs.find((t) => !t.parent_span_id) || txs[0]
    const startTs = Math.min(...txs.map((t) => parseTs(t.start_timestamp)).filter((n) => n > 0))
    const endTs = Math.max(...txs.map((t) => parseTs(t.end_timestamp)).filter((n) => n > 0))

    rows.push({
      trace_id: traceId,
      rootName: root.name || root.op || '—',
      rootOp: root.op || '—',
      services: [...new Set(txs.map((t) => t.name || t.op).filter(Boolean))],
      txCount: txs.length,
      durationMs: (endTs - startTs) * 1000,
      project: root.project || undefined,
      startTime: new Date(startTs * 1000),
    })
  }

  return rows.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
})

const projectOptions = computed<SelectBoxOption[]>(() => {
  const opts: SelectBoxOption[] = [{ value: '', label: 'All projects' }]
  for (const p of projects.value) {
    opts.push({ value: p.ID.toString(), label: p.Name })
  }
  return opts
})

async function reload(off = offset.value) {
  transactions.value = await loadTraces(loaded, off, limit, selectedProjectId.value || undefined)
}

async function reloadCount() {
  count.value = await loadTracesCount(selectedProjectId.value || undefined)
}

async function onProjectChange() {
  offset.value = 0
  page.value = 1
  await Promise.all([reload(0), reloadCount()])
}

async function pageSelect(e: PageSelectEvent) {
  page.value = e.page
  offset.value = e.offset
  await reload(e.offset)
}

async function init() {
  const [, , projs] = await Promise.all([
    reload(),
    reloadCount(),
    loadProjects(projectsLoaded, 0, 100),
  ])
  projects.value = projs
}

init()
</script>

<template>
  <Sidebar :active="MenuItem.Traces">
    <template v-if="loaded">
      <h2>Traces</h2>

      <div class="filters-block">
        <SelectBox
          label="Project"
          :options="projectOptions"
          v-model="selectedProjectId"
          @changed="onProjectChange"
        />
      </div>

      <div v-if="traceRows.length === 0" class="empty-state">
        No traces found.
      </div>

      <div v-else class="traces-table">
        <div class="table-header">
          <div class="h-cell h-trace-id">Trace ID</div>
          <div class="h-cell h-root">Root transaction</div>
          <div class="h-cell h-services">Services</div>
          <div class="h-cell h-txs">Txns</div>
          <div class="h-cell h-duration">Duration</div>
          <div class="h-cell h-project">Project</div>
          <div class="h-cell h-time">Time</div>
        </div>

        <div
          v-for="row in traceRows"
          :key="row.trace_id"
          class="trace-row"
          @click="redirectTrace(row.trace_id)"
        >
          <div class="d-cell h-trace-id">
            <span class="trace-id-badge">{{ row.trace_id.substring(0, 16) }}</span>
          </div>
          <div class="d-cell h-root">
            <span class="op-tag" :class="`op-${row.rootOp.split('.')[0]}`">{{ row.rootOp }}</span>
            <span class="root-name">{{ row.rootName }}</span>
          </div>
          <div class="d-cell h-services">
            <span
              v-for="svc in row.services"
              :key="svc"
              class="service-chip"
            >{{ svc }}</span>
          </div>
          <div class="d-cell h-txs">{{ row.txCount }}</div>
          <div class="d-cell h-duration">{{ formatDuration(row.durationMs) }}</div>
          <div class="d-cell h-project">{{ row.project?.Name || '—' }}</div>
          <div class="d-cell h-time">{{ formatDate(row.startTime) }}</div>
        </div>
      </div>

      <Paging :page="page" :limit="limit" :count="count" v-on:page-select="pageSelect" />
    </template>

    <template v-else>
      <div class="loading">Loading traces…</div>
    </template>
  </Sidebar>
</template>

<style scoped lang="scss">
@use '../../assets/_variables' as *;

h2 {
  margin-bottom: 16px;
}

.filters-block {
  margin-bottom: 20px;
  max-width: 280px;
}

.empty-state,
.loading {
  text-align: center;
  padding: 60px;
  color: #888;
}

.traces-table {
  border: 1px solid $main_theme_border_color;
  border-radius: 6px;
  overflow: hidden;
  font-size: 13px;
}

.table-header {
  display: flex;
  background: $main_theme_border_color_lighter1;
  padding: 10px 12px;
  font-weight: 600;
  font-size: 12px;
  color: $main_theme_border_color_darker1;
  border-bottom: 1px solid $main_theme_border_color;
}

.trace-row {
  display: flex;
  align-items: center;
  padding: 9px 12px;
  border-top: 1px solid $main_theme_border_color;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: $main_theme_active_color_lighter4;
  }

  &:first-child {
    border-top: none;
  }
}

.h-cell,
.d-cell {
  padding: 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.h-trace-id  { flex: 0 0 150px; }
.h-root      { flex: 1; display: flex; align-items: center; gap: 6px; }
.h-services  { flex: 0 0 180px; display: flex; flex-wrap: wrap; gap: 4px; }
.h-txs       { flex: 0 0 50px; text-align: center; }
.h-duration  { flex: 0 0 80px; text-align: right; font-variant-numeric: tabular-nums; }
.h-project   { flex: 0 0 110px; }
.h-time      { flex: 0 0 160px; color: #666; }

.trace-id-badge {
  font-family: monospace;
  font-size: 12px;
  background: $main_theme_active_color_lighter4;
  color: $main_theme_active_color;
  padding: 2px 6px;
  border-radius: 4px;
}

.op-tag {
  font-size: 10px;
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  flex-shrink: 0;
  white-space: nowrap;

  &.op-http  { background: #7B5EA7; }
  &.op-db    { background: #1D6FBF; }
  &.op-cache { background: #28A745; }
  &.op-function { background: #8E44AD; }
}

.root-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.service-chip {
  font-size: 11px;
  background: $main_theme_border_color;
  color: $main_theme_border_color_darker1;
  padding: 1px 6px;
  border-radius: 10px;
  white-space: nowrap;
}
</style>
