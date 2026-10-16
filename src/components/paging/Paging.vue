<script setup lang="ts">
import { computed } from 'vue'
import { PageSelectEvent } from '../../models/pagingPageSelect'
import PageButton from './PageButton.vue'

const props = defineProps<{
    page: number,
    limit: number,
    count: number
}>()
const emit = defineEmits<{
    (e: 'pageSelect', { page, offset }: PageSelectEvent): void
}>()

const MAX_VISIBLE_PAGES = 7
const PAGE_RADIUS = 2

const pagesCount = computed(() => Math.ceil(props.count / props.limit))

// null stands for the "…" separator between page numbers
const visiblePages = computed<(number | null)[]>(() => {
    const total = pagesCount.value
    if (total <= MAX_VISIBLE_PAGES) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    const from = Math.max(2, props.page - PAGE_RADIUS)
    const to = Math.min(total - 1, props.page + PAGE_RADIUS)

    const pages: (number | null)[] = [1]
    if (from > 2) {
      pages.push(null)
    }
    for (let i = from; i <= to; i++) pages.push(i)
    if (to < total - 1) {
      pages.push(null)
    }
    pages.push(total)
    return pages
})

function pageSelect(page: number) {
    emit('pageSelect', { page: page, offset: (page - 1) * props.limit })
}
</script>
<template>
    <div class="paging-content">
        <template v-for="(p, i) in visiblePages" :key="p === null ? `dots-${i}` : p">
            <span v-if="p === null" class="paging-dots">…</span>
            <PageButton
                v-else
                v-on:click="() => pageSelect(p)"
                :page="p"
                :selected="p === props.page" />
        </template>
    </div>
</template>
<style scoped lang="scss">
@use '../../assets/variables' as *;

.paging-content {
    padding-top: 14px;
    display: flex;
    gap: 6px;
}

.paging-dots {
    width: 32px;
    height: 32px;
    display: grid;
    place-content: center;
    color: $text_muted;
}
</style>