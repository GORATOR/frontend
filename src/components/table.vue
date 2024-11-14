<script setup lang="ts">
const props = defineProps<{
    rows: string[],
}>()
</script>

<template>
    <div class="table">
        <div class="row header">
            <div class="cell">#</div>
            <div class="cell">Name</div>
        </div>
        <div v-for="(item, index) in props.rows" class="row">
            <div class="cell">{{ index + 1 }}</div>
            <div class="cell">{{ item }}</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use '../assets/variables' as *;

.table {
    display: table;
    width: 100%;
    border: 1px solid $main_theme_dark;
    border-radius: 5px;
    overflow: hidden;

    .row {
        display: table-row;

        &:nth-child(2n+1) {
            background-color: $main_theme_text_light;
        }

        &.header {
            color: $main_theme_text;
            background-color: $main_theme_dark;

            .cell {
                padding: 15px 10px;
            }
        }

        .cell {
            display: table-cell;
            padding: 10px;
        }
    }
}
</style>