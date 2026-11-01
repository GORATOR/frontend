<script lang="ts">
  export const DEFAULT_LIMIT = 5;
</script>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
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
const selectBoxRef = ref<HTMLElement>();
const opensUp = ref(false);
const DROPDOWN_HEIGHT = 240; // matches .dropdown height in styles
const selectedOption = ref<SelectBoxOption | null>(null);
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement>();

const emit = defineEmits<{
  (e: 'changed', el: SelectBoxElement): void;
  (e: 'loadMore'): void;
  (e: 'search', query: string): void;
}>();


watch(model, (newValue) => {
  if (newValue) {
    const option = props.options.find(opt => opt.value === newValue);
    selectedOption.value = option || null;
  } else {
    selectedOption.value = null;
  }
}, { immediate: true });


const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.options;
  }
  return props.options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});


watch(filteredOptions, (newFilteredOptions) => {
  if (searchQuery.value.trim() && newFilteredOptions.length < 5 && props.hasMore && !props.loading) {
    nextTick(() => {
      emit('loadMore');
    });
  }
}, { immediate: false });

function updateDirection() {
  const rect = selectBoxRef.value?.getBoundingClientRect();
  if (!rect) return;
  const spaceBelow = window.innerHeight - rect.bottom;
  opensUp.value = spaceBelow < DROPDOWN_HEIGHT + 8 && rect.top > spaceBelow;
}

function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    updateDirection();
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  } else {
    searchQuery.value = '';
  }
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


let searchTimeout: ReturnType<typeof setTimeout>;

function onSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const query = searchQuery.value.trim();
    emit('search', query);
  }, 300);
}


function handleClickOutside(event: Event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}


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
    <div class="select-wrap">
      <div
        class="select-box"
        ref="selectBoxRef"
        :class="{ 'select-box--open': isOpen && !opensUp, 'select-box--open-up': isOpen && opensUp }"
        @click="toggleDropdown"
      >
        <div class="select-value" :class="{ 'select-value--placeholder': !selectedOption }">
          {{ selectedOption?.label || 'Select an option' }}
        </div>
        <div class="select-arrow" :class="{ 'select-arrow--open': isOpen }">▼</div>
      </div>

      <div v-if="isOpen" class="dropdown" :class="{ 'dropdown--up': opensUp }">
      <div class="search-container">
        <input 
          ref="searchInputRef"
          v-model="searchQuery"
          @input="onSearchInput"
          type="text"
          class="search-input"
          placeholder="Search..."
          @click.stop
        />
      </div>
      <div class="dropdown-list" @scroll="onScroll">
        <div 
          v-for="(option, index) in filteredOptions" 
          :key="option.value"
          class="dropdown-item"
          :class="{ 'dropdown-item--selected': selectedOption?.value === option.value }"
          @click="selectOption(option, index)"
        >
          {{ option.label }}
        </div>
        
        <div v-if="filteredOptions.length === 0 && searchQuery.trim() !== ''" class="dropdown-item dropdown-no-results">
          No results found
        </div>
        
        <div v-if="loading" class="dropdown-item dropdown-loading">
          Loading...
        </div>
        
        <div v-if="!hasMore && filteredOptions.length > 0 && !loading" class="dropdown-item dropdown-end">
          No more items
        </div>
      </div>
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
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 600;
    color: $text_secondary;
  }

  .select-wrap {
    position: relative;
  }

  .select-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 9px 12px;
    border-radius: $radius_md;
    border: 1px solid $border_color_strong;
    cursor: pointer;
    background: $card_background;
    font-size: 14px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:hover {
      border-color: $text_muted;
    }

    &--open {
      border-color: $main_theme_active_color;
      border-radius: $radius_md $radius_md 0 0;

      &:hover {
        border-color: $main_theme_active_color;
      }
    }

    &--open-up {
      border-color: $main_theme_active_color;
      border-radius: 0 0 $radius_md $radius_md;

      &:hover {
        border-color: $main_theme_active_color;
      }
    }

    .select-value {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: $text_primary;

      &--placeholder {
        color: $text_muted;
      }
    }

    .select-arrow {
      margin-left: 8px;
      transition: transform 0.3s ease;
      font-size: 10px;
      color: $text_muted;

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
    background: $card_background;
    border: 1px solid $border_color;
    border-radius: 0 0 $radius_lg $radius_lg;
    height: 240px;
    z-index: 1000;
    box-shadow: $shadow_lg;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &--up {
      top: auto;
      bottom: 100%;
      border-radius: $radius_lg $radius_lg 0 0;
    }

    .search-container {
      padding: 8px;
      border-bottom: 1px solid $border_color;

      .search-input {
        width: 100%;
        padding: 7px 10px;
        border: 1px solid $border_color_strong;
        border-radius: $radius_sm;
        font-size: 13px;

        &:focus {
          outline: none;
          border-color: $main_theme_active_color;
          box-shadow: $focus_ring;
        }
      }
    }

    .dropdown-list {
      flex: 1;
      overflow-y: auto;
      padding: 4px;
    }

    .dropdown-item {
      padding: 8px 10px;
      border-radius: $radius_sm;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        background-color: $surface_hover;
      }

      &--selected {
        background-color: rgba($main_theme_active_color, 0.1);
        color: $main_theme_active_color;
        font-weight: 600;

        &:hover {
          background-color: rgba($main_theme_active_color, 0.16);
        }
      }
    }

    .dropdown-loading,
    .dropdown-end,
    .dropdown-no-results {
      padding: 8px;
      text-align: center;
      color: $text_muted;
      font-size: 13px;
      font-style: italic;
      cursor: default;

      &:hover {
        background-color: transparent !important;
      }
    }
  }
}
</style>