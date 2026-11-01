<script setup lang="ts">
import {ref} from 'vue';

const props = defineProps<{
  title: string
  defaultExpanded?: boolean
}>();

const isExpanded = ref(props.defaultExpanded ?? true);

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div class="detail-section">
    <div class="section-header" @click="toggleExpanded">
      <h3>{{ title }}</h3>
      <span class="toggle-icon" :class="{ 'expanded': isExpanded }">▼</span>
    </div>
    <div v-show="isExpanded" class="section-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;

.detail-section {
  background: $card_background;
  border: 1px solid $border_color;
  border-radius: $radius_lg;
  margin-bottom: 20px;
  box-shadow: $shadow_sm;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-radius: $radius_lg;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: $surface_subtle;
    }

    h3 {
      margin: 0;
      color: $main_theme_background;
      font-size: 15px;
      font-weight: 700;
    }

    .toggle-icon {
      font-size: 10px;
      color: $text_muted;
      transition: transform 0.3s ease;

      &.expanded {
        transform: rotate(0deg);
      }

      &:not(.expanded) {
        transform: rotate(-90deg);
      }
    }
  }

  .section-content {
    padding: 4px 20px 20px 20px;
    border-top: 1px solid $border_color;
  }
}
</style>
