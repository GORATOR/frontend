<script setup lang="ts">
import Button from "./Button.vue";
import {computed, ref} from "vue";
const show = ref<boolean>(false);

const copy = ref<boolean>(false);

const props = defineProps<{
  value: string,
}>();

const maskedValue = computed(() => {
  if (!props.value) return '';
  return '•'.repeat(props.value.length);
});

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.value);
    copy.value = true;
    setTimeout(() => {
      copy.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}
</script>

<template>
  <div class="field-value masked-input-container">
    <input
        type="text"
        :value="show ? value : maskedValue"
        readonly
        class="masked-input"
        @focus="show = true"
        @blur="show = false"
    />
    <Button
        @click="copyToClipboard"
        class="copy-button"
        :class="{ 'copied': copy }"
        type="button"
        title="Copy to clipboard">
      <span v-if="!copy">📋</span>
      <span v-else>✓</span>
    </Button>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;
.masked-input-container {
  display: flex;
  gap: 8px;
  align-items: center;

  .masked-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid $main_theme_background_lighter1;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    background: #f8f9fa;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: $main_theme_active_color;
      background: white;
      box-shadow: 0 0 0 2px rgba($main_theme_active_color, 0.1);
    }
  }

  .copy-button {
    padding: 8px 12px;
    border: 1px solid $main_theme_background_lighter1;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;

    &:hover {
      background: $main_theme_active_color;
      border-color: $main_theme_active_color;
      transform: scale(1.05);
    }

    &.copied {
      background: #28a745;
      border-color: #28a745;
      color: white;
    }
  }
}
</style>