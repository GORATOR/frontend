<script setup lang="ts">
const props = defineProps<{
    page: number,
    selected: boolean,
}>()
</script>
<template>
    <div :class="{ 'page-button': true, 'selected': props.selected }">
        {{ props.page }}
    </div>
</template>
<style scoped lang="scss">
@use '../../assets/variables' as *;

.page-button {
    display: grid;
    border: 1px solid $border_color_strong;
    border-radius: $radius_md;
    background: $card_background;
    color: $text_secondary;
    font-size: 13px;
    font-weight: 500;
    width: 32px;
    height: 32px;
    text-align: center;
    align-content: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        border-color: $main_theme_active_color;
        color: $main_theme_active_color;
    }

    &.selected {
        border-color: $main_theme_active_color;
        background: $main_theme_active_color;
        color: white;
        box-shadow: $shadow_sm;
    }
}
</style>