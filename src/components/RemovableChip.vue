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

  <span :class="['removable-chip', props.chipClass]">
    {{ props.text }}
    <p @click="onClose">❌</p>
  </span>

</template>

<style scoped lang="scss">
.removable-chip {
  display: flex;
  flex-direction: row;
  align-items: center;
  p {
    margin-left: 14px;
    cursor: pointer;
  }
}
</style>