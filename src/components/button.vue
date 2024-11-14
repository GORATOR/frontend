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
    border: 3px solid $main_theme_dark;
    border-radius: 7px;
    background-color: $main_theme_dark;
    color: $main_theme_text_light;
    cursor: pointer;

    &:focus {
        outline: none;
        outline: medium solid #0085f26e;
        outline-width: 3px;
    }

    &:hover {
        background-color: $main_theme;
    }
}
</style>