<script setup lang="ts">
import {router} from "../router.ts";

const props = defineProps<{
  headers: string[],
  rows: any[],
  sortable?: boolean
}>()

const emit = defineEmits<{
  (e: 'sort', header: string): void
}>()

function handleHeaderClick(header: string) {
  if (props.sortable) {
    emit('sort', header)
  }
}

function onItemClick(url: string) {
  router.push({path:url});
}
</script>

<template>
  <div class="table">
    <div class="row header">
      <div
          class="cell"
          v-for="header in props.headers"
          :class="{ sortable: props.sortable }"
          @click="handleHeaderClick(header)"
      >
        {{ header }}
      </div>
    </div>
    <div v-for="item in props.rows" class="row data">
      <div class="cell" v-for="header in props.headers">
        <a @click.prevent="onItemClick(item.url)" v-if="item.url !== undefined" :href="item.url">{{ item[header] }}</a>
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
  border: 1px solid $border_color;
  border-radius: $radius_lg;
  overflow: hidden;
  background: $card_background;
  box-shadow: $shadow_sm;

  .row {
    display: table-row;

    &.header {
      background-color: $surface_subtle;

      .cell {
        display: table-cell;
        border-top: none;
        padding: 12px 16px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: $text_secondary;

        &.sortable {
          cursor: pointer;
          user-select: none;

          &:hover {
            color: $main_theme_active_color;
          }
        }
      }
    }

    &.data {
      transition: background-color 0.12s ease;

      &:hover .cell {
        background-color: $surface_subtle;
      }

      .cell {
        display: table-cell;
        border-top: 1px solid $border_color;
        padding: 12px 16px;
        font-weight: normal;
      }
    }
  }
}
</style>