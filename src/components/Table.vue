<script setup lang="ts">
const props = defineProps<{
    headers: string[],
    rows: any[]
}>()
</script>

<template>
    <div class="table">
        <div class="row header">
            <div class="cell" v-for="header in props.headers">{{ header }}</div>
        </div>
        <div v-for="item in props.rows" class="row data">
            <div class="cell" v-for="header in props.headers">
              <a v-if="item.url !== undefined" :href="item.url">{{ item[header] }}</a>
              <div v-if="item.url === undefined">{{ item[header] }}</div>
            </div>
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
                display: table-cell;
                border-top: none;
                padding: 15px 10px;
            }
        }

        &.data .cell {
            display: table-cell;
            border-top: 1px solid $main_theme_border_color;
            padding: 10px;
            font-weight: normal;

            // &:first-child {
            //     width: 20px;
            // }

            // &.index {
            //     color: $main_theme_border_color_darker1;
            // }
        }
    }
}
</style>