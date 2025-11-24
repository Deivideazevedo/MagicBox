import { authOptions } from "@/lib/authOptions";
import { authenticate } from "@/lib/middleware-utils";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// Forçar renderização dinâmica (usa cookies e headers)
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/oauth-token
 * Retorna o token OAuth do provider (Google, GitHub, Azure AD, etc.)
 * 
 * ROTA PROTEGIDA: Middleware valida autenticação (Cookie OU Bearer Token)
 * Usuário já está autenticado ao chegar aqui
 */
export async function GET(request: NextRequest) {
  try {    
    const authResult = await authenticate(request);
    const hasToken = authResult?.token;

    // Verificar se há token OAuth disponível
    if (!hasToken?.oauthAccessToken) {
      return NextResponse.json(
        { 
          error: "Token OAuth não disponível",
          message: "Este usuário não fez login via OAuth. Token OAuth só está disponível para logins via providers (Google, GitHub, Azure AD).",
        },
        { status: 404 }
      );
    }
    // Obter sessão para dados do usuário
    const session = await getServerSession(authOptions);

    return NextResponse.json({
      success: true,
      data: {
        oauthAccessToken: hasToken.oauthAccessToken,
        tokenType: "Bearer",
        user: session?.user ? {
          id: session.user.id,
          username: session.user.username,
          email: session.user.email,
          name: session.user.name,
        } : undefined,
      },
    });
  } catch (error) {
    console.error("Erro ao obter token OAuth:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
