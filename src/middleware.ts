import {
  authenticate,
  handleAuthError,
  isApiRoute,
  isAuthRoute,
  isPublicNextAuthRoute,
  isPublicRoute,
  redirectToDashboard,
  redirectToLogin,
  unauthorizedResponse,
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
  // 1. ROTAS PÚBLICAS DO NEXTAUTH - Liberação Imediata (CRÍTICO)
  //    ✅ /api/auth/session, /api/auth/signin, /api/auth/callback, etc.
  //    ❌ /api/auth/token (PROTEGIDA)
  //    ❌ /api/auth/oauth-token (PROTEGIDA)
  // ============================================================
  if (isPublicNextAuthRoute(pathname)) {
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

    // Usuário autenticado - libera acesso à API
    return NextResponse.next();
  }

  // ============================================================
  // 5. CONTROLE DE ACESSO A PÁGINAS
  // ============================================================

  // 5.1 Rotas públicas - sempre liberadas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // 5.2 Usuário autenticado tentando acessar páginas de auth (login/register)
  if (isAuthenticated && isAuthRoute(pathname)) {
    return redirectToDashboard(request);
  }

  // 5.3 Usuário não autenticado tentando acessar páginas privadas
  if (!isAuthenticated && !isAuthRoute(pathname)) {
    return redirectToLogin(request);
  }

  // 5.4 Libera o acesso (rotas de auth para não autenticados)
  return NextResponse.next();
}

export const config = {
  // Esta regex instrui o middleware a rodar em TUDO, EXCETO nos caminhos que começam com:
  // - _next/static/ (Arquivos estáticos de compilação)
  // - _next/image/ (Imagens otimizadas do Next.js)
  // - images/ (Sua pasta de imagens em /public)
  // - favicon.ico (O ícone do site)
  // Agora o middleware TAMBÉM intercepta rotas /api/* (exceto /api/auth/*)
  matcher: ["/((?!_next/static|_next/image|images|favicon.ico).*)"],
};
