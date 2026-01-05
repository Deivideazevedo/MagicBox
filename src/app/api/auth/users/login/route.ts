// src/app/api/auth/users/login/route.ts
import "@/lib/zod-config";

import { authService as service } from "@/core/users/service";
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
 * Response: { "token": "eyJhbGc...", "user": {...}, "expiresIn": "7d" }
 */
export const POST = errorHandler(login);

async function login(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();

  // Validação com Zod
  const { username, email, password } = loginUserSchema.parse(body);

  // Autentica usuário (MESMA função usada pelo CredentialsProvider)
  const user = await service.authenticate({ username, email, password });

  if (!user) {
    throw new ValidationError("Credenciais inválidas");
  }

  // Adapta o usuário para o formato esperado pelo token
  const userForToken = {
    id: user.id, // ✅ Já é number do Prisma
    name: user.name,
    username: user.username,
    email: user.email,
    image: user.image,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  // Gera JWT customizado para uso externo
  const token = await generateAccessToken(userForToken);

  return NextResponse.json({
    token,
    user: userForToken,
    expiresIn: "7d",
  });
}
