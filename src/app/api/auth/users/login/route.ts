// src/app/api/auth/users/login/route.ts
import "@/lib/zod-config";

import { authService as servico } from "@/core/users/service";
import { loginUserSchema } from "@/core/users/user.dto";
import { errorHandler } from "@/lib/error-handler";
import { ValidationError } from "@/lib/errors";
import { generateAccessToken } from "@/lib/jwt-utils";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/users/login
 * Body: { username?, email?, password }
 *
 * ✅ Login externo (para mobile, API externa, etc)
 * ✅ Aceita username OU email
 * ✅ Retorna JWT customizado
 * ✅ Mesmas credenciais do NextAuth
 *
 * Exemplo:
 * POST /api/auth/users/login
 * Body: { "username": "admin", "password": "wise951" }
 * Response: { "token": "eyJhbGc...", "usuario": {...}, "expiresIn": "7d" }
 */
export const POST = errorHandler(login);

async function login(requisicao: NextRequest): Promise<NextResponse> {
  const corpo = await requisicao.json();

  // Validação com Zod
  const { username, email, password } = loginUserSchema.parse(corpo);

  // Autentica usuário (MESMA função usada pelo CredentialsProvider)
  const usuario = await servico.authenticate({ username, email, password });

  if (!usuario) {
    throw new ValidationError("Credenciais inválidas");
  }

  // Adapta o usuário para o formato esperado pelo token
  const userForToken = {
    id: usuario.id, // ✅ Já é number do Prisma
    name: usuario.name,
    username: usuario.username,
    email: usuario.email,
    image: usuario.image,
    role: usuario.role,
    createdAt: usuario.createdAt.toISOString(),
    updatedAt: usuario.updatedAt.toISOString(),
  };

  // Gera JWT customizado para uso externo
  const token = await generateAccessToken(userForToken);

  return NextResponse.json({
    token,
    usuario: userForToken,
    expiresIn: "7d",
  });
}
