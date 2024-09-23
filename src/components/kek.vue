<script setup lang="ts">
import { useCounterStore } from '../store/counter.ts'

const store = useCounterStore()
</script>

<template>
    <button type="button" class="btn btn-primary" v-on:click="store.increment()">Primary</button>
</template>