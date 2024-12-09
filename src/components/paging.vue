<script setup lang="ts">
import { PageSelectEvent } from '../models/pagingPageSelect';

const props = defineProps<{
    page: number,
    limit: number,
    count: number
}>()
const emit = defineEmits<{
  (e: 'pageSelect', { page, offset } : PageSelectEvent): void
}>()

function test() {
    emit('pageSelect', { page: 4, offset: 55 })
}
</script>
<template>
    <p>PROPS: {{ props.count }}</p>
    <button v-on:click="test">TEST</button>
</template>