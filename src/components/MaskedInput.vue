<script setup lang="ts">
import CopyIcon from "../icons/CopyIcon.vue";
import CheckIcon from "../icons/CheckIcon.vue";
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
    <button
        @click="copyToClipboard"
        class="copy-button"
        :class="{ 'copied': copy }"
        type="button"
        title="Copy to clipboard">
      <CheckIcon v-if="copy" />
      <CopyIcon v-else />
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;
.masked-input-container {
  display: flex;
  gap: 8px;
  align-items: stretch;

  .masked-input {
    flex: 1;
    min-width: 0;
    padding: 9px 12px;
    border: 1px solid $border_color;
    border-radius: $radius_md;
    font-family: $font_mono;
    font-size: 13px;
    color: $text_secondary;
    background: $surface_subtle;
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;

    &:focus {
      outline: none;
      border-color: $main_theme_active_color;
      background: $card_background;
      color: $text_primary;
      box-shadow: $focus_ring;
    }
  }

  .copy-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 38px;
    padding: 0 10px;
    border: 1px solid $border_color_strong;
    border-radius: $radius_md;
    background: $card_background;
    color: $text_secondary;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      border-color: $main_theme_active_color;
      color: $main_theme_active_color;
      background: rgba($main_theme_active_color, 0.06);
    }

    &.copied {
      border-color: $color_success;
      background: $color_success;
      color: white;
    }
  }
}
</style>
