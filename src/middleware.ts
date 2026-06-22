import {
  authenticate,
  handleAuthError,
  isApiRoute,
  isAuthRoute,
  isPublicApiRoute,
  isPublicNextAuthRoute,
  isPublicRoute,
  redirectToDashboard,
  redirectToLogin,
  unauthorizedResponse,
  isAdminPageRoute,
  isAdminApiRoute,
  hasPermission,
} from "@/lib/middleware-utils";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware de Autenticação e Autorização
 *
 * Fluxo:
 * 1. Libera rotas públicas do NextAuth (/api/auth/session, /api/auth/signin, etc.)
 * 2. Trata erros de autenticação
 * 3. Valida autenticação (Cookie OU Bearer Token)
 * 4. Protege rotas privadas de API (incluindo /api/auth/token e /api/auth/oauth-token)
 * 5. Controla acesso a páginas
 */
export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // ============================================================
  // Liberação imediata de arquivos estáticos críticos do PWA (CRÍTICO)
  // ============================================================
  if (pathname === "/manifest.webmanifest" || pathname === "/sw.js") {
    return NextResponse.next();
  }

  // ============================================================
  // 1. ROTAS PÚBLICAS DO NEXTAUTH - Liberação Imediata (CRÍTICO)
  //    ✅ /api/auth/session, /api/auth/signin, /api/auth/callback, etc.
  //    ❌ /api/auth/token (PROTEGIDA) /api/auth/oauth-token (PROTEGIDA)
  //    ❌ Demais privadas (PRIVATE)
  // ============================================================
  if (isPublicNextAuthRoute(pathname)) {
    return NextResponse.next();
  }

  // ============================================================
  // 1.1 ROTAS DE API COM AUTENTICAÇÃO PRÓPRIA (Liberação Imediata)
  //     /api/telegram/webhook (secret do Telegram) e /api/cron/disparos
  //     (Bearer CRON_SECRET) — chamadas externas, sem sessão de usuário.
  // ============================================================
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // ============================================================
  // 2. TRATAMENTO DE ERROS DE AUTENTICAÇÃO
  // ============================================================
  const error = nextUrl.searchParams.get("error");
  if (error) {
    return handleAuthError(request, error);
  }

  // ============================================================
  // 3. AUTENTICAÇÃO - Cookie (sistema) OU Bearer Token (externo)
  // ============================================================
  const authResult = await authenticate(request);
  const isAuthenticated = Boolean(authResult);

  // ============================================================
  // 4. PROTEÇÃO DE ROTAS DE API (incluindo /api/auth/token e /api/auth/oauth-token)
  // ============================================================
  if (isApiRoute(pathname)) {
    if (!isAuthenticated) return unauthorizedResponse();

    // 🔒 Restrição Administrativa Centralizada
    if (isAdminApiRoute(pathname) && !hasPermission(authResult?.token ?? null)) {
      return unauthorizedResponse();
    }

    // Usuário autenticado - injeta headers de debug e libera acesso à API
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-url", request.url);
    requestHeaders.set("x-method", request.method);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // ============================================================
  // 5. CONTROLE DE ACESSO A PÁGINAS
  // ============================================================

  // 5.1 Rotas públicas - sempre liberadas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 🔒 5.2 Restrição Administrativa para Páginas
  if (isAdminPageRoute(pathname) && !hasPermission(authResult?.token ?? null)) {
    return redirectToDashboard(request);
  }

  // 5.3 Usuário autenticado tentando acessar páginas de auth (login/register)
  if (isAuthenticated && isAuthRoute(pathname)) {
    return redirectToDashboard(request);
  }

  // 5.4 Usuário não autenticado tentando acessar páginas privadas
  if (!isAuthenticated && !isAuthRoute(pathname)) {
    return redirectToLogin(request);
  }

  // 5.5 Libera o acesso (rotas de auth para não autenticados)
  return NextResponse.next();
}

export const config = {
  // Esta regex instrui o middleware a rodar em TUDO, EXCETO nos caminhos que começam com:
  // - _next/static/ (Arquivos estáticos de compilação)
  // - _next/image/ (Imagens otimizadas do Next.js)
  // - images/ (Sua pasta de imagens em /public)
  // - favicon.ico (O ícone do site)
  // - manifest.webmanifest (O manifesto PWA do Next.js)
  // - sw.js (O Service Worker do PWA)
  // - api/auth/session, api/auth/csrf (rotas públicas do NextAuth)
  // Agora o middleware TAMBÉM intercepta rotas /api/* (exceto /api/auth/*)
  matcher: ["/((?!_next/static|_next/image|images|favicon.ico|manifest.webmanifest|sw.js|api/auth/session|api/auth/csrf).*)"],
};
