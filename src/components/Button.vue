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
    border: 1px solid $main_theme_active_color;
    border-radius: 7px;
    background-color: $main_theme_active_color;
    color: white;
    cursor: pointer;

    &:hover {
        border: 1px solid $main_theme_active_color_lighter1;
        background-color: $main_theme_active_color_lighter1;
        outline: medium solid $main_theme_active_color_lighter3;
    }

    &:disabled {
        border: 1px solid $main_theme_active_color;
        background-color: transparent;
        color: $main_theme_active_color;
    }
}
</style>