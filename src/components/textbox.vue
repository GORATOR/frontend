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
        border-color: $element_border_color;
    }

    .textbox:focus {
        outline: none;
        border-color: $element_active_border;
        outline: medium solid $element_active_outline;
        outline-width: 3px;
    }
}
</style>