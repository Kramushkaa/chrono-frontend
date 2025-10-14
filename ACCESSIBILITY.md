# Accessibility (A11y) Improvements

## Цель
Сделать приложение Chronoline доступным для всех пользователей, включая людей с ограниченными возможностями, в соответствии с WCAG 2.1 Level AA.

## Текущий статус

### ✅ Завершено

#### 1. **Формы создания сущностей** (WCAG 2.1 AA ✅)

**CreatePersonForm:**
- ✅ Добавлены `<label>` элементы для всех input полей
- ✅ Связь label-input через `htmlFor` и `id`
- ✅ `aria-required="true"` для обязательных полей
- ✅ `aria-describedby` для подсказок (hints)
- ✅ `aria-labelledby` для формы
- ✅ `role="alert"` и `aria-live="polite"` для ошибок валидации
- ✅ Визуальные индикаторы обязательных полей `*`
- ✅ Правильный `type="url"` для URL полей
- ✅ Семантические `<label>` и `<span>` для hints

**CreateAchievementForm:**
- ✅ Все поля обернуты в `<div>` с `<label>`
- ✅ Использование `<fieldset>` и `<legend>` для группировки
- ✅ `aria-label` для SearchableSelect компонентов
- ✅ `aria-describedby` для связи checkbox с подсказками
- ✅ `role="note"` для информационного текста
- ✅ Все обязательные поля с `aria-required`
- ✅ Правильный `type="url"` для URL полей

**Преимущества:**
- Screen readers могут корректно объявлять все поля
- Пользователи клавиатуры могут легко навигировать по форме
- Валидационные ошибки объявляются автоматически
- Подсказки доступны для вспомогательных технологий

---

#### 2. **Условный рендеринг без ошибок**

**Исправлена проблема с отображением "0" и "Правление: 0 - 0":**
- ✅ `PersonCard.tsx` - исправлено условие для reignStart/reignEnd
- ✅ `PersonPanel.tsx` - добавлена проверка на truthy значения
- ✅ `PersonReignBars.tsx` - улучшена валидация периодов правления
- ✅ `PersonYearLabels.tsx` - использованы тернарные операторы вместо &&

**До:**
```typescript
{person.reignStart && person.reignEnd && (<div>...</div>)}
// Проблема: если reignStart = 0, React рендерит "0"
```

**После:**
```typescript
{(person.reignStart && person.reignEnd) ? (<div>...</div>) : null}
// Решение: тернарный оператор гарантирует null для falsy значений
```

---

### 🔄 В процессе

#### 3. **CreatePeriodForm** (Следующий шаг)
- ⏳ Добавить labels и aria-атрибуты
- ⏳ Улучшить валидацию с aria-live

#### 4. **Интерактивные элементы**
- ⏳ Кнопки без явного текста - добавить aria-label
- ⏳ Toggle buttons - aria-pressed
- ⏳ Dropdown меню - aria-expanded, aria-controls
- ⏳ Tab панели - aria-selected, role="tablist"

#### 5. **ARIA Landmarks**
- ⏳ `<nav>` с role="navigation" для меню
- ⏳ `<main>` для основного контента
- ⏳ `<aside>` для боковых панелей
- ⏳ `<header>` и `<footer>` для AppHeader и ContactFooter

#### 6. **Live Regions**
- ⏳ Toast notifications - aria-live="assertive"
- ⏳ Loading spinners - aria-busy, aria-live="polite"
- ⏳ Динамический контент - aria-live для списков

#### 7. **Keyboard Navigation**
- ⏳ Проверить tab order
- ⏳ Escape для закрытия модалок
- ⏳ Arrow keys для навигации по timeline
- ⏳ Enter/Space для активации кнопок

#### 8. **Focus Management**
- ⏳ Auto-focus на первое поле при открытии модалки
- ⏳ Focus trap внутри модалок (уже частично реализовано в Modal.tsx)
- ⏳ Возврат фокуса после закрытия модалки

---

### 📚 Руководство по использованию

#### Label vs ARIA-Label
```tsx
// ✅ Лучший вариант - видимый label
<label htmlFor="name">Имя</label>
<input id="name" name="name" />

// ✅ Если label не нужен визуально
<input aria-label="Поиск по имени" />

// ❌ Только placeholder - недостаточно
<input placeholder="Введите имя" />
```

#### Обязательные поля
```tsx
// ✅ Визуальный и программный индикатор
<label>
  Имя <span aria-label="обязательное поле">*</span>
</label>
<input required aria-required="true" />
```

#### Ошибки и валидация
```tsx
// ✅ Live region для динамических ошибок
{error && (
  <div role="alert" aria-live="polite">
    {error}
  </div>
)}

// ✅ Связь поля с описанием ошибки
<input aria-describedby="error-id" aria-invalid={!!error} />
{error && <span id="error-id">{error}</span>}
```

#### Группировка полей
```tsx
// ✅ Fieldset для связанных полей
<fieldset>
  <legend>Привязка к сущности</legend>
  <input ... />
  <input ... />
</fieldset>
```

---

## Следующие шаги

1. **CreatePeriodForm** - добавить labels и ARIA
2. **Кнопки** - провести аудит всех кнопок без явного текста
3. **Dropdown/Select** - улучшить keyboard навигацию
4. **Modal** - улучшить focus management
5. **Timeline** - добавить keyboard controls для навигации
6. **Landmarks** - обернуть основные секции в семантические элементы
7. **Live regions** - улучшить объявление динамических изменений

---

## Метрики

### До улучшений
- ARIA атрибутов: ~162 в 52 файлах
- Forms без labels: 3 формы
- Проблемы с рендерингом: "0" отображается в UI

### После улучшений
- ✅ ARIA атрибутов: ~212+ в 54 файлах
- ✅ Forms с полной accessibility: 2/3
- ✅ Проблемы с рендерингом: исправлены
- ✅ WCAG 2.1 AA compliance для форм: 67%

---

## Инструменты для проверки

```bash
# Запустить Lighthouse audit
npm run build
npx serve -s build
# Откройте Chrome DevTools → Lighthouse → Accessibility

# Проверка с axe-core (рекомендуется)
npm install --save-dev @axe-core/react
```

### Browser расширения
- **WAVE** - визуальная оценка accessibility
- **axe DevTools** - детальный анализ WCAG
- **Accessibility Insights** - Microsoft tool

---

## Ресурсы

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

---

**Последнее обновление:** October 14, 2025

