<script setup lang="ts">
import { useCounterStore } from '@/store/counter.ts'

const store = useCounterStore()
</script>

<template>
    Count: {{ store.count }}
    Double: {{ store.doubleCount }}
    Name: {{ store.name }}
</template>