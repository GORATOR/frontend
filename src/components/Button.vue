<script setup lang="ts">
const props = withDefaults(defineProps<{
    variant?: 'primary' | 'secondary' | 'danger'
}>(), {
    variant: 'primary'
})
</script>

<template>
    <button class="btn" :class="`btn--${props.variant}`">
        <slot></slot>
    </button>
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 18px;
    border: 1px solid transparent;
    border-radius: $radius_md;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;

    &:active:not(:disabled) {
        transform: translateY(1px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: $focus_ring;
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }

    &--primary {
        background-color: $main_theme_active_color;
        color: white;
        box-shadow: $shadow_sm;

        &:hover:not(:disabled) {
            background-color: #125fc6;
        }
    }

    &--secondary {
        background-color: $card_background;
        border-color: $border_color_strong;
        color: $text_primary;

        &:hover:not(:disabled) {
            background-color: $surface_subtle;
            border-color: $text_muted;
        }
    }

    &--danger {
        background-color: $card_background;
        border-color: rgba($color_danger, 0.4);
        color: $color_danger;

        &:hover:not(:disabled) {
            background-color: $color_danger;
            border-color: $color_danger;
            color: white;
        }
    }
}
</style>
