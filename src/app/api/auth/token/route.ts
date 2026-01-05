import { authOptions } from "@/lib/authOptions";
import { authenticate } from "@/lib/middleware-utils";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// Forçar renderização dinâmica (usa cookies e headers)
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/token
 * Retorna o JWT customizado do MagicBox
 *
 * ROTA PROTEGIDA: Middleware valida autenticação (Cookie OU Bearer Token)
 * Usuário já está autenticado ao chegar aqui
 */
export async function GET(request: NextRequest) {
  try {
    // Obter token do NextAuth
    const authResult = await authenticate(request);
    const hasToken = authResult?.token;

    if (!hasToken?.accessToken) {
      return NextResponse.json(
        {
          error: "Token não disponível",
          message: "O token customizado não foi gerado no login.",
        },
        { status: 500 }
      );
    }

    // Obter sessão para dados do usuário
    const session = await getServerSession(authOptions);

    return NextResponse.json({
      success: true,
      data: {
        accessToken: hasToken.accessToken,
        tokenType: "Bearer",
        user: session?.user
          ? {
              id: session.user.id,
              username: session.user.username,
              email: session.user.email,
              name: session.user.name,
              role: session.user.role,
            }
          : undefined,
      },
    });
  } catch (error) {
    console.error("Erro ao obter token:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
