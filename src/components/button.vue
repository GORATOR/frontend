<script setup lang="ts">
</script>

<template>
    <button class="btn">
        <slot></slot>
    </button>
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;

.btn {
    padding: 7px;
    border: 3px solid $element_background;
    border-radius: 7px;
    background-color: $element_background;
    color: $element_color;
    cursor: pointer;

    &:focus {
        outline: none;
        outline: medium solid $element_active_outline;
        outline-width: 3px;
    }

    &:hover {
        border-color: $element_hover_background;
        background-color: $element_hover_background;
    }
}
</style>