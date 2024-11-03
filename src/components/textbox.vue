<script setup lang="ts">
const model = defineModel<string>()
const props = defineProps<{
    label: string,
    type?: string
}>()
</script>

<template>
    <label>
        {{ props.label }}
        <input :type="props.type ?? 'text'" v-model="model" />
    </label>
</template>