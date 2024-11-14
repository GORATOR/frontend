<script setup lang="ts">
const model = defineModel<string>()
const props = defineProps<{
    label: string,
    type?: string
}>()
</script>

<template>
    <div class="textbox-container">
        <label class="label">
            {{ props.label }}
            <input class="textbox" :type="props.type ?? 'text'" v-model="model" />
        </label>
    </div>
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;

.textbox-container {
    padding: 5px 0;

    .label {
        display: block;
    }

    .textbox {
        display: block;
        width: 100%;
        padding: 7px;
        border-radius: 7px;
        border-style: solid;
        border-color: $main_theme_dark;
    }

    .textbox:focus {
        outline: none;
        border-color: #0085f2;
        outline: medium solid #0085f26e;
        outline-width: 3px;
    }
}
</style>