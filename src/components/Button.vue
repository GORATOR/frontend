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
    border: 1px solid $main_theme_background;
    border-radius: 7px;
    background-color: $main_theme_background;
    color: white;
    cursor: pointer;

    &:hover {
        border: 1px solid $main_theme_background_lighter1;
        background-color: $main_theme_background_lighter1;
        outline: medium solid $main_theme_background_lighter3;
    }

    &:disabled {
        border: 1px solid $main_theme_background;
        background-color: transparent;
        color: $main_theme_background;
    }
}
</style>