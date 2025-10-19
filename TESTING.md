# Testing Guidelines

## Обзор

Этот документ описывает стандарты и практики написания тестов в проекте Хронониндзя.

## Стандарты написания тестов

### Naming Conventions

- **Файлы тестов**: `ComponentName.test.tsx` или `ComponentName.test.ts`
- **Описания тестов**: Используйте описательные имена на русском языке
  ```typescript
  describe('LoginForm', () => {
    it('должен валидировать email формат', () => {
      // тест
    });
    
    it('должен показать ошибку при неверном пароле', () => {
      // тест  
    });
  });
  ```

### Структура тестов

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Основная функциональность', () => {
    it('должен рендериться без ошибок', () => {
      // smoke тест
    });
  });

  describe('Взаимодействие пользователя', () => {
    it('должен обрабатывать клик на кнопку', () => {
      // interaction тест
    });
  });

  describe('Edge Cases', () => {
    it('должен обрабатывать ошибки сети', () => {
      // error handling тест
    });
  });
});
```

## Типы тестов

### 1. Unit Tests (70% покрытия)
- Тестируют отдельные компоненты/функции
- Используют моки для зависимостей
- Быстрые, изолированные

### 2. Integration Tests (20% покрытия)  
- Тестируют взаимодействие между компонентами
- Используют реальные провайдеры (Auth, Toast)
- Проверяют данные flows

### 3. Smoke Tests (10% покрытия)
- Проверяют, что компоненты рендерятся без ошибок
- Минимальные проверки критичных путей

## Когда писать какие тесты

### Unit Tests пишем для:
- ✅ Auth services (login, register, refresh)
- ✅ Utility functions
- ✅ Custom hooks
- ✅ Form validation
- ✅ Business logic

### Integration Tests пишем для:
- ✅ User flows (login form → auth context)
- ✅ API integration
- ✅ Context providers
- ✅ Router navigation

### Smoke Tests пишем для:
- ✅ Page components
- ✅ Layout components  
- ✅ Critical user paths

## Test Utilities

### Custom Render Helper

```typescript
import { render, createMockUser } from '../test-utils';

// Простой render
render(<Component />);

// С авторизованным пользователем
render(<Component />, { 
  user: createMockUser({ email: 'test@test.com' }),
  isAuthenticated: true 
});
```

### Mock Factories

```typescript
import { createMockUser, createMockPerson, createMockQuizQuestion } from '../test-utils';

const user = createMockUser({ role: 'admin' });
const person = createMockPerson({ name: 'Test Person' });
const question = createMockQuizQuestion({ type: 'single-choice' });
```

### API Mocking

```typescript
import { mockApiResponse, mockApiError } from '../test-utils';

// Успешный ответ
fetch.mockResolvedValue(mockApiResponse({ data: 'success' }));

// Ошибка API
fetch.mockResolvedValue(mockApiError('Network error'));
```

## TDD Workflow

### Red-Green-Refactor цикл

1. **Red**: Написать failing тест
```typescript
it('должен показывать загрузку', () => {
  render(<Component isLoading={true} />);
  expect(screen.getByText('Загрузка...')).toBeInTheDocument();
});
```

2. **Green**: Написать минимальный код
```typescript
function Component({ isLoading }: { isLoading: boolean }) {
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  return <div>Content</div>;
}
```

3. **Refactor**: Улучшить код без изменения поведения
```typescript
function Component({ isLoading }: { isLoading: boolean }) {
  return (
    <div>
      {isLoading ? (
        <Spinner>Загрузка...</Spinner>
      ) : (
        <Content />
      )}
    </div>
  );
}
```

## Coverage Requirements

### Минимальные требования:
- **Auth services**: 80%+ (критично для безопасности)
- **Critical user flows**: 60%+ (smoke + integration тесты)
- **New components**: 60%+ (unit + smoke тесты)
- **Overall coverage**: 55%+

### Что НЕ тестируем:
- ❌ Стили CSS (visual regression tests отдельно)
- ❌ Третьесторонние библиотеки
- ❌ Browser APIs (они уже замокированы)

## CI/CD Integration

### Pre-commit hooks
```bash
# Запуск тестов для измененных файлов
npm test -- --onlyChanged

# Проверка coverage для новых файлов  
npm test -- --coverage --collectCoverageFrom="src/**/*.{ts,tsx}"
```

### GitHub Actions
```yaml
- name: Run Tests
  run: npm test -- --coverage --watchAll=false

- name: Coverage Check
  run: npm run test:coverage-check
```

## Отладка тестов

### Полезные команды:
```bash
# Запуск одного теста
npm test ComponentName.test.tsx

# Запуск с отладочным выводом
npm test -- --verbose

# Запуск в watch режиме
npm test -- --watch
```

### Common Issues:

1. **Async тесты**: Используйте `waitFor` или `findBy*`
```typescript
// ❌ Неправильно
expect(screen.getByText('Loading')).toBeInTheDocument();

// ✅ Правильно  
await waitFor(() => {
  expect(screen.getByText('Loading')).toBeInTheDocument();
});
```

2. **Моки**: Очищайте моки между тестами
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

3. **Timers**: Используйте fake timers для setTimeout
```typescript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});
```

## Примеры тестов

### Auth Service Test
```typescript
describe('login', () => {
  it('должен успешно логиниться и сохранять токены', async () => {
    const mockResponse = { data: { access_token: 'token', user: mockUser } };
    mockApiFetch.mockResolvedValue(mockApiResponse(mockResponse));

    const result = await login({ login: 'test', password: 'pass' });
    
    expect(result.accessToken).toBe('token');
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
```

### Component Test
```typescript
describe('LoginForm', () => {
  it('должен показывать ошибку при неверных данных', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid'));
    jest.mock('../auth', () => ({ login: mockLogin }));

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'test@test.com' } 
    });
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument();
    });
  });
});
```

## Метрики качества

### Отслеживаемые метрики:
- Покрытие тестами по модулям
- Количество failing тестов в CI
- Время выполнения тестов
- Количество моков в тестах (чем меньше - тем лучше)

### Регулярные проверки:
- Еженедельный review coverage reports
- Анализ медленных тестов
- Обновление тестов при изменении API
