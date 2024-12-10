<script setup lang="ts">
import { PageSelectEvent } from '../models/pagingPageSelect';

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
    <button v-for="i in pagesCount" v-on:click="() => pageSelect(i)" :key="i" :style="{ color: i == props.page ? 'red' : undefined }">
        {{ i }}
    </button>
</template>