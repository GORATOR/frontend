# SelectBox Infinite Scroll Feature

## 📋 Описание

Реализован бесконечный скролл для компонента `SelectBox`, который позволяет пользователям просматривать большие списки данных с автоматической подгрузкой при прокрутке до конца списка.

## 🎯 Решаемая проблема

**До**: Компонент `SelectBox` загружал только первые 10 записей, ограничивая возможности пользователя при работе с большими списками организаций, команд и проектов.

**После**: Пользователи могут просматривать весь список данных с плавной подгрузкой следующих пачек при прокрутке.

## ⚡ Реализованная функциональность

### 🔧 Технические улучшения

1. **Переработка компонента SelectBox**:
   - Замена стандартного HTML `<select>` на кастомный dropdown
   - Добавление поддержки событий и состояний для пагинации
   - Улучшенный пользовательский интерфейс

2. **API компонента**:
   ```typescript
   interface Props {
     label: string;
     options: Array<SelectBoxOption>;
     loading?: boolean;    // Новое: индикатор загрузки
     hasMore?: boolean;    // Новое: есть ли еще данные
   }

   interface Events {
     'changed': (el: SelectBoxElement) => void;
     'loadMore': () => void;    // Новое: событие для загрузки данных
   }
   ```

3. **Логика пагинации**:
   - Отслеживание позиции скролла (триггер на 5px от дна)
   - Управление состояниями загрузки (`loading`, `hasMore`)
   - Накопление данных при подгрузке новых пачек

### 🎨 UI/UX улучшения

- **Кастомный dropdown** с красивым дизайном
- **Анимированная стрелка** (поворот на 180° при открытии)
- **Hover эффекты** для элементов списка  
- **Индикаторы состояния**:
  - "Loading..." во время загрузки
  - "No more items" когда данные закончились
- **Подсветка выбранного элемента**
- **Закрытие по клику вне области**

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

1. **Откройте страницу создания команды**: `/teams/new`
2. **Кликните на поле "Select organization"** 
3. **Прокрутите список до конца** - автоматически подгрузятся следующие записи
4. **Наблюдайте индикаторы**: "Loading..." и "No more items"

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

### Управление состоянием:
- `isLoadingMore` - предотвращает дублирующие запросы
- `hasMore` - определяет, есть ли еще данные для загрузки
- `offset` - текущая позиция для пагинации

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

1. **Использование в других местах**: Компонент готов для использования везде, где нужен бесконечный скролл
2. **Настройка threshold**: Можно изменить значение `threshold` для настройки чувствительности скролла
3. **Кастомизация стилей**: SCSS переменные позволяют легко изменить внешний вид
4. **Добавление поиска**: В будущем легко добавить поиск по элементам списка

---

**Автор**: Claude Code  
**Дата**: 2025-09-12  
**Ветка**: `feature/selectbox-infinite-scroll`