# Shared Hooks Documentation

Коллекция переиспользуемых React hooks для Chronoline приложения.

## Data Fetching Hooks

### useEntityQuery

Универсальный хук для загрузки данных с кэшированием, retry логикой и автоматической отменой запросов.

```typescript
const { data, isLoading, error, refetch } = useEntityQuery<Person>({
  endpoint: '/api/persons',
  filters: { category: 'scientists', limit: 100 },
  enabled: true,
  transform: (rawData) => rawData.map(transformPerson),
  cacheKey: 'persons-scientists', // optional
  cacheTime: 60000, // optional, default 60s
})
```

**Параметры:**
- `endpoint` - API endpoint (string)
- `filters` - объект с фильтрами (object)
- `enabled` - включить/выключить запрос (boolean, default: true)
- `transform` - функция преобразования данных (function, optional)
- `cacheKey` - ключ кэша (string, optional)
- `cacheTime` - время жизни кэша в мс (number, default: 60000)

**Возвращает:**
- `data` - массив данных (T[])
- `isLoading` - состояние загрузки (boolean)
- `error` - ошибка если есть (Error | null)
- `refetch` - функция для повторной загрузки (() => void)

**Особенности:**
- Автоматическое кэширование по endpoint + filters
- Отмена запроса при unmount или изменении dependencies
- Retry логика (2 попытки с exponential backoff)
- Timeout (10 секунд)

### useApiData

Более низкоуровневый хук для API запросов с пагинацией.

```typescript
const [state, actions] = useApiData({
  endpoint: '/api/persons/mine',
  enabled: true,
  pageSize: 50,
  queryParams: { status: 'approved' }
})

// state: { items, isLoading, hasMore, isInitialLoading }
// actions: { loadMore, reset }
```

### useFilters

Управление состоянием фильтров с сохранением в localStorage.

```typescript
const {
  filters,              // FiltersState
  setFilters,           // (filters) => void
  groupingType,         // 'category' | 'country' | 'none'
  setGroupingType,      // (type) => void
  yearInputs,           // { start: string, end: string }
  setYearInputs,        // (inputs) => void
  applyYearFilter,      // (field, value) => void
  handleYearKeyPress,   // (field, event) => void
  resetAllFilters,      // () => void
  parseYearValue        // (value, default) => number
} = useFilters()
```

**Автоматически сохраняет:**
- Фильтры в `localStorage` ключ `chrononinja-filters`
- Группировку в `localStorage` ключ `chrononinja-grouping`

## UI Hooks

### useTooltip

Управление состоянием tooltip с задержкой показа.

```typescript
const {
  hoveredPerson,
  mousePosition,
  showTooltip,
  hoveredAchievement,
  showAchievementTooltip,
  hoverTimerRef,
  handlePersonHover,
  handleAchievementHover
} = useTooltip()
```

### useSlider

Обработка drag для слайдеров.

```typescript
const {
  isDraggingSlider,
  handleSliderMouseDown,
  handleSliderMouseMove,
  handleSliderMouseUp
} = useSlider()
```

### useMobile

Определение мобильного устройства.

```typescript
const isMobile = useMobile()
```

## Feature-Specific Hooks

### useTimelineData

Загрузка данных для временной линии.

```typescript
const { persons, allCategories, allCountries, isLoading } = useTimelineData(filters, enabled)
```

Использует `useEntityQuery` внутри для оптимизированной загрузки.

### useQuizData

Загрузка данных для квиза.

```typescript
const { persons, allCategories, allCountries, isLoading } = useQuizData(filters, enabled)
```

Аналогичен `useTimelineData` но с дополнительной фильтрацией для квиза.

### useQuiz

Управление состоянием игры-квиза.

```typescript
const {
  setup,                // QuizSetupConfig
  setSetup,             // (config) => void
  questions,            // QuizQuestion[]
  currentQuestionIndex, // number
  answers,              // QuizAnswer[]
  isQuizActive,         // boolean
  filteredPersons,      // Person[]
  startQuiz,            // () => boolean
  answerQuestion,       // (answer) => void
  nextQuestion,         // () => void
  getResults,           // () => QuizResult
  resetQuiz,            // () => void
  showAnswer,           // boolean
  lastAnswer,           // QuizAnswer | null
  allCategories,        // string[]
  allCountries,         // string[]
  checkStrictFilters    // (setup) => string[]
} = useQuiz(persons, allCategories, allCountries)
```

### useManageState

