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
        border-color: $main_theme_background;
    }

    .textbox:focus {
        border-color: $main_theme_background_lighter1;
        outline: medium solid $main_theme_background_lighter3;
    }
}
</style>