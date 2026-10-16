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
        <h3>Filters</h3>
        <div class="filters-container">
          <SelectBox
            label="Project"
            :options="projectOptions"
            v-model="selectedProjectId"
            @changed="onProjectChange"
          />
        </div>
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
  margin: 0 0 20px;
  font-size: 22px;
}

.filters-block {
  margin: 0 0 20px;
  padding: 18px 20px;
  background-color: $card_background;
  border: 1px solid $border_color;
  border-radius: $radius_lg;
  box-shadow: $shadow_sm;

  h3 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 15px;
    color: $main_theme_background;
  }

  .filters-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 320px));
    gap: 15px;
  }
}

.empty-state,
.loading {
  text-align: center;
  padding: 60px;
  color: $text_muted;
}

.traces-table {
  border: 1px solid $border_color;
  border-radius: $radius_lg;
  overflow: hidden;
  background: $card_background;
  box-shadow: $shadow_sm;
  font-size: 13px;
}

.table-header {
  display: flex;
  align-items: center;
  background-color: $surface_subtle;
  padding: 12px 16px;
  border-bottom: 1px solid $border_color;

  .h-cell {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $text_secondary;
  }
}

.trace-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-top: 1px solid $border_color;
  cursor: pointer;
  transition: background-color 0.12s ease;

  &:hover {
    background-color: $surface_subtle;
  }

  .h-duration,
  .h-time {
    font-family: $font_mono;
    font-size: 12px;
    color: $text_secondary;
  }
}

.table-header + .trace-row {
  border-top: none;
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
.h-time      { flex: 0 0 160px; }

.trace-id-badge {
  font-family: $font_mono;
  font-size: 12px;
  background: rgba($main_theme_active_color, 0.08);
  color: $main_theme_active_color;
  padding: 2px 8px;
  border-radius: $radius_sm;
}

.op-tag {
  font-size: 10px;
  font-weight: 600;
  color: white;
  padding: 2px 6px;
  border-radius: $radius_sm;
  flex-shrink: 0;
  white-space: nowrap;

  &.op-http     { background: rgba($main_theme_active_color, 0.9); }
  &.op-db       { background: rgba($main_theme_active_color, 0.65); }
  &.op-cache    { background: rgba($main_theme_background, 0.7); }
  &.op-function { background: rgba($main_theme_background, 0.85); }
}

.root-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: $text_primary;
  font-weight: 500;
}

.service-chip {
  font-size: 11px;
  background: $surface_hover;
  color: $text_secondary;
  padding: 1px 8px;
  border-radius: $radius_lg;
  white-space: nowrap;
}
</style>
