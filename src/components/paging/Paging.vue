<script setup lang="ts">
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

const pagesCount = Math.ceil(props.count / props.limit)

function pageSelect(page: number) {
    emit('pageSelect', { page: page, offset: (page - 1) * props.limit })
}
</script>
<template>
    <div class="paging-content">
        <PageButton
            v-for="i in pagesCount"
            v-on:click="() => pageSelect(i)"
            :key="i"
            :page="i"
            :selected="i == props.page" />
    </div>
</template>
<style scoped lang="scss">
@use '../../assets/variables' as *;

.paging-content {
    padding-top: 10px;
    display: flex;
    gap: 5px;
}
</style>