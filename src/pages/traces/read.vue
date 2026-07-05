<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../../components/Sidebar.vue'
import TraceWaterfall from '../../components/trace/TraceWaterfall.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import { TraceDetail } from '../../models/trace.ts'
import { loadTrace } from '../../service/loadTrace.ts'
import { redirectTracesList } from '../../utils/redirects.ts'

const route = useRoute()
const traceId = route.params.trace_id as string

const loaded = ref(false)
const traceDetail = ref<TraceDetail | null>(null)

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

const summary = computed(() => {
  const txs = traceDetail.value?.transactions
  if (!txs?.length) return null

  // Collect timestamps from transactions and their spans.
  // Spans from some SDKs (e.g. Node.js) store timestamps relative to their
  // parent transaction start, while transactions use absolute Unix seconds.
  // Detect this and normalise span timestamps to absolute before comparing.
  const allTs: number[] = []
  for (const tx of txs) {
    const txS = parseTs(tx.start_timestamp)
    const txE = parseTs(tx.end_timestamp)
    if (txS > 0) allTs.push(txS)
    if (txE > 0) allTs.push(txE)
    for (const span of tx.spans || []) {
      let ss = parseTs(span.start_timestamp)
      let se = parseTs(span.end_timestamp)
      if (txS > 1e6 && se > 0 && se < 1e6) {
        ss = txS + ss
        se = txS + se
      }
      if (ss > 0) allTs.push(ss)
      if (se > 0) allTs.push(se)
    }
  }

  const totalSpans = txs.reduce((acc, t) => acc + (t.spans?.length || 0), 0)

  if (allTs.length === 0) {
    return { durationMs: 0, txCount: txs.length, spanCount: totalSpans, project: txs[0]?.project?.Name || '—', startTime: null }
  }

  const minTs = Math.min(...allTs)
  // Same 10-second window as the waterfall uses to exclude outlier clock sources
  const filtered = allTs.filter((t) => t <= minTs + 10)
  const traceStart = minTs
  const traceEnd = Math.max(...filtered)

  return {
    durationMs: traceEnd > traceStart ? (traceEnd - traceStart) * 1000 : 0,
    txCount: txs.length,
    spanCount: totalSpans,
    project: txs[0]?.project?.Name || '—',
    startTime: traceStart > 0 ? new Date(traceStart * 1000) : null,
  }
})

async function init() {
  traceDetail.value = await loadTrace(traceId)
  loaded.value = true
}

init()
</script>

<template>
  <Sidebar :active="MenuItem.Traces">
    <template v-if="loaded">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="redirectTracesList">Traces</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ traceId }}</span>
      </div>

      <div v-if="!traceDetail || !traceDetail.transactions?.length" class="empty-state">
        Trace not found or has no transactions.
      </div>

      <template v-else>
        <div class="trace-header">
          <div class="trace-title">
            <h2 class="trace-id">{{ traceId }}</h2>
          </div>
          <div class="trace-meta" v-if="summary">
            <div class="meta-item">
              <span class="meta-label">Duration</span>
              <span class="meta-value">{{ summary.durationMs > 0 ? formatDuration(summary.durationMs) : '—' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Transactions</span>
              <span class="meta-value">{{ summary.txCount }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Spans</span>
              <span class="meta-value">{{ summary.spanCount }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Project</span>
              <span class="meta-value">{{ summary.project }}</span>
            </div>
            <div class="meta-item" v-if="summary.startTime">
              <span class="meta-label">Time</span>
              <span class="meta-value">{{ summary.startTime.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <TraceWaterfall :transactions="traceDetail.transactions" />
      </template>
    </template>

    <template v-else>
      <div class="loading">Loading trace…</div>
    </template>
  </Sidebar>
</template>

<style scoped lang="scss">
@use '../../assets/_variables' as *;

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 16px;
  color: #888;
}

.breadcrumb-link {
  color: $main_theme_active_color;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.breadcrumb-sep {
  color: #ccc;
}

.breadcrumb-current {
  font-family: monospace;
  font-size: 12px;
  color: #555;
}

.trace-header {
  margin-bottom: 20px;
}

.trace-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

h2.trace-id {
  font-family: monospace;
  font-size: 18px;
  font-weight: 600;
  color: $main_theme_border_color_darker1;
  margin: 0;
  word-break: break-all;
}

.trace-meta {
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
  gap: 2px;
}

.meta-label {
  font-size: 11px;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.meta-value {
  font-size: 14px;
  font-weight: 600;
  color: $main_theme_border_color_darker1;
}

.empty-state,
.loading {
  text-align: center;
  padding: 60px;
  color: #888;
}
</style>
