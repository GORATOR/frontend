<script setup lang="ts">
const props = defineProps<{
    rows: string[],
    indexOffset?: number
}>()
</script>

<template>
    <div class="table">
        <div class="row header">
            <div class="cell">#</div>
            <div class="cell">Name</div>
        </div>
        <div v-for="(item, index) in props.rows" class="row">
            <div class="cell index">{{ (props.indexOffset ?? 0) + index + 1 }}</div>
            <div class="cell">{{ item }}</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use '../assets/variables' as *;

.table {
    display: table;
    width: 100%;
    border: 1px solid $main_theme_border_color;
    border-radius: 5px;
    overflow: hidden;

    .row {
        display: table-row;

        // &:nth-child(2n+1) {
        //     background-color: red;
        // }

        &.header {
            color: $main_theme_border_color_darker1;
            background-color: $main_theme_border_color_lighter1;

            .cell {
                border-top: none;
                padding: 15px 10px;
            }
        }

        .cell {
            display: table-cell;
            border-top: 1px solid $main_theme_border_color;
            padding: 10px;

            &:first-child {
                width: 20px;
            }

            &.index {
                color: $main_theme_border_color_darker1;
            }
        }
    }
}
</style>