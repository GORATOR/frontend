<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { loadIssuesStats, IssueStatEntry } from '../../service/loadStats'

const props = defineProps<{
    interval?: 'minute' | 'hour' | 'day' | 'week'
    periods?: number
    label?: string
    projectIds?: string[]
}>()

const stats = ref<IssueStatEntry[]>([])
const hoveredIndex = ref<number | null>(null)
const intervalType = computed(() => props.interval || 'day')
const periodsCount = computed(() => props.periods || 14)
const chartLabel = computed(() => props.label || `Last ${periodsCount.value} ${intervalType.value}s`)
const projectIdsFilter = computed(() => props.projectIds || [])

const maxCount = computed(() => {
    if (stats.value.length === 0) return 1
    return Math.max(...stats.value.map(s => s.count), 1)
})

const totalCount = computed(() => {
    return stats.value.reduce((sum, s) => sum + s.count, 0)
})

const barHeight = 120

const barWidth = computed(() => {
    return 100 / Math.max(stats.value.length, 1)
})

const bars = computed(() => {
    const width = barWidth.value
    return stats.value.map((stat, index) => {
        const height = (stat.count / maxCount.value) * barHeight
        const x = index * width
        return {
            x,
            y: barHeight - height,
            height,
            count: stat.count,
            date: stat.date,
            label: formatDate(stat.date)
        }
    })
})

function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    switch (intervalType.value) {
        case 'minute':
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        case 'hour':
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        case 'week':
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        default: // day
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
}

function formatDateFull(dateStr: string): string {
    const date = new Date(dateStr)
    switch (intervalType.value) {
        case 'minute':
        case 'hour':
            return date.toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        default:
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }
}

async function loadData() {
    stats.value = await loadIssuesStats(
        intervalType.value,
        periodsCount.value,
        projectIdsFilter.value.length > 0 ? projectIdsFilter.value : undefined
    )
}

// Watch for prop changes and reload data
watch([intervalType, periodsCount, projectIdsFilter], () => {
    loadData()
}, { deep: true })

onMounted(() => {
    loadData()
})
</script>

<template>
    <div class="chart-container">
        <div class="chart-header">
            <div class="chart-title">
                <h3>Event Activity</h3>
                <div class="chart-subtitle">{{ chartLabel }}</div>
            </div>
            <div class="chart-total">
                <div class="total-label">Total Events</div>
                <div class="total-value">{{ totalCount }}</div>
            </div>
        </div>

        <div class="chart-body">
            <svg
                :viewBox="`0 0 100 ${barHeight}`"
                preserveAspectRatio="none"
                class="chart-svg"
            >
                <g v-for="(bar, index) in bars" :key="index">
                    <rect
                        :x="bar.x"
                        :y="bar.y"
                        :width="barWidth * 0.8"
                        :height="Math.max(bar.height, 1)"
                        :class="['bar', { 'bar-hovered': hoveredIndex === index, 'bar-empty': bar.count === 0 }]"
                        @mouseenter="hoveredIndex = index"
                        @mouseleave="hoveredIndex = null"
                    />
                </g>
            </svg>

            <div class="chart-labels">
                <div
                    v-for="(bar, index) in bars"
                    :key="index"
                    class="label"
                    :style="{ width: barWidth + '%' }"
                >
                    <span v-if="index % Math.ceil(bars.length / 7) === 0" class="label-text">
                        {{ bar.label }}
                    </span>
                </div>
            </div>

            <div
                v-if="hoveredIndex !== null"
                class="tooltip"
                :style="{ left: bars[hoveredIndex].x + barWidth / 2 + '%' }"
            >
                <div class="tooltip-date">{{ formatDateFull(bars[hoveredIndex].date) }}</div>
                <div class="tooltip-count">{{ bars[hoveredIndex].count }} events</div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as *;

.chart-container {
    background: white;
    border: 1px solid $main_theme_border_color;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.chart-title {
    h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
    }
}

.chart-subtitle {
    font-size: 13px;
    color: #6b7280;
}

.chart-total {
    text-align: right;
}

.total-label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}

.total-value {
    font-size: 28px;
    font-weight: 700;
    color: rgb(0, 106, 255);
}

.chart-body {
    position: relative;
}

.chart-svg {
    width: 100%;
    height: 120px;
    display: block;
}

.bar {
    fill: rgba(0, 106, 255, 0.7);
    transition: fill 0.2s ease;
    cursor: pointer;

    &:hover {
        fill: rgb(0, 106, 255);
    }

    &.bar-empty {
        fill: rgba(0, 106, 255, 0.1);
    }
}

.chart-labels {
    display: flex;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e5e7eb;
}

.label {
    text-align: center;
    font-size: 11px;
    color: #6b7280;
}

.label-text {
    display: inline-block;
}

.tooltip {
    position: absolute;
    bottom: 140px;
    transform: translateX(-50%);
    background: #1f2937;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 10;

    &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid #1f2937;
    }
}

.tooltip-date {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 2px;
}

.tooltip-count {
    font-size: 11px;
    opacity: 0.9;
}
</style>
