/**
 * ============================================================================
 * SEÇÃO 1: CONFIGURAÇÕES INICIAIS
 * ============================================================================
 * Aqui definimos o nome do cache e os arquivos críticos que devem ser baixados
 * imediatamente quando o usuário acessa o sistema pela primeira vez.
 */
const CACHE_NAME = "magicbox-cache-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/favicon.ico",
  "/images/logos/logo.png",
];

/**
 * ============================================================================
 * SEÇÃO 2: CICLO DE VIDA DO SERVICE WORKER (INSTALL & ACTIVATE)
 * ============================================================================
 */

// 2.1: Instalação (Install)
// Disparado na primeira vez que o navegador lê este arquivo.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Baixa os ASSETS_TO_CACHE da internet e salva no disco do usuário
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Força este novo Service Worker a assumir o controle imediatamente,
  // sem esperar que o usuário feche todas as abas antigas.
  self.skipWaiting();
});

// 2.2: Ativação (Activate)
// Disparado logo após a instalação. Usado principalmente para "faxina".
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // Se existir um cache antigo (ex: magicbox-cache-v1), deletamos ele
          // para não ocupar espaço inútil no celular do usuário.
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Garante que as abas abertas já comecem a ser controladas por este script
  self.clients.claim();
});

/**
 * ============================================================================
 * SEÇÃO 3: INTERCEPTAÇÃO DE REDE (FETCH)
 * ============================================================================
 * Toda vez que o React/Next tentar baixar uma imagem, carregar um script ou
 * chamar uma API (ex: RTK Query), essa requisição passa por aqui primeiro.
 */
self.addEventListener("fetch", (event) => {
  // Ignoramos requisições que não sejam GET ou que vão para outros domínios
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  const url = new URL(event.request.url);

  // --------------------------------------------------------------------------
  // ESTRATÉGIA A: CACHE-FIRST (Prioridade para o Cache)
  // Usado para arquivos pesados e estáticos que raramente mudam.
  // --------------------------------------------------------------------------
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // 1. Tem no Cache? Devolve na hora (rápido e offline)
        if (cachedResponse) {
          return cachedResponse;
        }
        // 2. Não tem? Busca na internet
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            // 3. Deu sucesso? Salva uma cópia no cache para a próxima vez
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  } 
  
  // --------------------------------------------------------------------------
  // ESTRATÉGIA B: NETWORK-FIRST (Prioridade para a Rede)
  // Usado para Páginas HTML e APIs dinâmicas (RTK Query).
  // --------------------------------------------------------------------------
  else {
    event.respondWith(
      // 1. Sempre tenta a internet primeiro para ter o dado mais fresco
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            // Se deu certo, salva uma cópia "backup" no cache
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // 2. CATCH: A internet caiu ou o servidor morreu!
          return caches.match(event.request).then((cachedResponse) => {
            // 3. Procura no cache. Se tivermos um backup antigo, devolve ele
            // e salva a vida do usuário (ele continua navegando offline).
            if (cachedResponse) {
              return cachedResponse;
            }
            // 4. Último recurso: se for navegação de página e não tiver cache, 
            // redireciona para a raiz.
            if (
              event.request.headers.get("accept") &&
              event.request.headers.get("accept").includes("text/html")
            ) {
              return caches.match("/");
            }
          });
        })
    );
  }
});

/**
 * ============================================================================
 * SEÇÃO 4: RECEBIMENTO DE NOTIFICAÇÕES (WEB PUSH API)
 * ============================================================================
 * Este evento "acorda" o Service Worker em background quando o seu servidor
 * (Back-end) envia um Push. Funciona mesmo se a aba do sistema estiver fechada.
 */
self.addEventListener("push", (event) => {
  let dados = {};
  try {
    // Tenta ler os dados enviados pelo servidor em formato JSON
    dados = event.data ? event.data.json() : {};
  } catch (e) {
    dados = { titulo: "MagicBox", mensagem: event.data ? event.data.text() : "" };
  }

  const titulo = dados.titulo || "MagicBox";
  const naoLidas = typeof dados.naoLidas === "number" ? dados.naoLidas : 0;

  // Monta a notificação nativa do sistema operacional (Android/Windows/Mac)
  const tarefas = [
    self.registration.showNotification(titulo, {
      body: dados.mensagem || "",
      icon: "/images/logos/logo.png",
      badge: "/images/logos/logo.png", // Ícone monocromático para a barra de status do Android
      tag: "magicbox-notificacao", // Agrupa notificações repetidas
      renotify: true, // Força o celular a vibrar de novo mesmo se agrupada
      data: { link: dados.link || "/" }, // Dados invisíveis que usaremos no clique (Seção 5)
    }),
  ];

  // Badging API: Atualiza aquela bolinha vermelha no ícone do App na tela inicial do celular
  if ("setAppBadge" in self.navigator) {
    tarefas.push(
      naoLidas > 0
        ? self.navigator.setAppBadge(naoLidas)
        : self.navigator.clearAppBadge()
    );
  }

  // Avisa o navegador para aguardar o fim dessas tarefas antes de "dormir" o script
  event.waitUntil(Promise.all(tarefas));
});

/**
 * ============================================================================
 * SEÇÃO 5: INTERAÇÃO DO USUÁRIO (CLICK NA NOTIFICAÇÃO)
 * ============================================================================
 * O que acontece quando o usuário arrasta a barra de notificações do celular
 * e clica no alerta do MagicBox?
 */
self.addEventListener("notificationclick", (event) => {
  // 1. Fecha a notificação da barra do celular
  event.notification.close();
  
  // 2. Pega aquele link invisível que guardamos na linha 169
  const destino = (event.notification.data && event.notification.data.link) || "/";

  event.waitUntil(
    // 3. Procura por TODAS as abas/janelas abertas deste sistema
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 4. Se ele achar alguma aba já aberta perdida pelo navegador...
        for (const client of clientList) {
          if ("focus" in client) {
            // "Recicla" a aba existente: muda a URL dela para o destino 
            // e puxa ela pro primeiro plano da tela (focus).
            client.navigate(destino).catch(() => {});
            return client.focus();
          }
        }
        // 5. Se o navegador estava 100% fechado, abre uma nova janela do zero.
        if (self.clients.openWindow) {
          return self.clients.openWindow(destino);
        }
      })
  );
});
