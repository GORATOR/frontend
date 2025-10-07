<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { loadIssuesStats } from '../../service/loadStats'

const props = defineProps<{
    exceptionType: string
    exceptionValue: string
    days?: number
}>()

const stats = ref<number[]>([])
const daysToShow = computed(() => props.days || 7)

const maxCount = computed(() => {
    if (stats.value.length === 0) return 1
    return Math.max(...stats.value, 1)
})

const barHeight = 24
const barWidth = computed(() => 100 / stats.value.length)

const bars = computed(() => {
    const width = barWidth.value
    return stats.value.map((count, index) => {
        const height = (count / maxCount.value) * barHeight
        return {
            x: index * width,
            y: barHeight - height,
            height: Math.max(height, count > 0 ? 2 : 0),
            count
        }
    })
})

async function loadData() {
    // For now, just generate some dummy data based on total count
    // In production, you'd call an API that filters by exception type
    const allStats = await loadIssuesStats(daysToShow.value)

    // Extract just the counts
    stats.value = allStats.map(s => s.count)
}

onMounted(() => {
    loadData()
})
</script>

<template>
    <div class="mini-chart">
        <svg
            :viewBox="`0 0 100 ${barHeight}`"
            preserveAspectRatio="none"
            class="mini-chart-svg"
        >
            <g v-for="(bar, index) in bars" :key="index">
                <rect
                    :x="bar.x"
                    :y="bar.y"
                    :width="barWidth * 0.9"
                    :height="bar.height"
                    :class="['mini-bar', { 'mini-bar-empty': bar.count === 0 }]"
                />
            </g>
        </svg>
    </div>
</template>

<style scoped lang="scss">
.mini-chart {
    width: 60px;
    height: 24px;
    margin-left: 8px;
}

.mini-chart-svg {
    width: 100%;
    height: 100%;
    display: block;
}

.mini-bar {
    fill: rgba(0, 106, 255, 0.6);

    &.mini-bar-empty {
        fill: rgba(0, 106, 255, 0.1);
    }
}
</style>
