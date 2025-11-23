import { authenticateUser } from "@/lib/auth-utils";
import { generateAccessToken } from "@/lib/jwt-utils";
import { NextRequest, NextResponse } from "next/server";

/**
 * Rota de Login para API Externa
 *
 * ✅ Autentica usuário com as MESMAS credenciais do NextAuth
 * ✅ Retorna JWT customizado para uso em requisições externas
 * ✅ Token compatível com o middleware de autenticação
 * ✅ Permite acesso às rotas protegidas via Bearer Token
 *
 * Exemplo de uso:
 * POST /api/auth/login
 * Body: { "username": "admin", "password": "wise951" }
 * Response: { "token": "eyJhbGc...", "user": {...} }
 *
 * Requisições subsequentes:
 * GET /api/categorias
 * Header: Authorization: Bearer eyJhbGc...
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    // Aceita email OU username para login
    if ((!email && !username) || !password) {
      return NextResponse.json(
        { error: "Email/username e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Autentica usuário (MESMA função usada pelo CredentialsProvider)
    const user = await authenticateUser({ username, email, password });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Remove senha antes de retornar
    const { password: _, ...userWithoutPassword } = user;

    // Gera JWT customizado para uso externo
    const token = await generateAccessToken(userWithoutPassword);

    return NextResponse.json({
      token,
      user: userWithoutPassword,
      expiresIn: "7d",
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      {
        error: "Erro no login",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
