// src/app/api/auth/users/route.ts
import "@/lib/zod-config";

import { authService as servico } from "@/core/users/service";
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

async function findUser(requisicao: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(requisicao.url);
  const username = searchParams.get("username");
  const email = searchParams.get("email");

  if (!username && !email) {
    throw new ValidationError("Username ou email é obrigatório");
  }

  const usuario = await servico.findByUsernameOrEmail(
    username || undefined,
    email || undefined
  );

  if (!usuario) {
    throw new NotFoundError("Usuário não encontrado");
  }

  // @ts-ignore - password é opcional em CoreUser
  const { password: _, ...userWithoutPassword } = usuario;
  return NextResponse.json(userWithoutPassword);
}


async function createUser(requisicao: NextRequest): Promise<NextResponse> {
  const corpo = await requisicao.json();

  // Validação com Zod
  const validatedData = registerUserSchema.parse(corpo);

  // Verifica se usuário já existe
  const existingUser = await servico.findByUsernameOrEmail(
    validatedData.username,
    validatedData.email || undefined
  );

  if (existingUser) {
    throw new ConflictError("Username ou email já está em uso");
  }

  // Cria usuário
  const newUser = await servico.criar({
    username: validatedData.username,
    email: validatedData.email,

    password: validatedData.password,
    name: validatedData.name || null,
    image: validatedData.image || null,
    role: "usuario",
  });

  // @ts-ignore - password é opcional em CoreUser
  const { password: _, ...userWithoutPassword } = newUser;

  return NextResponse.json(userWithoutPassword, { status: 201 });
}
