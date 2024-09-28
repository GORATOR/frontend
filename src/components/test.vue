<script setup lang="ts">
import { useCounterStore } from '../store/counter.ts'

const store = useCounterStore()
</script>

<template>
    Count: {{ store.count }}
    Double: {{ store.doubleCount }}
    Name: {{ store.name }}
    <button type="button" class="btn btn-primary" v-on:click="store.changeName(new Date().toString())">change name</button>
</template>