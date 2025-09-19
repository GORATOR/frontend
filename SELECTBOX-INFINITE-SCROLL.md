# SelectBox Infinite Scroll + Search Feature

## 📋 Описание

Реализован улучшенный компонент `SelectBox` с двумя ключевыми функциями:
1. **Бесконечный скролл** - автоматическая подгрузка данных при прокрутке
2. **Умный поиск** - фильтрация по названию с подгрузкой недостающих записей из API

## 🎯 Решаемая проблема

**До**: 
- Компонент `SelectBox` загружал только первые 10 записей
- Отсутствовала возможность поиска по названию
- Ограниченные возможности при работе с большими списками

**После**: 
- ✅ Пользователи могут просматривать весь список с подгрузкой по 5 элементов
- ✅ Быстрый поиск по названию с автоматической подгрузкой из API
- ✅ Умная логика: если найдено < 5 результатов, запрос к API за недостающими

## ⚡ Реализованная функциональность

### 🔧 Технические улучшения

1. **Переработка компонента SelectBox**:
   - Замена стандартного HTML `<select>` на кастомный dropdown
   - Добавление поля поиска с автофокусом
   - Поддержка событий и состояний для пагинации и поиска
   - Улучшенный пользовательский интерфейс

2. **API компонента**:
   ```typescript
   interface Props {
     label: string;
     options: Array<SelectBoxOption>;
     loading?: boolean;    // Индикатор загрузки
     hasMore?: boolean;    // Есть ли еще данные
   }

   interface Events {
     'changed': (el: SelectBoxElement) => void;
     'loadMore': () => void;    // Событие для загрузки данных
     'search': (query: string) => void;    // Новое: событие поиска
   }
   ```

3. **Логика пагинации и поиска**:
   - Отслеживание позиции скролла (триггер на 5px от дна)
   - Управление состояниями загрузки (`loading`, `hasMore`)
   - **Дебаунс поиска 300ms** для оптимизации запросов
   - **Фильтрация загруженных элементов** по названию (case-insensitive)
   - **Умная подгрузка**: если результатов < 5, автоматический запрос к API
   - Накопление данных при подгрузке новых пачек с предотвращением дублирования

4. **API Integration**:
   ```typescript
   // Обновленные функции с поддержкой поиска
   loadOrganizations(loaded, offset, limit, search?)
   loadTeams(loaded, offset, limit, search?)
   loadUsers(loaded, offset, limit, search?)
   loadProjects(loaded, offset, limit, search?)
   
   // URL формат: /{endpoint}?limit={limit}&offset={offset}&search={encodedQuery}
   ```

### 🎨 UI/UX улучшения

- **Кастомный dropdown** с красивым дизайном и фиксированной высотой 200px
- **Поле поиска** с автоматическим фокусом при открытии dropdown
- **Анимированная стрелка** (поворот на 180° при открытии)
- **Hover эффекты** для элементов списка  
- **Расширенные индикаторы состояния**:
  - "Loading..." во время загрузки
  - "No results found" когда поиск не дал результатов
  - "No more items" когда данные закончились
- **Подсветка выбранного элемента**
- **Закрытие по клику вне области** с очисткой поискового запроса
- **Разделенная структура**: поле поиска сверху, прокручиваемый список снизу

## 📁 Затронутые файлы

### Основные изменения:
- `src/components/SelectBox.vue` - полная переработка компонента
- `src/pages/teams/create.vue` - интеграция с новым API
- `src/pages/projects/create.vue` - исправление типов

### Детали изменений:

#### `SelectBox.vue`
```vue
<!-- Новые пропсы -->
<SelectBox 
  :options="options" 
  :label="'Select organization'" 
  :loading="isLoadingMore"
  :hasMore="hasMore"
  @loadMore="loadMore"
  v-model="organizationId">
</SelectBox>
```

#### `teams/create.vue`
```typescript
// Новая логика пагинации
async function loadList(reset = false) {
  if (reset) {
    offset.value = 0
    options.value = []
    hasMore.value = true
  }

  if (isLoadingMore.value) return

  isLoadingMore.value = true
  const data = await loadOrganizations(loaded, offset.value)
  
  if (data.length > 0) {
    const newOptions = data.map(el => ({
      value: el.ID.toString(), 
      label: el.Name
    }))
    
    if (reset) {
      options.value = newOptions
    } else {
      options.value = [...options.value, ...newOptions]
    }
    
    offset.value += data.length
    hasMore.value = data.length === 10
  } else {
    hasMore.value = false
  }
  
  isLoadingMore.value = false
}
```

