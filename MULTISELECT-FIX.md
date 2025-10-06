# MultiSelectBox - Исправление проблемы с выбором элементов

## Проблема

При использовании множественного выбора в выпадающем списке возникали следующие проблемы:
- Не всегда возможно отметить элемент по клику
- При клике элемент не выбирается
- Выбираются не все элементы из тех, по которым был клик

## Причины проблемы

1. **Всплытие событий (Event Bubbling)** - клик по элементу списка всплывал до родительского контейнера, что могло вызывать закрытие dropdown
2. **Конфликт событий** - одновременная обработка клика на checkbox и на родительском элементе
3. **Отсутствие `preventDefault`** - событие `mousedown` могло вызывать потерю фокуса
4. **Неправильная синхронизация состояния** - состояние модели не всегда корректно обновлялось

## Решение

### 1. Предотвращение всплытия событий

```vue
<div 
  class="dropdown-item"
  @click.stop="toggleOption(option, $event)"
  @mousedown.prevent
>
```

- `@click.stop` - останавливает всплытие события клика
- `@mousedown.prevent` - предотвращает стандартное поведение mousedown

### 2. Явная передача события

```typescript
function toggleOption(option: SelectBoxOption, event: Event) {
  // Prevent event bubbling to avoid closing dropdown
  event.stopPropagation();
  
  // ... логика выбора
}
```

### 3. Защита dropdown от закрытия

```vue
<div v-if="isOpen" class="dropdown" @click.stop>
  <!-- Контент dropdown -->
</div>
```

Добавлен `@click.stop` на сам dropdown, чтобы клики внутри не закрывали его.

### 4. Корректная работа с массивом значений

```typescript
const currentValues = [...model.value]; // Создаем копию массива
const index = currentValues.indexOf(option.value);

if (index > -1) {
  currentValues.splice(index, 1); // Удаляем
} else {
  currentValues.push(option.value); // Добавляем
}

model.value = currentValues; // Обновляем модель
```

### 5. User-select: none

```scss
.select-box {
  user-select: none; // Предотвращает выделение текста при клике
}

.dropdown-item {
  user-select: none; // Предотвращает выделение текста в списке
}
```

## Ключевые улучшения

### Надежность выбора
- ✅ Каждый клик гарантированно обрабатывается
- ✅ Нет конфликтов между checkbox и родительским элементом
- ✅ Dropdown не закрывается при выборе элементов

### UX улучшения
- ✅ Визуальные чипы для выбранных элементов
- ✅ Счетчик выбранных элементов
- ✅ Возможность удалить элемент через чип
- ✅ Checkbox для визуальной индикации выбора

### Производительность
- ✅ Дедупликация опций при загрузке
- ✅ Debounce для поиска (300ms)
- ✅ Ленивая загрузка (infinite scroll)

## Использование

```vue
<script setup lang="ts">
import { ref } from 'vue'
import MultiSelectBox from '../components/MultiSelectBox.vue'

const selectedValues = ref<string[]>([])
const options = ref([
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
])

function handleChange(el) {
  console.log('Selected:', el.values, el.labels)
}
</script>

<template>
  <MultiSelectBox 
    :options="options" 
    :label="'Select multiple items'" 
    @changed="handleChange"
    v-model="selectedValues"
  />
</template>
```

## Демо

Для тестирования компонента создана демо-страница:
- URL: `/multiselect-demo`
- Показывает все возможности компонента
- Интеграция с реальным API (загрузка организаций)

## API компонента

### Props
- `label: string` - метка поля
- `options: SelectBoxOption[]` - список опций
- `loading?: boolean` - индикатор загрузки
- `hasMore?: boolean` - есть ли еще данные для загрузки

### Events
- `@changed` - вызывается при изменении выбора
- `@loadMore` - вызывается при необходимости загрузить больше данных
- `@search` - вызывается при поиске (с debounce 300ms)

### v-model
- `v-model: string[]` - массив выбранных значений

## Тестирование

Для проверки исправления:

1. Откройте `/multiselect-demo`
2. Кликните по любому элементу списка - он должен выбраться
3. Кликните еще раз - он должен отменить выбор
4. Попробуйте быстро кликать по разным элементам - все должны корректно выбираться
5. Используйте поиск - выбор должен работать и с отфильтрованными элементами
6. Прокрутите список вниз - новые элементы должны загружаться и выбираться корректно

## Технические детали

### Предотвращение race conditions
- Используется флаг `isLoadingMore` для предотвращения параллельных загрузок
- Копирование массива перед изменением для избежания мутаций

### Управление фокусом
- Автоматический фокус на поле поиска при открытии
- Сохранение фокуса внутри dropdown

### Обработка кликов вне компонента
- Listener добавляется только когда dropdown открыт
- Правильная очистка listener при закрытии
