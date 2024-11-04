<script setup lang="ts">
const model = defineModel<string>()
const props = defineProps<{
    label: string,
    type?: string
}>()
</script>

<template>
    <div class="textbox-container">
        <label class="textbox-label">
            {{ props.label }}
            <input class="textbox" :type="props.type ?? 'text'" v-model="model" />
        </label>
    </div>
</template>

<style scoped>
.textbox-container {
    padding: .2rem 0;
}

.textbox-label {
    display: block;
}

.textbox {
    display: block;
    width: 100%;
    padding: .4rem;
    border-radius: .2rem;
    border-style: solid;
    border-color: #333;
}

.textbox:focus {
    border-color: #0085f2;
    outline: medium solid #0085f26e;
    outline-width: .3rem;
}
</style>