## 🚀 Как использовать

### Базовая функциональность:
1. **Откройте страницу создания команды**: `/teams/new`
2. **Кликните на поле "Select organization"** 
3. **Прокрутите список до конца** - автоматически подгрузятся следующие записи

### Функциональность поиска:
1. **Откройте SelectBox** - автоматически фокус на поле поиска
2. **Начните вводить название** - фильтрация среди загруженных элементов
3. **Подождите 300ms** - если результатов < 5, автоматический запрос к API
4. **Продолжайте скроллить** - подгрузка дополнительных результатов поиска
5. **"No results found"** если ничего не найдено

### Индикаторы состояния:
- "Loading..." - идет загрузка данных
- "No results found" - поиск не дал результатов  
- "No more items" - все данные загружены

## 🔧 Техническая реализация

### Алгоритм определения конца списка:
```typescript
function onScroll(event: Event) {
  const target = event.target as HTMLElement;
  const threshold = 5; // pixels from bottom
  
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - threshold) {
    if (props.hasMore && !props.loading) {
      emit('loadMore');
    }
  }
}
```

### Алгоритм поиска с дебаунсом:
```typescript
function onSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const query = searchQuery.value.trim();
    emit('search', query);
    
    // Если результатов < 5 и есть поисковый запрос, подгрузить из API
    if (query && filteredOptions.value.length < 5) {
      emit('loadMore');
    }
  }, 300); // 300ms debounce
}
```

### Фильтрация загруженных элементов:
```typescript
const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.options;
  }
  return props.options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
```

### Управление состоянием:
- `isLoadingMore` - предотвращает дублирующие запросы
- `hasMore` - определяет, есть ли еще данные для загрузки
- `offset` - текущая позиция для пагинации
- `currentSearchQuery` - текущий поисковый запрос для подгрузки
- `searchTimeout` - таймер для дебаунса поиска

## ✅ Тестирование

- ✅ TypeScript компиляция без ошибок
- ✅ Сборка проекта (`npm run build`)  
- ✅ Запуск dev сервера (`npm run dev`)
- ✅ Проверка функциональности в браузере

## 🔄 Совместимость

Изменения **обратно совместимы**:
- Существующий код продолжит работать
- Новые пропсы (`loading`, `hasMore`) опциональны
- События `changed` сохранили прежнее поведение

## 📝 Заметки для разработчиков

1. **Использование в других местах**: Компонент готов для использования везде, где нужен бесконечный скролл и поиск
2. **Настройка дебаунса**: Можно изменить значение `300ms` для настройки чувствительности поиска  
3. **Настройка threshold**: Можно изменить значение `threshold` для настройки чувствительности скролла
4. **Кастомизация стилей**: SCSS переменные позволяют легко изменить внешний вид
5. **API Requirements**: Backend должен поддерживать параметр `search` в query string
6. **URL Encoding**: Поисковые запросы автоматически кодируются для безопасности
7. **Предотвращение дублирования**: Новые элементы проверяются на уникальность перед добавлением

## 📊 Примеры сценариев использования

### Сценарий 1: Поиск среди загруженных элементов
1. Пользователь открывает список (загружается 5 элементов)
2. Вводит "Орг" → фильтруется среди 5 элементов
3. Найдено 2 результата → автоматический запрос к API за дополнительными

### Сценарий 2: Поиск с полной подгрузкой
1. Пользователь вводит "Новая" 
2. Среди загруженных найден 1 элемент
3. API запрос возвращает еще 4 → итого 5 элементов "Новая..."
4. Пользователь скроллит → подгружается еще 5 с тем же поиском

### Сценарий 3: Очистка поиска
1. Пользователь очищает поле поиска
2. Показываются все загруженные элементы (без фильтрации)
3. Скролл работает в обычном режиме

---

**Автор**: Claude Code  
**Дата**: 2025-09-13 (обновлено)  
**Ветка**: `feature/selectbox-infinite-scroll`  
**Версия**: 2.0 (добавлен поиск)