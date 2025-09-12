<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import {SelectBoxOption} from "../models/SelectBoxOption.ts";

export interface SelectBoxElement {
  index: number,
  name: string,
  value: string
}

const props = defineProps<{
  label: string,
  options: Array<SelectBoxOption>,
  loading?: boolean,
  hasMore?: boolean,
}>();

const model = defineModel<string>();
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement>();
const selectedOption = ref<SelectBoxOption | null>(null);

const emit = defineEmits<{
  (e: 'changed', el: SelectBoxElement): void;
  (e: 'loadMore'): void;
}>();

// Watch model changes to update selected option
watch(model, (newValue) => {
  if (newValue) {
    const option = props.options.find(opt => opt.value === newValue);
    selectedOption.value = option || null;
  } else {
    selectedOption.value = null;
  }
}, { immediate: true });

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function selectOption(option: SelectBoxOption, index: number) {
  model.value = option.value;
  selectedOption.value = option;
  isOpen.value = false;
  
  const el = <SelectBoxElement>{
    index,
    name: option.label,
    value: option.value
  };
  emit('changed', el);
}

function onScroll(event: Event) {
  const target = event.target as HTMLElement;
  const threshold = 5; // pixels from bottom
  
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - threshold) {
    if (props.hasMore && !props.loading) {
      emit('loadMore');
    }
  }
}

// Close dropdown when clicking outside
function handleClickOutside(event: Event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

// Add/remove event listener for clicking outside
watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      document.addEventListener('click', handleClickOutside);
    });
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

</script>

<template>
  <div class="textbox-container" ref="dropdownRef">
    <label class="label">{{ props.label }}</label>
    <div class="select-box" @click="toggleDropdown">
      <div class="select-value">
        {{ selectedOption?.label || 'Select an option' }}
      </div>
      <div class="select-arrow" :class="{ 'select-arrow--open': isOpen }">▼</div>
    </div>
    
    <div v-if="isOpen" class="dropdown" @scroll="onScroll">
      <div 
        v-for="(option, index) in options" 
        :key="option.value"
        class="dropdown-item"
        :class="{ 'dropdown-item--selected': selectedOption?.value === option.value }"
        @click="selectOption(option, index)"
      >
        {{ option.label }}
      </div>
      
      <div v-if="loading" class="dropdown-item dropdown-loading">
        Loading...
      </div>
      
      <div v-if="!hasMore && options.length > 0" class="dropdown-item dropdown-end">
        No more items
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;
.textbox-container {
  padding: 5px 0;
  position: relative;

  .label {
    display: block;
    margin-bottom: 4px;
  }

  .select-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 7px;
    border-radius: 7px;
    border: 1px solid $main_theme_background_lighter1;
    cursor: pointer;
    background: white;
    
    &:hover {
      border-color: $main_theme_active_color;
    }

    .select-value {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .select-arrow {
      margin-left: 8px;
      transition: transform 0.3s ease;
      font-size: 12px;
      color: #666;
      
      &--open {
        transform: rotate(180deg);
      }
    }
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid $main_theme_background_lighter1;
    border-top: none;
    border-radius: 0 0 7px 7px;
    max-height: 100px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .dropdown-item {
      padding: 8px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      &--selected {
        background-color: $main_theme_active_color;
        color: white;
        
        &:hover {
          background-color: $main_theme_active_color;
        }
      }
      
      &:last-child {
        border-bottom: none;
      }
    }

    .dropdown-loading,
    .dropdown-end {
      padding: 8px;
      text-align: center;
      color: #666;
      font-style: italic;
      cursor: default;
      
      &:hover {
        background-color: transparent !important;
      }
    }
  }
}
</style>