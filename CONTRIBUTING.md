# Contributing to Chronoline Frontend

Спасибо за интерес к разработке Chronoline! Этот гайд поможет быстро начать.

## Требования

- Node.js >= 14.x
- npm >= 6.x

## Установка

```bash
npm install
```

## Разработка

```bash
# Запуск dev сервера
npm start

# Запуск на другом порту
PORT=3001 npm start

# Сборка для продакшна
npm run build
```

## Структура кода

См. [ARCHITECTURE.md](./ARCHITECTURE.md) для детального описания архитектуры.

### Основные принципы

1. **Feature-based structure** - группируйте код по фичам, а не по технической роли
2. **Separation of concerns** - бизнес-логика в hooks, UI в components
3. **Type safety** - используйте TypeScript, избегайте `any`
4. **Performance first** - мемоизируйте дорогие вычисления

## Coding Standards

### TypeScript

```typescript
// ✅ DO: Используйте явные типы
interface Props {
  name: string
  age: number
}

function Component({ name, age }: Props) {}

// ❌ DON'T: Избегайте any
function Component(props: any) {} // BAD
```

### React Components

```typescript
// ✅ DO: Функциональные компоненты с TypeScript
export function MyComponent({ title }: { title: string }) {
  return <div>{title}</div>
}

// ✅ DO: Мемоизируйте дорогие компоненты
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <ComplexUI data={data} />
})

// ❌ DON'T: Не создавайте компоненты внутри render
function Parent() {
  const Child = () => <div>Bad</div> // BAD
  return <Child />
}
```

### Hooks

```typescript
// ✅ DO: Мемоизируйте колбэки и значения
const handleClick = useCallback(() => {
  doSomething()
}, [dependency])

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// ❌ DON'T: Не создавайте объекты в deps
useEffect(() => {
  fetch(filters) // filters меняется каждый рендер
}, [filters]) // BAD - filters не мемоизирован
```

### API Calls

```typescript
// ✅ DO: Импортируйте из модульного API
import { getPersons } from 'shared/api/persons'
import { getCategories } from 'shared/api/meta'

// ✅ DO: Используйте useEntityQuery для GET запросов
const { data, isLoading } = useEntityQuery({
  endpoint: '/api/persons',
  filters: { category }
})

// ✅ DO: Используйте прямые вызовы для mutations
await createPerson(payload)
await updatePerson(id, payload)

// ❌ DON'T: Не делайте fetch вручную
fetch('/api/persons').then(res => res.json()) // BAD
```

### Styling

```typescript
// ✅ DO: Используйте CSS классы
<div className="card card--primary">Content</div>

// ✅ DO: Используйте utility классы
<div className="flex gap-8 items-center">Content</div>

// ⚠️ CAUTION: inline styles только для динамических значений
<div style={{ width: `${dynamicWidth}px` }}>Content</div>

// ❌ DON'T: Избегайте inline styles для статичных значений
<div style={{ display: 'flex', gap: 8 }}>Content</div> // BAD
```

## Создание новых компонентов

### 1. Определите место

```
src/
├── shared/ui/           # Переиспользуемые UI компоненты (Button, Modal, etc.)
├── shared/layout/       # Layout компоненты (Header, Footer, etc.)
├── features/[feature]/  # Feature-специфичные компоненты
```

### 2. Структура файла

```typescript
// features/myfeature/components/MyComponent.tsx
import React from 'react'
import { useSomeHook } from '../hooks/useSomeHook'
import './MyComponent.css'

interface MyComponentProps {
  title: string
  onAction: () => void
}

/**
 * Component description
 * @param title - The title to display
 * @param onAction - Callback when action is triggered
 */
export function MyComponent({ title, onAction }: MyComponentProps) {
  const { data, isLoading } = useSomeHook()

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="my-component">
      <h2 className="my-component__title">{title}</h2>
      <button onClick={onAction} className="my-component__button">
        Action
      </button>
    </div>
  )
}
```

### 3. Добавьте стили

```css
/* features/myfeature/components/MyComponent.css */
.my-component {
  padding: 1rem;
  background: var(--bg-primary);
}

.my-component__title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.my-component__button {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
```

## Создание новых hooks

### Custom Hook Template

```typescript
// shared/hooks/useMyHook.ts
import { useState, useEffect, useCallback } from 'react'

interface UseMyHookOptions {
  initialValue: string
  onchange?: (value: string) => void
}

/**
 * Hook description
 * @param options - Configuration options
 * @returns Hook result object
 */
export function useMyHook({ initialValue, onChange }: UseMyHookOptions) {
  const [value, setValue] = useState(initialValue)

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue)
    onChange?.(newValue)
  }, [onChange])

  useEffect(() => {
    // Side effects here
  }, [value])

  return {
    value,
    setValue: handleChange,
  }
}
```

## Git Workflow

### Commits

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add quiz question type for chronological order
fix: resolve timeline performance issue
refactor: split ManagePage into modules
docs: update API documentation
style: format code with prettier
test: add tests for useFilters hook
chore: update dependencies
```

### Branch Naming

```
feature/add-quiz-leaderboard
fix/timeline-rendering-bug
refactor/optimize-api-layer
docs/update-architecture
```

## Testing

```bash
# Запуск тестов (когда будут настроены)
npm test

# Запуск с coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Что тестировать

1. **Hooks** - business logic, transformations
2. **Utils** - pure functions, type guards
3. **API** - request/response handling
4. **Components** - critical UI interactions

### Пример теста

```typescript
import { renderHook, act } from '@testing-library/react'
import { useFilters } from './useFilters'

describe('useFilters', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFilters())
    
    expect(result.current.filters.categories).toEqual([])
    expect(result.current.filters.timeRange).toEqual({ start: -800, end: 2000 })
  })

  it('should reset filters', () => {
    const { result } = renderHook(() => useFilters())
    
    act(() => {
      result.current.setFilters(prev => ({ ...prev, categories: ['science'] }))
    })
    expect(result.current.filters.categories).toEqual(['science'])
    
    act(() => {
      result.current.resetAllFilters()
    })
    expect(result.current.filters.categories).toEqual([])
  })
})
```

## Performance Guidelines

### 1. Мемоизация

```typescript
// ✅ Мемоизируйте вычисления
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.year - b.year)
}, [data])

// ✅ Мемоизируйте колбэки
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

### 2. Code Splitting

```typescript
// ✅ Lazy load тяжелые компоненты
const HeavyComponent = React.lazy(() => import('./HeavyComponent'))

function Page() {
  return (
    <React.Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </React.Suspense>
  )
}
```

### 3. Оптимизация списков

```typescript
// ✅ Используйте key для оптимизации
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// ✅ Мемоизируйте элементы списка
const Item = React.memo(({ data }: ItemProps) => {
  return <div>{data.name}</div>
})
```

## Pull Request Process

1. Создайте feature branch
2. Сделайте изменения
3. Убедитесь что код компилируется без ошибок
4. Проверьте что линтер не ругается
5. Добавьте тесты если возможно
6. Обновите документацию если нужно
7. Создайте PR с описанием изменений

## Вопросы?

Создайте issue в репозитории или свяжитесь с командой разработки.

