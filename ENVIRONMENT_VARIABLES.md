# Переменные окружения

Документация по настройке переменных окружения для локальной разработки и production.

---

## 📋 Оглавление
- [Локальная разработка (.env.local)](#локальная-разработка-envlocal)
- [Production (Серверное окружение)](#production-серверное-окружение)
- [Автоматические переменные Vite](#автоматические-переменные-vite)
- [Примеры конфигураций](#примеры-конфигураций)
- [Приоритеты переменных](#приоритеты-переменных)

---

## 🛠️ Локальная разработка (.env.local)

Эти переменные используются **только** во время локальной разработки.  
Создайте файл `.env.local` в корне проекта (он уже в `.gitignore`).

### Обязательные переменные

Нет обязательных переменных - приложение работает с дефолтными значениями.

### Опциональные переменные

| Переменная | Описание | Значение по умолчанию | Пример |
|------------|----------|----------------------|---------|
| `VITE_USE_LOCAL_BACKEND` | Переключение на локальный backend в dev-режиме | `false` | `true` или `false` |
| `VITE_LOCAL_BACKEND_URL` | URL локального backend | `http://localhost:3001` | `http://localhost:3001` |
| `VITE_REMOTE_BACKEND_URL` | URL удаленного backend по умолчанию | `https://chrono-back-kramushka.msk1.amvera.tech` | `https://your-backend.com` |
| `VITE_API_URL` | Кастомный URL API (переопределяет логику выбора) | не установлено | `http://localhost:3001` |
| `VITE_FORCE_API_URL` | Принудительный URL API (высший приоритет) | не установлено | `http://test-backend:3001` |
| `VITE_SHOW_BACKEND_INFO` | Показывать виджет с информацией о backend | не установлено | `true` или `false` |
| `VITE_FEATURE_PUBLIC_LISTS` | Включить публичные списки и их маршруты | `false` | `true` или `false` |

### Шаблон .env.local для локальной разработки

```env
# ============================================
# ЛОКАЛЬНАЯ РАЗРАБОТКА - .env.local
# ============================================

# Переключение на локальный backend
VITE_USE_LOCAL_BACKEND=true

# URL локального backend (по умолчанию localhost:3001)
VITE_LOCAL_BACKEND_URL=http://localhost:3001

# URL удаленного backend (используется когда VITE_USE_LOCAL_BACKEND=false)
VITE_REMOTE_BACKEND_URL=https://chrono-back-kramushka.msk1.amvera.tech

# Показывать виджет BackendInfo (опционально, по умолчанию показывается в dev)
# VITE_SHOW_BACKEND_INFO=true

# Включить публичные списки (фичеветка, по умолчанию скрыты)
VITE_FEATURE_PUBLIC_LISTS=false

# Принудительно установить API URL (переопределяет всю логику)
# VITE_FORCE_API_URL=http://custom-backend:3001
```

---

## 🚀 Production (Серверное окружение)

Эти переменные должны быть настроены **на сервере** (хостинг, CI/CD, Docker и т.д.).

### Обязательные переменные

| Переменная | Описание | Где установить | Пример значения |
|------------|----------|----------------|-----------------|
| `VITE_REMOTE_BACKEND_URL` | URL production backend API | Build-время или Runtime | `https://api.yourapp.com` |

### Опциональные переменные

| Переменная | Описание | Где установить | Пример значения |
|------------|----------|----------------|-----------------|
| `PORT` | Порт для production Express сервера (server.js) | Runtime | `3000`, `8080` |
| `VITE_API_URL` | Переопределить URL API для production | Build-время | `https://api.yourapp.com` |
| `VITE_FEATURE_PUBLIC_LISTS` | Включить публичные списки в production | Build-время | `true` или `false` |

### ⚠️ Важно для Production

**Переменные Vite встраиваются в код при сборке (`npm run build`)!**

Это означает:
- ✅ **Build-время**: Переменные `VITE_*` должны быть установлены **перед** запуском `npm run build`
- ✅ **Runtime**: Переменная `PORT` (для server.js) должна быть установлена при запуске сервера
- ❌ **Нельзя изменить** `VITE_*` переменные после сборки без пересборки

### Шаблон для production (установить на сервере)

#### Build-время (перед npm run build)

```bash
# ============================================
# PRODUCTION BUILD - Build Environment
# ============================================

# URL production backend API
VITE_REMOTE_BACKEND_URL=https://api.yourapp.com

# Или напрямую через VITE_API_URL
# VITE_API_URL=https://api.yourapp.com
```

#### Runtime (при запуске server.js)

```bash
# ============================================
# PRODUCTION RUNTIME - Server Environment
# ============================================

# Порт для Express сервера (если нужен не 3001)
PORT=3000

# Или задать через переменную окружения:
# export PORT=3000
# node server.js
```

---

## 🔧 Автоматические переменные Vite

Эти переменные **предоставляются Vite автоматически** и не требуют настройки.

| Переменная | Описание | Значения |
|------------|----------|----------|
| `import.meta.env.MODE` | Режим сборки | `'development'` или `'production'` |
| `import.meta.env.DEV` | Режим разработки | `true` или `false` |
| `import.meta.env.PROD` | Production режим | `true` или `false` |
| `import.meta.env.SSR` | Server-side rendering | `true` или `false` |
| `import.meta.env.BASE_URL` | Базовый путь приложения | `/` (по умолчанию) |

---

## 📝 Примеры конфигураций

### Локальная разработка с локальным backend

```env
# .env.local
VITE_USE_LOCAL_BACKEND=true
VITE_LOCAL_BACKEND_URL=http://localhost:3001
```

```bash
npm run dev
# → API будет использовать http://localhost:3001
```

---

### Локальная разработка с удаленным backend

```env
# .env.local
VITE_USE_LOCAL_BACKEND=false
VITE_REMOTE_BACKEND_URL=https://chrono-back-kramushka.msk1.amvera.tech
```

```bash
npm run dev
# → API будет использовать https://chrono-back-kramushka.msk1.amvera.tech
```

---

### Локальная разработка с кастомным backend

```env
# .env.local
VITE_API_URL=http://staging-backend.com
```

```bash
npm run dev
# → API будет использовать http://staging-backend.com
```

---

### Production build для основного сервера

```bash
# На сервере, перед сборкой:
export VITE_REMOTE_BACKEND_URL=https://chrono-back-kramushka.msk1.amvera.tech

# Сборка:
npm run build

# Запуск:
export PORT=3000
npm run serve
# → Сервер запустится на порту 3000
# → API будет использовать https://chrono-back-kramushka.msk1.amvera.tech
```

---

### Production build для staging окружения

```bash
# На staging сервере, перед сборкой:
export VITE_REMOTE_BACKEND_URL=https://staging-api.yourapp.com

# Сборка:
npm run build

# Запуск:
export PORT=8080
npm run serve
# → Сервер запустится на порту 8080
# → API будет использовать https://staging-api.yourapp.com
```

---

## 🔄 Приоритеты переменных

Порядок выбора URL для API (от высшего к низшему):

```
1. localStorage.getItem('FORCE_API_URL')  ← Ручное переключение через UI
   ↓
2. VITE_FORCE_API_URL                     ← Принудительный override
   ↓
3. MODE=development + VITE_USE_LOCAL_BACKEND=true
   → VITE_LOCAL_BACKEND_URL               ← Dev режим с локальным backend
   ↓
4. VITE_API_URL                           ← Кастомный URL
   ↓
5. VITE_REMOTE_BACKEND_URL                ← Default удаленный backend
   ↓
6. 'https://chrono-back-kramushka.msk1.amvera.tech' ← Hardcoded fallback
```

---

## 🔒 Безопасность

### ⚠️ Что МОЖНО хранить в .env:

- ✅ Публичные API URL
- ✅ Feature flags
- ✅ Режимы отладки
- ✅ Публичные настройки UI

### ❌ Что НЕЛЬЗЯ хранить в .env:

- ❌ **API ключи и секреты** (они встраиваются в bundle и видны всем!)
- ❌ Пароли
- ❌ Private tokens
- ❌ Секретные конфигурации

**Все переменные `VITE_*` доступны в браузере через `import.meta.env`!**

---

## 📚 Полезные ссылки

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Документация по переключению backend](./src/features/backend-switch/BACKEND_SWITCHING.md)
- [Примеры env файлов](./env.example)

---

## 🛠️ Настройка на популярных платформах

### Vercel
```bash
# В настройках проекта → Environment Variables добавить:
VITE_REMOTE_BACKEND_URL=https://api.yourapp.com
```

### Netlify
```bash
# В netlify.toml или через UI:
[build.environment]
  VITE_REMOTE_BACKEND_URL = "https://api.yourapp.com"
```

### Docker
```dockerfile
# В Dockerfile перед RUN npm run build:
ENV VITE_REMOTE_BACKEND_URL=https://api.yourapp.com
```

### GitHub Actions
```yaml
# В .github/workflows/deploy.yml:
env:
  VITE_REMOTE_BACKEND_URL: https://api.yourapp.com
```

---

## 🐛 Отладка

### Проверить текущие переменные в браузере

Откройте DevTools Console (F12) и введите:

```javascript
console.log('MODE:', import.meta.env.MODE)
console.log('API URL:', import.meta.env.VITE_REMOTE_BACKEND_URL)
console.log('Use Local:', import.meta.env.VITE_USE_LOCAL_BACKEND)

// Посмотреть все переменные:
console.log('All env:', import.meta.env)
```

### Проверить текущий backend

В dev-режиме виджет **Backend Info** в левом нижнем углу показывает:
- Текущий используемый URL
- Статус подключения
- Возможность переключения

---

## ❓ FAQ

### Q: Почему после изменения .env.local ничего не изменилось?
**A:** Нужно перезапустить dev-сервер: `npm run dev`

### Q: Как изменить backend после production build?
**A:** Нельзя без пересборки. Переменные `VITE_*` встраиваются в код при сборке. Нужно пересобрать с новыми значениями.

### Q: Можно ли хранить API ключи в .env?
**A:** **НЕТ!** Все переменные `VITE_*` публичны и видны в браузере. Используйте backend для работы с секретами.

### Q: Как переключиться на другой backend без изменения .env.local?
**A:** В dev-режиме используйте виджет **Backend Info** в левом нижнем углу или localStorage в консоли:
```javascript
localStorage.setItem('FORCE_API_URL', 'http://your-backend:3001')
location.reload()
```

---

**Последнее обновление:** После миграции на Vite (30.10.2025)

