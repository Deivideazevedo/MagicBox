const CACHE_NAME = "magicbox-cache-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/favicon.ico",
  "/images/logos/logo.png",
];

// Instalação: Armazena recursos fundamentais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos para evitar inconsistências
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepção de requisições
self.addEventListener("fetch", (event) => {
  // Ignorar requisições que não sejam GET ou recursos externos (como chrome-extensions)
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  const url = new URL(event.request.url);

  // ⚡ Cache-First para arquivos estáticos (Next.js build, imagens, fontes, etc)
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
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  } else {
    // 🌐 Network-First para páginas e APIs. Se a rede falhar, busca no cache.
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Se for navegação de página (HTML) e falhar totalmente, redireciona para a raiz
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

// 🔔 Web Push: o servidor "acorda" o SW mesmo com o app fechado. Mostramos a
// notificação na bandeja (obrigatório no Android — userVisibleOnly) e setamos o
// badge no ícone do app com o total de não lidas.
self.addEventListener("push", (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch (e) {
    dados = { titulo: "MagicBox", mensagem: event.data ? event.data.text() : "" };
  }

  const titulo = dados.titulo || "MagicBox";
  const naoLidas = typeof dados.naoLidas === "number" ? dados.naoLidas : 0;

  const tarefas = [
    self.registration.showNotification(titulo, {
      body: dados.mensagem || "",
      icon: "/images/logos/logo.png",
      badge: "/images/logos/logo.png",
      tag: "magicbox-notificacao",
      renotify: true,
      data: { link: dados.link || "/" },
    }),
  ];

  // Badge no ícone do app (Badging API). O suporte/visual varia por launcher.
  if ("setAppBadge" in self.navigator) {
    tarefas.push(
      naoLidas > 0
        ? self.navigator.setAppBadge(naoLidas)
        : self.navigator.clearAppBadge()
    );
  }

  event.waitUntil(Promise.all(tarefas));
});

// Ao clicar na notificação: foca uma aba aberta do app ou abre o link.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = (event.notification.data && event.notification.data.link) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(destino).catch(() => {});
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(destino);
        }
      })
  );
});
