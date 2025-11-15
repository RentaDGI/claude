
/**
 * SERVICE WORKER - Portal Estiba VLC
 * Permite que la app funcione offline, se cargue más rápido,
 * y ahora soporta Notificaciones Push.
 *
 * Incluye intento para solucionar el error 403 de Imgur
 * al no enviar la cabecera Referer para esas imágenes.
 * También cachea recursos de Supabase y sus APIs.
 */

const CACHE_NAME = 'estiba-vlc-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  // './sheets.js', // ¡ELIMINADO! Ya no se usa como archivo separado.
  './manifest.json',
  
  // Añadidas las URLs de tus imágenes de Imgur para precache
  'https://i.imgur.com/Q91Pi44.png', // Icono principal (y usado en notificaciones)
  'https://i.imgur.com/7F1BWQ2.jpeg', // Logo principal
  'https://i.imgur.com/xcHiyAn.jpeg', // Img login/foro
  'https://i.imgur.com/bSOecVC.jpeg', // Img dashboard/noticias
  'https://i.imgur.com/guKCoFy.jpeg', // Img contratacion
  'https://i.imgur.com/C3UpaWV.jpeg', // Img jornales/sueldometro
  'https://i.imgur.com/gUw97fH.jpeg', // Img puertas
  'https://i.imgur.com/iHJOi0K.jpeg', // Img censo

  // Recursos externos que deben ser cacheados
  'https://cdn.tailwindcss.com', // Tailwind CSS CDN
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.gstatic.com', // Fuente para Inter font
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', // jsPDF CDN
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js', // jsPDF Autotable CDN
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', // Supabase CDN
  './supabase.js' // Tu archivo supabase.js local
];

// Instalación - cachear recursos estáticos
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cacheando recursos estáticos');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })))
          .catch(err => {
            console.warn('[Service Worker] Error cacheando algunos recursos:', err);
            // No fallar la instalación si algunos recursos no se pueden cachear
          });
      })
      .then(() => self.skipWaiting()) // Permite que el nuevo Service Worker se active inmediatamente
  );
});

// Activación - limpiar cachés antiguos
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Permite que el Service Worker tome control de las pestañas existentes
  );
});

// Fetch - estrategia: Network First, fallback a Cache (para datos dinámicos y externos)
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Para APIs de terceros (Google Sheets, Supabase) y Imgur: Network First, fallback a Cache
  // Esto es crucial para datos dinámicos y para obtener las imágenes más recientes de Imgur.
  if (url.hostname.includes('docs.google.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('script.google.com') ||
      url.hostname.includes('supabase.co') || // Añadido para tus llamadas a Supabase
      url.hostname.includes('imgur.com') ) { // Añadido para tus imágenes de Imgur
    
    let fetchOptions = {};
    // === INTENTO DE SOLUCIÓN PARA IMGUR 403 ===
    // Intentar no enviar el Referer para las peticiones a Imgur
    // Esto podría evitar el bloqueo por hotlinking.
    if (url.hostname.includes('imgur.com')) {
        fetchOptions.referrerPolicy = 'no-referrer';
    }
    // ==========================================

    event.respondWith(
      fetch(request, fetchOptions) // Pasamos las opciones para modificar la petición
        .then(response => {
          // Si la respuesta es exitosa y es una petición GET, cachearla
          if (response && response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red (incluido el 403), intenta desde caché
          return caches.match(request);
        })
    );
    return;
  }

  // Para recursos estáticos propios de la aplicación (HTML, CSS, JS local, imágenes locales): Cache First, fallback a Network
  // Esto asegura carga rápida de la shell de la app.
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Encontrado en cache, pero actualizar en background para futuras visitas (Stale-While-Revalidate)
          fetch(request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, networkResponse.clone()); // Clonar para poder usarla y cachearla
                });
              }
            })
            .catch(() => {
              // Ignorar errores de red en background
            });
          return cachedResponse;
        }

        // No está en cache, ir a la red
        return fetch(request)
          .then(networkResponse => {
            // Cachear si es exitoso y es una petición GET
            if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(error => {
            console.warn('[Service Worker] Error fetching:', request.url, error);
            // Si la petición falla y no hay caché, puedes devolver una página offline.
            // return caches.match('./offline.html'); // Descomentar si tienes una página offline.
            throw error; // O simplemente lanzar el error si no hay fallback específico
          });
      })
  );
});

// Mensaje para forzar actualización (para el botón de "Hay una nueva versión de la app disponible...")
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ===============================================
// LÓGICA PARA NOTIFICACIONES PUSH (COMIENZO)
// ===============================================

self.addEventListener('push', (event) => {
  // Parsea los datos que vienen del backend
  const data = event.data ? event.data.json() : {};
  // Valores por defecto si el backend no los envía
  const {
    title = 'Nueva Contratación en Estiba VLC',
    body = '¡Se ha publicado una nueva contratación en el puerto!',
    url = '/'
  } = data;

  // Construir la URL correcta con el hash #contratacion
  // Usamos self.location.origin para obtener la URL base actual de la PWA
  const targetUrl = `${self.location.origin}/#contratacion`;

  const options = {
    body: body,
    // Usamos el icono que ya tienes en tu manifest y está en Imgur
    icon: 'https://i.imgur.com/Q91Pi44.png',
    badge: 'https://i.imgur.com/Q91Pi44.png', // Badge para móviles
    vibrate: [200, 100, 200], // Patrón de vibración
    data: {
      url: targetUrl, // La URL a la que navegará el usuario al hacer clic en la notificación
      dateOfArrival: Date.now(),
      primaryKey: 'push-notification-id-' + Date.now(), // ID único para evitar notificaciones duplicadas
    },
    actions: [
      {
        action: 'ver-contratacion',
        title: 'Ver Contratación',
      },
      // Puedes añadir más acciones si lo necesitas, por ejemplo, 'Descartar'
    ],
  };

  // Muestra la notificación
  event.waitUntil(self.registration.showNotification(title, options));
});

// Manejar el clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Cierra la notificación al hacer clic

  const urlToOpen = event.notification.data.url || `${self.location.origin}/#contratacion`;

  // Abre una nueva ventana o enfoca una existente
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta a tu dominio, intenta enfocarla y navegar
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          // Navegar a la URL de la notificación (que incluye #contratacion)
          client.navigate(urlToOpen);
          return client.focus(); // Enfoca la ventana existente
        }
      }
      // Si no hay ninguna ventana abierta, abre una nueva con la URL correcta
      return clients.openWindow(urlToOpen);
    })
  );
});

// ===============================================
// LÓGICA PARA NOTIFICACIONES PUSH (FIN)
// ===============================================
