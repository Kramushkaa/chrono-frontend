# Архитектура фронтенда Хронониндзя (Chrononinja)

## Обзор

Хронониндзя (Chrononinja) — это React‑приложение для визуализации исторических событий на интерактивной временной линии. Приложение построено с использованием feature‑based архитектуры и следует принципам separation of concerns.

## Структура проекта

```
src/
├── App.tsx                      # Основной компонент приложения
├── index.tsx                    # Точка входа
├── features/                    # Feature модули
│   ├── auth/                    # Аутентификация
│   │   ├── components/          # UI компоненты
│   │   ├── pages/               # Страницы (ProfilePage, RegisterPage)
│   │   └── services/            # API и бизнес-логика
│   ├── timeline/                # Временная линия
│   │   ├── components/          # Timeline компоненты
│   │   ├── containers/          # Container компоненты
│   │   ├── hooks/               # Custom hooks
│   │   ├── pages/               # TimelinePage
│   │   ├── styles/              # CSS стили
│   │   └── utils/               # Утилиты (rowPlacement, timelineUtils)
│   ├── quiz/                    # Игра-квиз
│   │   ├── components/          # Quiz компоненты
│   │   ├── generators/          # Генераторы вопросов
│   │   ├── hooks/               # useQuiz, useQuizData
│   │   ├── pages/               # QuizPage
│   │   ├── types/               # TypeScript типы
│   │   └── utils/               # Утилиты
│   ├── manage/                  # Управление контентом
│   │   ├── components/          # UI компоненты (tabs, modals)
│   │   ├── context/             # React context
│   │   ├── hooks/               # Business logic hooks
│   │   ├── pages/               # ManagePage
│   │   ├── styles/              # CSS стили
│   │   └── utils/               # Утилиты
│   └── persons/                 # Личности
│       ├── components/          # PersonCard, PersonPanel
│       ├── hooks/               # usePersons
│       └── utils/               # groupingUtils
├── shared/                      # Общие модули
│   ├── api/                     # API клиент (модульная структура)
│   │   ├── core.ts              # Базовые API функции
│   │   ├── persons.ts           # Persons API
│   │   ├── achievements.ts      # Achievements API
│   │   ├── periods.ts           # Periods API
│   │   ├── lists.ts             # Lists API
│   │   ├── meta.ts              # Categories, Countries API
│   │   ├── index.ts             # Re-exports
│   │   └── api.ts               # Legacy (для совместимости)
│   ├── components/              # Переиспользуемые компоненты
│   │   ├── ErrorBoundary.tsx    # Error boundary
│   │   └── ErrorFallback.tsx    # UI для ошибок
│   ├── context/                 # React contexts
│   │   ├── AuthContext.tsx      # Оптимизированный auth context
│   │   └── ToastContext.tsx     # Toast notifications
│   ├── dto/                     # Data Transfer Objects
│   ├── hooks/                   # Переиспользуемые hooks
│   │   ├── useEntityQuery.ts    # Универсальный data fetching
│   │   ├── useFilters.ts        # Фильтры
│   │   ├── useApiData.ts        # API data hook
│   │   └── ...
│   ├── layout/                  # Layout компоненты
│   │   ├── AppHeader.tsx        # Универсальный header
│   │   └── headers/             # Специализированные headers
│   ├── styles/                  # Глобальные стили
│   │   ├── utilities.css        # Utility классы
│   │   ├── globals.css          # Глобальные стили
│   │   └── ...
│   ├── types/                   # TypeScript типы
│   ├── ui/                      # UI компоненты
│   │   ├── Modal.tsx            # Базовый modal
│   │   ├── ConfirmDialog.tsx    # Confirmation dialog
│   │   ├── FormModal.tsx        # Form modal
│   │   └── ...
│   └── utils/                   # Утилиты
│       ├── typeGuards.ts        # Type guards
│       ├── errorHandling.ts     # Классификация и обработка ошибок
│       ├── lists.ts             # Утилиты для работы со списками
│       └── validation.ts        # Валидация данных
└── pages/                       # Общие страницы
    ├── MenuPage.tsx             # Главное меню
    └── NotFoundPage.tsx         # 404
```

## Ключевые архитектурные решения

### 1. Feature-Based Structure

Код организован по фичам (features), а не по технической роли. Каждая фича содержит все необходимое: компоненты, хуки, стили, утилиты.

**Преимущества:**
- Высокая cohesion - связанный код находится рядом
- Легче находить и изменять код
- Проще удалять или выносить фичи

### 2. Модульный API слой

API клиент разделен на модули по доменным областям:
- `core.ts` - базовые функции (fetch, retry, auth)
- `persons.ts` - работа с личностями
- `achievements.ts` - достижения
- `periods.ts` - периоды
- `meta.ts` - метаданные (категории, страны)
- `lists.ts` - списки пользователя

**Преимущества:**
- Легче найти нужную функцию
- Меньше merge conflicts
- Проще тестировать
- Возможность tree-shaking

### 3. Оптимизированный State Management

#### AuthContext - Разделенные контексты
```typescript
// Отдельные контексты для данных и actions
const AuthUserContext     // Данные пользователя (меняется редко)
const AuthActionsContext  // Actions (никогда не меняется)

// Хуки
useAuthUser()    // Подписывается только на данные
useAuthActions() // Получает стабильные actions
useAuth()        // Комбинированный (для совместимости)
```

**Результат:** Компоненты, использующие только actions, не ре-рендерятся при изменении user data.

