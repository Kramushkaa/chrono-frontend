// Service Worker для Хронониндзя PWA
const CACHE_NAME = 'chrononinja-v1.0.0';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/favicon.ico'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кэшированный ответ, если он есть
        if (response) {
          return response;
        }
        
        // Иначе делаем сетевой запрос
        return fetch(event.request, { cache: 'no-store' }).then(
          (response) => {
            // Проверяем, что ответ валидный
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Клонируем ответ
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Кэшируем только GET к статике
                if (event.request.method === 'GET' && /\.(?:png|jpg|jpeg|gif|svg|ico|css|js|json)$/.test(event.request.url)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

// Обработка push уведомлений (опционально)
self.addEventListener('push', (event) => {
  const options = {
            body: 'Новые данные доступны в Хронониндзя!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть приложение',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Хронониндзя', options)
  );
}); 