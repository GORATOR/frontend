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
    display: inline-block;
    border: 1px solid $main_theme_table_border;
    border-radius: 5px;
    width: 30px;
    height: 30px;
    text-align: center;
    align-content: center;
    cursor: pointer;

    &.selected {
        border-color: $main_theme_active_color;
        color: $main_theme_active_color;
    }
}
</style>