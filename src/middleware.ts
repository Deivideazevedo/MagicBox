import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // --- 1. Definição de Rotas ---
  const publicRoutes = ["/", "/about"];
  const authRoutes = ["/auth/auth1/login", "/auth/error", "/auth/auth1/register"];
  const publicOrAuthRoutes = [...publicRoutes, ...authRoutes];

  // --- 2. Verificação de Sessão ---
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isLoggedIn = !!token;

  // --- 3. Interceptação e Roteamento Inteligente de Erros ---
  // Captura o erro que o NextAuth envia pela URL.
  const error = nextUrl.searchParams.get("error");

  if (error) {
    let destinationUrl: URL;

    const isCommonError =
      error === "Callback" ||
      error === "AccessDenied" ||
      error === "OAuthSignin";

    if (isCommonError) {
      // Para erros comuns, o destino é a página de login.
      destinationUrl = new URL("/auth/auth1/login", request.url);
      const errorCode =
        error === "OAuthSignin" ? "NetworkError" : "AccessDenied";
      destinationUrl.searchParams.set("callbackError", errorCode);
   
    } else {
      // Para erros graves, o destino é a página de erro.
      destinationUrl = new URL("/auth/error", request.url);
      destinationUrl.searchParams.set("callbackError", error);
    }

    return NextResponse.redirect(destinationUrl);
  }

  // --- 4. Lógica de Controle de Acesso ---
  const isPublicOrAuthRoute = publicOrAuthRoutes.some(
    (route) => pathname === route
  );

  if (isLoggedIn && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isLoggedIn && !isPublicOrAuthRoute) {
    const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/auth/auth1/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  // Esta regex instrui o middleware a rodar em TUDO, EXCETO nos caminhos que começam com:
  // - api/ (Rotas de API)
  // - _next/static/ (Arquivos estáticos de compilação)
  // - _next/image/ (Imagens otimizadas do Next.js)
  // - images/ (Sua pasta de imagens em /public) <-- A CHAVE DA SOLUÇÃO
  // - favicon.ico (O ícone do site)
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
