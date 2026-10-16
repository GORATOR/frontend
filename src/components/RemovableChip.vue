<script setup lang="ts">

const emit = defineEmits<{
  (e: 'onClose', value: string): void;
}>();

const props = defineProps<{
  text: string,
  payload: string,
  chipClass: string
}>();

function onClose() : void {
  emit('onClose', props.payload);
}

</script>

<template>

  <div :class="['removable-chip', props.chipClass]">
    <span class="chip-text">{{ props.text }}</span>
    <span class="chip-remove" @click="onClose">×</span>
  </div>

</template>

<style scoped lang="scss">
@use '../assets/variables' as *;

.removable-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px 3px 10px;
  border: 1px solid $border_color;
  border-radius: 999px;
  background: $surface_subtle;
  font-size: 13px;
  color: $text_primary;

  .chip-remove {
    display: grid;
    place-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    color: $text_muted;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background: rgba($color_danger, 0.12);
      color: $color_danger;
    }
  }
}
</style>
