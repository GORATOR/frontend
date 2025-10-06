<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import MultiSelectBox, { DEFAULT_LIMIT, MultiSelectBoxElement } from '../components/MultiSelectBox.vue'
import Button from '../components/Button.vue'
import { SelectBoxOption } from '../models/SelectBoxOption.ts'
import { loadOrganizations } from '../service/loadList.ts'

const selectedValues = ref<string[]>([])
const loaded = ref(false)
const offset = ref(0)
const options = ref<Array<SelectBoxOption>>([])
const hasMore = ref(true)
const isLoadingMore = ref(false)
const currentSearchQuery = ref('')

async function loadList(reset = false, search = '') {
  if (reset) {
    offset.value = 0
    options.value = []
    hasMore.value = true
    currentSearchQuery.value = search
  }

  if (isLoadingMore.value) {
    return
  }

  isLoadingMore.value = true
  const data = await loadOrganizations(loaded, offset.value, DEFAULT_LIMIT, search)
  
  if (data.length > 0) {
    const newOptions = data.map(el => (<SelectBoxOption>{
      value: el.ID.toString(), 
      label: el.Name
    }))
    
    if (reset) {
      options.value = newOptions
    } else {
      const existingValues = new Set(options.value.map(opt => opt.value))
      const filteredNewOptions = newOptions.filter(opt => !existingValues.has(opt.value))
      options.value = [...options.value, ...filteredNewOptions]
    }
    
    offset.value += data.length
    hasMore.value = data.length === DEFAULT_LIMIT
  } else {
    hasMore.value = false
  }
  
  isLoadingMore.value = false
}

async function loadMore() {
  await loadList(false, currentSearchQuery.value)
}

async function handleSearch(query: string) {
  await loadList(true, query)
}

function handleChange(el: MultiSelectBoxElement) {
  console.log('Selected values:', el.values)
  console.log('Selected labels:', el.labels)
}

function clearSelection() {
  selectedValues.value = []
}

// Load initial data
loadList(true)
</script>

<template>
  <Sidebar>
    <h1>MultiSelectBox Demo</h1>
    
    <div class="demo-container">
      <MultiSelectBox 
        :options="options" 
        :label="'Select multiple organizations'" 
        :loading="isLoadingMore"
        :hasMore="hasMore"
        @loadMore="loadMore"
        @search="handleSearch"
        @changed="handleChange"
        v-model="selectedValues"
      />
      
      <div class="info-section">
        <h3>Selected Values:</h3>
        <pre>{{ selectedValues }}</pre>
        
        <Button @click="clearSelection">Clear Selection</Button>
      </div>
      
      <div class="instructions">
        <h3>Instructions:</h3>
        <ul>
          <li>Click on the select box to open the dropdown</li>
          <li>Click on any option to toggle selection (checkbox or entire row)</li>
          <li>Use the search field to filter options</li>
          <li>Scroll down to load more items</li>
          <li>Click the × button on chips to remove individual selections</li>
          <li>Click outside to close the dropdown</li>
        </ul>
      </div>
    </div>
  </Sidebar>
</template>

<style scoped lang="scss">
.demo-container {
  max-width: 600px;
  
  .info-section {
    margin-top: 20px;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 7px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 10px;
    }
    
    pre {
      background-color: white;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      margin-bottom: 15px;
    }
  }
  
  .instructions {
    margin-top: 20px;
    padding: 15px;
    background-color: #e8f4f8;
    border-radius: 7px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 10px;
    }
    
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 8px;
      }
    }
  }
}
</style>