Централизованное управление state для ManagePage.

```typescript
const state = useManageState()
// Возвращает все state переменные и setters для manage page
```

### useManageModals

Управление модальными окнами для ManagePage.

```typescript
const modals = useManageModals()
// Возвращает все modal state и setters
```

### useManageBusinessLogic

Бизнес-логика (useEffect hooks) для ManagePage.

```typescript
const { countrySelectOptions, categorySelectOptions } = useManageBusinessLogic(params)
```

## Best Practices

### 1. Используйте правильный хук для задачи

```typescript
// ✅ Для GET запросов
const { data } = useEntityQuery({ endpoint, filters })

// ✅ Для mutations
await createPerson(payload)

// ❌ Не используйте useEntityQuery для mutations
```

### 2. Мемоизируйте фильтры

```typescript
const filters = useMemo(() => ({
  category: selectedCategory,
  country: selectedCountry
}), [selectedCategory, selectedCountry])

const { data } = useEntityQuery({ endpoint, filters })
```

### 3. Управляйте enabled флагом

```typescript
// Загружать только когда нужно
const { data } = useEntityQuery({
  endpoint: '/api/persons',
  enabled: isAuthenticated && selectedTab === 'persons'
})
```

### 4. Используйте transform для нормализации

```typescript
const { data } = useEntityQuery({
  endpoint: '/api/persons',
  transform: (rawData) => rawData.map(person => ({
    ...person,
    name: decodeURI(person.name),
    fullName: `${person.name} (${person.birthYear}-${person.deathYear})`
  }))
})
```

## Common Patterns

### Loading States

```typescript
const { data, isLoading, error } = useEntityQuery(options)

if (isLoading) return <Spinner />
if (error) return <ErrorMessage error={error} />
return <DataDisplay data={data} />
```

### Filters with Debouncing

```typescript
const [searchQuery, setSearchQuery] = useState('')
const [debouncedQuery, setDebouncedQuery] = useState('')

useEffect(() => {
  const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
  return () => clearTimeout(timer)
}, [searchQuery])

const { data } = useEntityQuery({
  filters: { q: debouncedQuery }
})
```

### Pagination

```typescript
const [state, { loadMore }] = useApiData({ endpoint, pageSize: 50 })

return (
  <>
    <List items={state.items} />
    {state.hasMore && (
      <button onClick={loadMore} disabled={state.isLoading}>
        Загрузить еще
      </button>
    )}
  </>
)
```

## Performance Monitoring Hooks

### usePerformanceMonitor

Мониторит производительность рендеров компонента в dev mode.

```typescript
function MyComponent() {
  usePerformanceMonitor({ 
    componentName: 'MyComponent',
    enabled: true // optional, default true
  })
  
  return <div>Content</div>
}
```

**Что логируется:**
- Медленные рендеры (>16ms)
- Количество рендеров (каждые 10 рендеров)
- Время жизни компонента при unmount

**Доступ через dev tools:**
```javascript
// В консоли браузера
window.__performanceUtils.printReport() // Распечатать отчет
window.__performanceUtils.getStats()    // Получить статистику
window.__performanceUtils.clear()       // Очистить данные
```

### ProfilerWrapper

Компонент-обертка использующий React Profiler API.

```typescript
import { ProfilerWrapper } from 'shared/components/ProfilerWrapper'

function App() {
  return (
    <ProfilerWrapper id="TimelinePage" enabled={true}>
      <TimelinePage />
    </ProfilerWrapper>
  )
}

// Или как HOC
export default withProfiler('TimelinePage')(TimelinePage)
```

## Troubleshooting

### Hook вызывает слишком много ре-рендеров

- Проверьте deps массив в useEffect/useMemo/useCallback
- Убедитесь что объекты/массивы мемоизированы
- Используйте useAuthUser() вместо useAuth() где возможно
- Используйте `usePerformanceMonitor` для отладки

### Данные не кэшируются

- Убедитесь что filters объект стабилен (используйте useMemo)
- Проверьте что cacheKey не меняется при каждом рендере

### Запросы дублируются

- Используйте enabled флаг для контроля
- Проверьте что хук не вызывается в нескольких местах одновременно

### Медленные рендеры

1. Добавьте `usePerformanceMonitor` в компонент
2. Откройте React DevTools Profiler
3. Запишите сессию взаимодействия
4. Проверьте какие компоненты рендерятся часто
5. Добавьте мемоизацию или React.memo где нужно