**Обработка неавторизованных запросов:**
- AuthContext слушает события `auth:unauthorized`
- Автоматически очищает состояние при истечении сессии
- `useUnauthorizedToast` показывает уведомление пользователю
- Компоненты автоматически переходят в неавторизованное состояние

### 4. Универсальный Data Fetching

Хук `useEntityQuery` унифицирует загрузку данных:
- Автоматическое кэширование
- Retry логика
- Abort на unmount
- Transform функции

```typescript
const { data, isLoading, error, refetch } = useEntityQuery({
  endpoint: '/api/persons',
  filters: { category: 'scientists' },
  enabled: true,
  transform: (data) => data.map(transformPerson)
})
```

### 5. Performance Оптимизации

#### Timeline
- `calculateRowPlacement` вынесен в utils (чистая функция)
- Мемоизация тяжелых вычислений
- Разделение логики на отдельные хуки

#### Manage Page
- Разделен на модули (927 строк → 7 файлов по 100-150 строк)
- Отдельные хуки для state, modals, business logic
- Компоненты для каждой вкладки

### 6. Error Handling

#### Error Boundary
- `ErrorBoundary` на уровне приложения и маршрутов
- Graceful degradation
- Dev/prod режимы для отображения ошибок

#### Система классификации ошибок (errorHandling.ts)
Автоматическое распознавание и user-friendly сообщения для:
- **Auth errors** (401, token issues) → "Необходима авторизация"
- **Forbidden** (403) → "Нет прав для выполнения действия"
- **Not found** (404) → "Ресурс не найден"
- **Validation** (400) → Показывает детали валидации
- **Network errors** → "Проблема с подключением"
- **Server errors** (500+) → "Ошибка сервера"

```typescript
import { classifyError, getUserErrorMessage, logError } from 'shared/utils/errorHandling'

try {
  await someApiCall()
} catch (error) {
  logError(error, 'ComponentName.functionName') // Логирует в dev mode
  const classified = classifyError(error)
  
  if (classified.type === 'auth') {
    // Показать модалку авторизации
  } else {
    showToast(classified.userMessage, 'error')
  }
}
```

#### Toast Notifications
- Унифицированная система уведомлений
- Автоматическое удаление
- Типы: success, error, info
- Используется вместо alert() для лучшего UX

## Паттерны и best practices

### Custom Hooks

Создавайте custom hooks для:
- Переиспользуемой логики
- Сложных state вычислений
- API взаимодействий
- Side effects

### Type Safety

- Используйте type guards вместо `as any`
- Определяйте discriminated unions для статусов
- Экспортируйте типы из модулей
- Избегайте `any` в критичном коде

### Component Organization

```typescript
// 1. Imports
import React from 'react'
import { useSomeHook } from './hooks'

// 2. Types
interface ComponentProps {
  // ...
}

// 3. Component
export function Component(props: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState()
  const data = useSomeHook()

  // 5. Event handlers
  const handleClick = () => {}

  // 6. Effects
  useEffect(() => {}, [])

  // 7. Render
  return <div>...</div>
}
```

### Styling

- Используйте BEM naming: `block__element--modifier`
- Предпочитайте CSS классы inline styles
- Используйте utility классы для частых паттернов
- Группируйте стили по feature

### API Calls

```typescript
// Импортируйте из модульного API
import { getPersons } from 'shared/api/persons'
import { getCategories } from 'shared/api/meta'

// Используйте useEntityQuery для GET запросов
const { data, isLoading } = useEntityQuery({ endpoint, filters })

// Для mutations используйте прямые вызовы
await createPerson(payload)
```

## Testing Strategy

1. **Unit tests** - hooks, utils, pure functions
2. **Integration tests** - API клиент, complex hooks
3. **Component tests** - критичные UI компоненты
4. **E2E tests** - основные user flows

## Performance Monitoring

В dev mode:
- Используйте React DevTools Profiler
- Проверяйте unnecessary re-renders
- Измеряйте время рендера критичных компонентов

## Migration Guide

### From old API to modular API

```typescript
// Старый способ (все еще работает)
import { getPersons, getCategories } from 'shared/api/api'

// Новый способ (рекомендуется)
import { getPersons } from 'shared/api/persons'
import { getCategories } from 'shared/api/meta'
```

### From useAuth() to specialized hooks

```typescript
// Если нужны только данные пользователя
const { user, isAuthenticated } = useAuthUser()

// Если нужны только actions
const { login, logout } = useAuthActions()

// Если нужно и то, и то (less optimal)
const { user, login, logout } = useAuth()
```

## Последние обновления (Ноябрь 2025)

### Обработка ошибок
- ✅ Создан модуль `errorHandling.ts` для классификации ошибок
- ✅ Заменены все `alert()` на `showToast()`
- ✅ Улучшена обработка ошибок авторизации
- ✅ Добавлено логирование с контекстом в dev mode

### Тестирование
- ✅ +28 новых unit-тестов (errorHandling + улучшения)
- ✅ Включено 8 ранее пропущенных тестов
- ✅ Исправлена vite config для корректной работы alias в тестах
- ✅ Итого: 1688 passing tests, 53 обоснованно skipped

## Дальнейшие улучшения

- [ ] Внедрить React Query/SWR для server state
- [ ] Добавить service workers для offline support
- [ ] Виртуализация списков для больших датасетов
- [ ] Progressive Web App features
- [ ] E2E тесты для сложных user flows (window.location, navigation)

