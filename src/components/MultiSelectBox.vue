<script lang="ts">
  export const DEFAULT_LIMIT = 5;
</script>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { SelectBoxOption } from "../models/SelectBoxOption.ts";

export interface MultiSelectBoxElement {
  values: string[],
  labels: string[]
}

const props = defineProps<{
  label: string,
  options: Array<SelectBoxOption>,
  loading?: boolean,
  hasMore?: boolean,
}>();

const model = defineModel<string[]>({ default: [] });
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement>();
const selectedOptions = ref<SelectBoxOption[]>([]);
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement>();

const emit = defineEmits<{
  (e: 'changed', el: MultiSelectBoxElement): void;
  (e: 'loadMore'): void;
  (e: 'search', query: string): void;
}>();

// Sync selected options with model
watch(model, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    selectedOptions.value = props.options.filter(opt => newValue.includes(opt.value));
  } else {
    selectedOptions.value = [];
  }
}, { immediate: true, deep: true });

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

function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  } else {
    searchQuery.value = '';
  }
}

function toggleOption(option: SelectBoxOption, event: Event) {
  // Prevent event bubbling to avoid closing dropdown
  event.stopPropagation();
  
  if (!model.value) {
    model.value = [];
  }
  
  const currentValues = [...model.value];
  const index = currentValues.indexOf(option.value);
  
  if (index > -1) {
    // Remove from selection
    currentValues.splice(index, 1);
  } else {
    // Add to selection
    currentValues.push(option.value);
  }
  
  model.value = currentValues;
  
  // Update selected options
  selectedOptions.value = props.options.filter(opt => currentValues.includes(opt.value));
  
  // Emit change event
  const el: MultiSelectBoxElement = {
    values: currentValues,
    labels: selectedOptions.value.map(opt => opt.label)
  };
  emit('changed', el);
}

function isSelected(value: string): boolean {
  return model.value?.includes(value) || false;
}

function removeOption(value: string) {
  if (!model.value) return;
  
  const currentValues = model.value.filter(v => v !== value);
  model.value = currentValues;
  
  selectedOptions.value = props.options.filter(opt => currentValues.includes(opt.value));
  
  const el: MultiSelectBoxElement = {
    values: currentValues,
    labels: selectedOptions.value.map(opt => opt.label)
  };
  emit('changed', el);
}

function onScroll(event: Event) {
  const target = event.target as HTMLElement;
  const threshold = 5;
  
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
    searchQuery.value = '';
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
  <div class="multiselect-container" ref="dropdownRef">
    <label class="label">{{ props.label }}</label>
    
    <!-- Selected items display -->
    <div class="selected-items" v-if="selectedOptions.length > 0">
      <div 
        v-for="option in selectedOptions" 
        :key="option.value"
        class="selected-chip"
      >
        {{ option.label }}
        <span class="remove-btn" @click.stop="removeOption(option.value)">×</span>
      </div>
    </div>
    
    <!-- Select box trigger -->
    <div class="select-box" @click="toggleDropdown">
      <div class="select-value">
        {{ selectedOptions.length > 0 ? `${selectedOptions.length} selected` : 'Select options' }}
      </div>
      <div class="select-arrow" :class="{ 'select-arrow--open': isOpen }">▼</div>
    </div>
    
    <!-- Dropdown -->
    <div v-if="isOpen" class="dropdown" @click.stop>
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
          v-for="option in filteredOptions" 
          :key="option.value"
          class="dropdown-item"
          :class="{ 'dropdown-item--selected': isSelected(option.value) }"
          @click.stop="toggleOption(option, $event)"
          @mousedown.prevent
        >
          <input 
            type="checkbox" 
            :checked="isSelected(option.value)"
            class="checkbox"
            @click.stop
          />
          <span class="option-label">{{ option.label }}</span>
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
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;

.multiselect-container {
  padding: 5px 0;
  position: relative;

  .label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
  }

  .selected-items {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
    
    .selected-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      background-color: $main_theme_active_color;
      color: white;
      border-radius: 4px;
      font-size: 14px;
      
      .remove-btn {
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        font-weight: bold;
        
        &:hover {
          color: #ffcccc;
        }
      }
    }
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
    user-select: none;
    
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
    max-height: 250px;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;

    .search-container {
      padding: 8px;
      border-bottom: 1px solid #f0f0f0;
      
      .search-input {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        
        &:focus {
          outline: none;
          border-color: $main_theme_active_color;
          box-shadow: 0 0 0 2px rgba($main_theme_active_color, 0.2);
        }
      }
    }

    .dropdown-list {
      flex: 1;
      overflow-y: auto;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      user-select: none;
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      &--selected {
        background-color: rgba($main_theme_active_color, 0.1);
        
        &:hover {
          background-color: rgba($main_theme_active_color, 0.15);
        }
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .checkbox {
        cursor: pointer;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
      
      .option-label {
        flex: 1;
      }
    }

    .dropdown-loading,
    .dropdown-end,
    .dropdown-no-results {
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
