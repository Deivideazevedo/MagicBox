import { NextRequest, NextResponse } from "next/server";
import { getToken, JWT } from "next-auth/jwt";
import { verifyAccessToken, extractTokenFromHeader } from "./jwt-utils";

// export type AuthType =

export interface AuthResult {
  type: "session" | "bearer";
  userId: string;
  token: JWT;
}

// Rotas públicas (não requerem autenticação)
const PUBLIC_ROUTES = ["/", "/about"];

// Rotas de autenticação (login, registro, erro)
const AUTH_ROUTES = ["/auth"];

// Rotas de API privadas que requerem autenticação (Cookie OU Bearer Token)
export const PROTECTED_API_ROUTES = [
  "/api/auth/token",
  "/api/auth/oauth-token",
];

// Verificadores de rota
const isPublicRoute = (path: string) => PUBLIC_ROUTES.includes(path);
const isAuthRoute = (path: string) => path.startsWith(AUTH_ROUTES[0]);
const isApiRoute = (path: string) => path.startsWith("/api");
const isProtectedApiRoute = (path: string) =>
  PROTECTED_API_ROUTES.some((route) => path.startsWith(route));
const isPublicNextAuthRoute = (path: string) =>
  path.startsWith("/api/auth") && !isProtectedApiRoute(path);

export {
  isPublicRoute,
  isAuthRoute,
  isProtectedApiRoute,
  isPublicNextAuthRoute,
  isApiRoute,
};

// Autenticação por cookie de sessão (requisições do sistema)
async function authenticateBySession(
  request: NextRequest
): Promise<AuthResult | null> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token?.sub) {
      return { type: "session", userId: token.sub, token };
    }
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
  }
  return null;
}

// Autenticação por Bearer Token (requisições externas)
async function authenticateByBearerToken(
  request: NextRequest
): Promise<AuthResult | null> {
  try {
    const authHeader = request.headers.get("authorization");
    const bearerToken = extractTokenFromHeader(authHeader);

    if (bearerToken) {
      const payload = await verifyAccessToken(bearerToken);
      if (payload?.sub) {
        return {
          type: "bearer",
          userId: payload.sub,
          token: payload,
        };
      }
    }
  } catch (error) {
    console.error("Erro ao verificar Bearer Token:", error);
  }
  return null;
}

// Autenticação unificada (tenta cookie, depois Bearer)
export async function authenticate(
  request: NextRequest
): Promise<AuthResult | null> {
  const sessionAuth = await authenticateBySession(request);
  if (sessionAuth) return sessionAuth;

  const bearerAuth = await authenticateByBearerToken(request);
  if (bearerAuth) return bearerAuth;

  return null;
}

// Respostas e redirecionamentos
export const unauthorizedResponse = () =>
  NextResponse.json(
    { error: "Unauthorized", message: "Autenticação necessária" },
    { status: 401 }
  );

export const redirectToLogin = (request: NextRequest, callbackUrl?: string) => {
  const { pathname, search } = request.nextUrl;
  const callback = callbackUrl || encodeURIComponent(pathname + search);
  return NextResponse.redirect(
    new URL(`/auth/auth1/login?callbackUrl=${callback}`, request.url)
  );
};

export const redirectToDashboard = (request: NextRequest) =>
  NextResponse.redirect(new URL("/dashboard", request.url));

export const handleAuthError = (request: NextRequest, error: string) => {
  const isCommonError = ["Callback", "AccessDenied", "OAuthSignin"].includes(
    error
  );
  const loginUrl = new URL("/auth/auth1/login", request.url);

  if (isCommonError) {
    loginUrl.searchParams.set(
      "callbackError",
      error === "OAuthSignin" ? "NetworkError" : "AccessDenied"
    );
    return NextResponse.redirect(loginUrl);
  }

  const errorUrl = new URL("/auth/error", request.url);
  errorUrl.searchParams.set("callbackError", error);
  return NextResponse.redirect(errorUrl);
};
