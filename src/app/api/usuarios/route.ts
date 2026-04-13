import { listUsersSchema, registerUserSchema } from "@/core/users/user.dto";
import { authService as servico } from "@/core/users/service";
import { errorHandler } from "@/lib/error-handler";
import { ForbiddenError } from "@/lib/errors";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(listarTodos);
export const POST = errorHandler(criar);

async function listarTodos(requisicao: NextRequest): Promise<NextResponse> {
  const authUser = await getAuthUser(requisicao);

  // Apenas administradores podem listar todos os usuários
  if (authUser.role !== "admin") {
    throw new ForbiddenError("Acesso negado: apenas administradores podem realizar esta operação");
  }

  const { searchParams } = new URL(requisicao.url);
  const filtros = listUsersSchema.parse(Object.fromEntries(searchParams.entries()));

  const resultado = await servico.listarTodos(filtros);
  return NextResponse.json(resultado);
}

async function criar(requisicao: NextRequest): Promise<NextResponse> {
  const authUser = await getAuthUser(requisicao);

  // Apenas administradores podem criar usuários manualmente via API de usuários
  if (authUser.role !== "admin") {
    throw new ForbiddenError("Acesso negado: apenas administradores podem criar novos usuários");
  }

  const corpo = await requisicao.json();
  const dados = registerUserSchema.parse(corpo);

  const novoUsuario = await servico.criar(dados);
  return NextResponse.json(novoUsuario, { status: 201 });
}
