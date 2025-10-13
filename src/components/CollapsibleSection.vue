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
  background: white;
  border: 1px solid $main_theme_background_lighter1;
  border-radius: 8px;
  margin-bottom: 20px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f8f9fa;
    }

    h3 {
      margin: 0;
      color: $main_theme_active_color;
      font-size: 18px;
    }

    .toggle-icon {
      font-size: 12px;
      color: #666;
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
    padding: 0 20px 20px 20px;
    border-top: 2px solid $main_theme_background_lighter1;
  }
}
</style>
