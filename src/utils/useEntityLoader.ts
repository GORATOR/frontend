import { ref, Ref } from 'vue';
import { SelectBoxOption } from '../models/SelectBoxOption.ts';

export interface EntityLoaderConfig<T> {
  loadFunction: (loaded: Ref<boolean>, offset: number, limit: number, search: string) => Promise<T[]>;
  mapToOption: (entity: T) => SelectBoxOption;
  limit?: number;
}

export interface EntityLoaderState {
  offset: Ref<number>;
  options: Ref<SelectBoxOption[]>;
  hasMore: Ref<boolean>;
  isLoading: Ref<boolean>;
  currentSearch: Ref<string>;
}

export interface EntityLoaderActions {
  loadData: (reset?: boolean, search?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  handleSearch: (query: string) => Promise<void>;
}

export type EntityLoader = EntityLoaderState & EntityLoaderActions;

/**
 * Universal composable for loading entities with pagination and search
 * @param config Configuration object with load function and mapping function
 * @returns Object with state and actions for entity loading
 */
export function useEntityLoader<T>(config: EntityLoaderConfig<T>): EntityLoader {
  const { loadFunction, mapToOption, limit = 5 } = config;

  // State
  const offset = ref(0);
  const options = ref<SelectBoxOption[]>([]);
  const hasMore = ref(true);
  const isLoading = ref(false);
  const currentSearch = ref('');
  const loaded = ref(false);

  // Actions
  async function loadData(reset = false, search = '') {
    if (reset) {
      offset.value = 0;
      options.value = [];
      hasMore.value = true;
      currentSearch.value = search;
    }

    if (isLoading.value) return;

    isLoading.value = true;

    try {
      const data = await loadFunction(loaded, offset.value, limit, search);

      if (data.length > 0) {
        const newOptions = data.map(mapToOption);

        if (reset) {
          options.value = newOptions;
        } else {
          // Avoid duplicates
          const existingValues = new Set(options.value.map(opt => opt.value));
          const filteredNewOptions = newOptions.filter(opt => !existingValues.has(opt.value));
          options.value = [...options.value, ...filteredNewOptions];
        }

        offset.value += data.length;
        hasMore.value = data.length === limit;
      } else {
        hasMore.value = false;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      hasMore.value = false;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadMore() {
    await loadData(false, currentSearch.value);
  }

  async function handleSearch(query: string) {
    await loadData(true, query);
  }

  return {
    // State
    offset,
    options,
    hasMore,
    isLoading,
    currentSearch,
    // Actions
    loadData,
    loadMore,
    handleSearch
  };
}
