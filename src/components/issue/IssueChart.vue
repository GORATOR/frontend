<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { loadIssuesStats, IssueStatEntry } from '../../service/loadStats'

const props = defineProps<{
    interval?: 'minute' | 'hour' | 'day' | 'week'
    periods?: number
    label?: string
    projectIds?: string[]
    eventType?: string
    totalEvents?: number
    totalGroups?: number
    externalStats?: IssueStatEntry[]
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
    if (props.totalEvents !== undefined) {
        return props.totalEvents
    }
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
    if (props.externalStats) {
        stats.value = props.externalStats
        return
    }
    stats.value = await loadIssuesStats(
        intervalType.value,
        periodsCount.value,
        projectIdsFilter.value.length > 0 ? projectIdsFilter.value : undefined,
        props.eventType || undefined
    )
}

// Watch for prop changes and reload data
watch([intervalType, periodsCount, projectIdsFilter, () => props.eventType, () => props.externalStats], () => {
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
            <div class="chart-totals">
                <div class="chart-total">
                    <div class="total-label">Total Events</div>
                    <div class="total-value">{{ totalCount }}</div>
                </div>
                <div class="chart-total" v-if="totalGroups !== undefined">
                    <div class="total-label">Total Groups</div>
                    <div class="total-value total-value-secondary">{{ totalGroups }}</div>
                </div>
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
    background: $card_background;
    border: 1px solid $border_color;
    border-radius: $radius_lg;
    padding: 20px 24px;
    margin-bottom: 24px;
    box-shadow: $shadow_sm;
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
        font-size: 16px;
        font-weight: 700;
        color: $main_theme_background;
    }
}

.chart-subtitle {
    font-size: 13px;
    color: $text_secondary;
}

.chart-totals {
    display: flex;
    gap: 32px;
}

.chart-total {
    text-align: right;
}

.total-label {
    font-size: 11px;
    color: $text_muted;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 2px;
}

.total-value {
    font-family: $font_heading;
    font-size: 28px;
    font-weight: 700;
    color: $main_theme_active_color;

    &.total-value-secondary {
        font-size: 22px;
        color: $text_secondary;
    }
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
    fill: rgba($main_theme_active_color, 0.65);
    transition: fill 0.2s ease;
    cursor: pointer;

    &:hover {
        fill: $main_theme_active_color;
    }

    &.bar-empty {
        fill: rgba($main_theme_active_color, 0.08);
    }
}

.chart-labels {
    display: flex;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid $border_color;
}

.label {
    text-align: center;
    font-size: 11px;
    color: $text_muted;
}

.label-text {
    display: inline-block;
}

.tooltip {
    position: absolute;
    bottom: 140px;
    transform: translateX(-50%);
    background: $main_theme_background;
    color: white;
    padding: 8px 12px;
    border-radius: $radius_md;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: $shadow_md;
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
        border-top: 4px solid $main_theme_background;
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
