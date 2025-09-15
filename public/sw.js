// ============================================================================
// SERVICE WORKER - SISTEMA CLÍNICO
// ============================================================================

const CACHE_NAME = 'sistema-clinico-v1.0.0';
const STATIC_CACHE_NAME = 'sistema-clinico-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'sistema-clinico-dynamic-v1.0.0';

// ============================================================================
// RECURSOS PARA CACHE
// ============================================================================

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.ico',
];

const DYNAMIC_ASSETS = ['/api/', '/static/'];

// ============================================================================
// ESTRATÉGIAS DE CACHE
// ============================================================================

const CACHE_STRATEGIES = {
  // Cache First - Para assets estáticos
  CACHE_FIRST: 'cache-first',
  // Network First - Para dados dinâmicos
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate - Para recursos que podem ser atualizados
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  // Network Only - Para dados críticos
  NETWORK_ONLY: 'network-only',
};

// ============================================================================
// INSTALAÇÃO DO SERVICE WORKER
// ============================================================================

self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');

  event.waitUntil(
    Promise.all([
      // Cache de assets estáticos
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting para ativação imediata
      self.skipWaiting(),
    ])
  );
});

// ============================================================================
// ATIVAÇÃO DO SERVICE WORKER
// ============================================================================

self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');

  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName.startsWith('sistema-clinico-')
            ) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle de todas as abas
      self.clients.claim(),
    ])
  );
});

// ============================================================================
// INTERCEPTAÇÃO DE REQUESTS
// ============================================================================

self.addEventListener('fetch', event => {
  const { request } = event;

  try {
    const url = new URL(request.url);

    // ============================================================================
    // CORREÇÕES APLICADAS PARA VITE HMR E WEBSOCKET
    // ============================================================================
    // 1. Ignorar TODAS as requisições WebSocket (ws:// e wss://)
    // 2. Ignorar requisições específicas do Vite HMR
    // 3. Ignorar requisições de desenvolvimento do Vite
    // 4. Manter cache funcionando para demais requests
    // ============================================================================

    // Ignorar requisições não HTTP
    if (!request.url.startsWith('http')) {
      return;
    }

    // Ignorar requisições do Vite HMR (WebSocket e polling)
    if (
      request.url.includes('/__vite_ping') ||
      request.url.includes('/__vite_hmr') ||
      request.url.includes('/@vite/') ||
      request.url.includes('/@fs/') ||
      request.url.includes('/@id/') ||
      request.url.includes('/@react-refresh') ||
      request.url.includes('/@vite/client') ||
      (request.url.includes('?t=') && request.url.includes('__vite')) ||
      request.url.includes('?import') ||
      request.url.includes('?v=') ||
      request.url.includes('?ts=') ||
      request.url.includes('?import&') ||
      request.url.includes('&import') ||
      // Ignorar requisições de desenvolvimento do Vite
      (url.hostname === 'localhost' && url.port === '5173') ||
      // Ignorar requisições para recursos de desenvolvimento
      request.url.includes('node_modules') ||
      request.url.includes('src/') ||
      request.url.includes('.tsx') ||
      request.url.includes('.ts') ||
      request.url.includes('.jsx') ||
      request.url.includes('.js')
    ) {
      return;
    }

    // Ignorar requisições para recursos que podem causar problemas
    if (
      url.protocol === 'chrome-extension:' ||
      url.protocol === 'moz-extension:' ||
      url.protocol === 'ws:' ||
      url.protocol === 'wss:' ||
      (url.hostname === 'localhost' && url.port !== '3004')
    ) {
      return;
    }

    // Ignorar conexões WebSocket do Vite HMR especificamente
    if (url.protocol === 'ws:' || url.protocol === 'wss:') {
      return;
    }

    // Ignorar requisições de desenvolvimento do Vite
    if (
      url.hostname === 'localhost' &&
      (url.port === '3001' || url.port === '3004') &&
      (url.pathname.startsWith('/@') ||
        url.pathname.includes('node_modules') ||
        url.pathname.includes('__vite') ||
        url.pathname.includes('vite') ||
        url.search.includes('import') ||
        url.search.includes('t=') ||
        url.search.includes('ts=') ||
        url.search.includes('v=') ||
        url.search.includes('hmr') ||
        url.search.includes('refresh'))
    ) {
      return;
    }

    // Estratégia baseada no tipo de recurso
    if (isStaticAsset(request)) {
      event.respondWith(handleStaticAsset(request));
    } else if (isApiRequest(request)) {
      event.respondWith(handleApiRequest(request));
    } else if (isPageRequest(request)) {
      event.respondWith(handlePageRequest(request));
    } else {
      event.respondWith(handleOtherRequest(request));
    }
  } catch (error) {
    console.error('Error in fetch event listener:', error);
    // Não responder se houver erro na configuração
  }
});

