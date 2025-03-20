<script setup lang="ts">
import {SelectBoxOption} from "../models/SelectBoxOption.ts";

const props = defineProps<{
  label: string,
  options: Array<SelectBoxOption>,
}>();

const model = defineModel<number>()

</script>

<template>
  <div class="textbox-container">
    <label class="label">
      {{ props.label }}
      <select class="select-box" v-model="model">
        <option disabled value=""></option>
        <option v-for="option in props.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>
  </div>

</template>

<style scoped lang="scss">
@use '../assets/variables' as *;
.textbox-container {
  padding: 5px 0;

  .label {
    display: block;
  }

  .select-box {
    display: block;
    width: 100%;
    padding: 7px;
    border-radius: 7px;
    border-style: solid;
    border-color: $main_theme_background_lighter1;
  }

  .select-box:focus {
    border-color: $main_theme_active_color;
    outline: medium solid $main_theme_active_color_lighter3;
  }
}
</style>