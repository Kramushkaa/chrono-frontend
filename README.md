# Chrono Ninja Frontend

Интерактивная временная шкала исторических личностей.

## Установка

```bash
npm install
```

## Разработка

```bash
npm start
```

## Сборка

```bash
npm run build
```

## Production сервер

```bash
npm run serve
```

## Переменные окружения

Создайте файл `.env`:

```env
REACT_APP_API_URL=https://chrononinja-backend.amvera.io
```

## Деплой

Frontend развернут на Amvera с использованием Node.js сервера.

### Структура проекта

```
chrononinja-frontend/
├── src/                    # Исходный код React
├── public/                 # Статические файлы
├── package.json           # Зависимости
├── server.js              # Production сервер
├── amvera.yml             # Конфигурация Amvera
└── tsconfig.json          # Конфигурация TypeScript
```
