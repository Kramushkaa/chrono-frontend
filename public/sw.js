// Service Worker для Хронониндзя PWA
// Важно: обновляйте версию при каждом релизе, чтобы сбрасывать устаревший кэш
const CACHE_NAME = 'chrononinja-v1.1.2';
const urlsToCache = [
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
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
  // Немедленно активируем новый SW
  if (self.skipWaiting) {
    self.skipWaiting();
  }
});

// Поддержка мгновенного применения новой версии по сообщению от страницы
self.addEventListener('message', (event) => {
  if (event && event.data && event.data.type === 'SKIP_WAITING' && self.skipWaiting) {
    self.skipWaiting();
  }
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
  // Захватываем клиентов сразу
  if (self.clients && self.clients.claim) {
    self.clients.claim();
  }
  // Принудительно обновляем контролирующего клиента при активации
  if (self.registration && self.registration.waiting) {
    self.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Для HTML-навигации используем network-first, чтобы не залипать на старом index.html
  const isNavigation = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isNavigation) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Для статических ассетов используем cache-first с догрузкой в кэш
  const isStaticAsset = /\.(?:png|jpg|jpeg|gif|svg|ico|css|js|json|woff2?)$/i.test(url.pathname);
  if (req.method === 'GET' && isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Прочие запросы не кэшируем, но защищаемся от ошибок сети
  event.respondWith(
    fetch(req, { cache: 'no-store' }).catch((error) => {
      console.warn('[SW] Network fetch failed, falling back to cache:', error);
      return caches.match(req).then((cached) => {
        if (cached) {
          return cached;
        }
        return new Response(null, {
          status: 503,
          statusText: 'Service Unavailable',
        });
      });
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