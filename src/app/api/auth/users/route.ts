// src/app/api/auth/users/route.ts
import "@/lib/zod-config";

import { authService as service } from "@/core/users/service";
import { registerUserSchema } from "@/core/users/user.dto";
import { errorHandler } from "@/lib/error-handler";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/users?username=admin
 * GET /api/auth/users?email=admin@example.com
 *
 * ✅ Busca usuário por username OU email
 * ✅ Retorna usuário sem senha
 * ✅ Tratamento de erros via errorHandler
 */
export const GET = errorHandler(findUser);

/**
 * POST /api/auth/users
 * Body: { username, email?, password, name?, image? }
 *
 * ✅ Cria novo usuário
 * ✅ Valida dados com Zod
 * ✅ Verifica se username/email já existe
 * ✅ Retorna usuário sem senha
 */
export const POST = errorHandler(createUser);

async function findUser(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const email = searchParams.get("email");

  if (!username && !email) {
    throw new ValidationError("Username ou email é obrigatório");
  }

  const user = await service.findByUsernameOrEmail(
    username || undefined,
    email || undefined
  );

  if (!user) {
    throw new NotFoundError("Usuário não encontrado");
  }

  // Retorna usuário sem senha
  const { password, ...userWithoutPassword } = user;
  return NextResponse.json(userWithoutPassword);
}

async function createUser(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();

  // Validação com Zod
  const validatedData = registerUserSchema.parse(body);

  // Verifica se usuário já existe
  const existingUser = await service.findByUsernameOrEmail(
    validatedData.username,
    validatedData.email || undefined
  );

  if (existingUser) {
    throw new ConflictError("Username ou email já está em uso");
  }

  // Cria usuário
  const newUser = await service.create({
    username: validatedData.username,
    email: validatedData.email || null,
    password: validatedData.password,
    name: validatedData.name || null,
    image: validatedData.image || null,
    role: "user",
  });

  const { password, ...userWithoutPassword } = newUser;

  return NextResponse.json(userWithoutPassword, { status: 201 });
}