// ============================================================================
// DETECÇÃO DE TIPOS DE RECURSOS
// ============================================================================

function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.includes('/static/') ||
    url.pathname.includes('/assets/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2')
  );
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('supabase') ||
    url.pathname.startsWith('/rest/v1/') ||
    url.pathname.startsWith('/auth/v1/') ||
    url.pathname.startsWith('/storage/v1/') ||
    url.pathname.startsWith('/realtime/v1/')
  );
}

function isPageRequest(request) {
  return (
    request.mode === 'navigate' ||
    (request.method === 'GET' &&
      request.headers.get('accept').includes('text/html'))
  );
}

// ============================================================================
// ESTRATÉGIAS DE CACHE
// ============================================================================

// Cache First - Para assets estáticos
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(STATIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (fetchError) {
      console.log('Network fetch failed for static asset:', fetchError);
      return new Response('Asset not available offline', { status: 503 });
    }
  } catch (error) {
    console.error('Error handling static asset:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Network First - Para APIs com retry e fallback melhorado
async function handleApiRequest(request) {
  const maxRetries = 3;
  let lastError = null;

  // Tentar buscar da rede com retry
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentativa ${attempt} de buscar da rede:`, request.url);

      // Para requisições POST, usar o request original para evitar erro de duplex
      let newRequest = request;
      
      // Apenas para requisições GET, criar uma nova requisição
      if (request.method === 'GET') {
        newRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          mode: request.mode,
          credentials: request.credentials,
          cache: request.cache,
          redirect: request.redirect,
          referrer: request.referrer,
          referrerPolicy: request.referrerPolicy,
          integrity: request.integrity,
        });
      }

      const networkResponse = await fetch(newRequest);

      if (networkResponse.ok) {
        // Salvar no cache apenas para requisições GET
        if (request.method === 'GET') {
          try {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            await cache.put(request, networkResponse.clone());
            console.log('Resposta da rede salva no cache');
          } catch (cacheError) {
            console.warn('Erro ao salvar no cache:', cacheError);
            // Continuar mesmo se o cache falhar
          }
        }
        return networkResponse;
      } else if (networkResponse.status >= 500) {
        // Erro do servidor, tentar novamente
        console.warn(
          `Erro do servidor (${networkResponse.status}) na tentativa ${attempt}`
        );
        lastError = new Error(`Server error: ${networkResponse.status}`);

        if (attempt < maxRetries) {
          // Aguardar antes da próxima tentativa (backoff exponencial)
          await new Promise(resolve =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
          continue;
        }
      } else {
        // Erro do cliente (4xx), não tentar novamente
        console.warn(
          `Erro do cliente (${networkResponse.status}) na tentativa ${attempt}`
        );
        return networkResponse;
      }
    } catch (error) {
      // Só logar erro se não for erro de rede comum (503, fetch failed)
      if (
        !error.message.includes('Failed to fetch') &&
        !error.message.includes('503') &&
        !error.message.includes('Service Unavailable')
      ) {
        console.warn(`Tentativa ${attempt} falhou com exceção:`, error);
      }
      lastError = error;

      if (attempt < maxRetries) {
        // Aguardar antes da próxima tentativa
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  // Se todas as tentativas falharam, tentar usar cache
  console.log('Network failed, trying cache for API request:', lastError);
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Retornando resposta do cache');
      return cachedResponse;
    }
  } catch (cacheError) {
    console.error('Cache lookup failed:', cacheError);
  }

  // Para erros 503 (Service Unavailable), retornar resposta mais amigável
  const errorMessage = lastError ? lastError.message : 'Network error';
  const isServiceUnavailable = errorMessage.includes('503') || errorMessage.includes('Service Unavailable');
  
  return new Response(
    JSON.stringify({
      error: isServiceUnavailable ? 'Serviço temporariamente indisponível' : 'API not available offline',
      message: isServiceUnavailable ? 'O servidor está temporariamente indisponível. Usando dados locais.' : errorMessage,
      timestamp: new Date().toISOString(),
      url: request.url,
      offline: true,
      fallback: true
    }),
    {
      status: isServiceUnavailable ? 503 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
    }
  );
}

// Stale While Revalidate - Para páginas
async function handlePageRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    // Tentar buscar da rede com tratamento de erro
    const networkResponsePromise = fetch(request)
      .then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(error => {
        console.log('Network fetch failed for page request:', error);
        return null;
      });

    // Retornar cache imediatamente se disponível, senão aguardar network
    if (cachedResponse) {
      // Atualizar cache em background se possível
      networkResponsePromise
        .then(response => {
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
        })
        .catch(() => {
          // Ignorar erros de atualização em background
        });
      return cachedResponse;
    }

    // Se não há cache, aguardar network
    const networkResponse = await networkResponsePromise;
    if (networkResponse) {
      return networkResponse;
    }

    // Se network falhou e não há cache, tentar retornar index.html como fallback SPA
    try {
      const indexResponse = await caches.match('/');
      if (indexResponse) {
        console.log('📄 SW: Retornando index.html como fallback SPA');
        return indexResponse;
      }
    } catch (cacheError) {
      console.error('Erro ao buscar index.html do cache:', cacheError);
    }

    // Se tudo falhou, retornar erro
    return new Response('Page not available offline', { status: 503 });
  } catch (error) {
    console.error('Error handling page request:', error);

    // Tentar buscar do cache em caso de erro
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Se não encontrou a página específica, tentar index.html como fallback SPA
      const indexResponse = await caches.match('/');
      if (indexResponse) {
        console.log('📄 SW: Retornando index.html como fallback SPA após erro');
        return indexResponse;
      }
    } catch (cacheError) {
      console.error('Erro ao buscar do cache após erro:', cacheError);
    }

    return new Response('Page not available offline', { status: 503 });
  }
}

// Network Only - Para outros requests
async function handleOtherRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Error handling other request:', error);

    // Para navegações (SPA), retornar index.html do cache como fallback
    if (isPageRequest(request)) {
      try {
        const cachedIndex = await caches.match('/');
        if (cachedIndex) {
          console.log('📄 SW: Retornando index.html do cache para navegação');
          return cachedIndex;
        }
      } catch (cacheError) {
        console.error('Erro ao buscar index.html do cache:', cacheError);
      }
    }

    // Para requests que não são críticos, retornar uma resposta vazia
    if (request.destination === 'image' || request.destination === 'font') {
      return new Response('', { status: 204 });
    }

    // Para outros requests, tentar buscar do cache
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('📦 SW: Retornando recurso do cache:', request.url);
        return cachedResponse;
      }
    } catch (cacheError) {
      console.error('Erro ao buscar do cache:', cacheError);
    }

    return new Response('Resource not available', { status: 503 });
  }
}

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sincronizar dados pendentes
    const pendingData = await getPendingData();
    if (pendingData.length > 0) {
      await syncPendingData(pendingData);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getPendingData() {
  // Implementar lógica para buscar dados pendentes
  return [];
}

async function syncPendingData(data) {
  // Implementar lógica para sincronizar dados
  console.log('Syncing pending data:', data);
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

self.addEventListener('push', event => {
  console.log('📱 Push notification received');

  const options = {
    body: event.data
      ? event.data.text()
      : 'Nova notificação do sistema clínico',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/icons/checkmark.png',
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/xmark.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('Sistema Clínico', options)
  );
});

// ============================================================================
// CLICK EM NOTIFICAÇÕES
// ============================================================================

self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.notification.tag);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/app/notificacoes'));
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
  } else {
    // Click no corpo da notificação
    event.waitUntil(clients.openWindow('/app/dashboard'));
  }
});

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

self.addEventListener('message', event => {
  console.log('💬 Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// ============================================================================
// PERIODIC BACKGROUND SYNC
// ============================================================================

self.addEventListener('periodicsync', event => {
  console.log('⏰ Periodic sync triggered:', event.tag);

  if (event.tag === 'content-sync') {
    event.waitUntil(doPeriodicSync());
  }
});

async function doPeriodicSync() {
  try {
    // Sincronizar conteúdo periodicamente
    console.log('Performing periodic sync...');
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

async function cleanupCache() {
  const cacheNames = await caches.keys();
  const validCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];

  const deletePromises = cacheNames
    .filter(cacheName => !validCaches.includes(cacheName))
    .map(cacheName => caches.delete(cacheName));

  await Promise.all(deletePromises);
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

console.log('🚀 Service Worker loaded successfully');
