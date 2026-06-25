import { authService as servico } from "@/core/users/service";
import { updateUserSchema, userIdSchema } from "@/core/users/user.dto";
import { errorHandler } from "@/lib/error-handler";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(buscarPorId);
export const PATCH = errorHandler(atualizar);
export const DELETE = errorHandler(remover);

async function buscarPorId(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id: targetId } = userIdSchema.parse(params);

  const authUser = await getAuthUser(requisicao);

  const usuario = await servico.findByID(targetId, {
    id: authUser.userId,
    role: authUser.role!
  });

  if (!usuario) {
    throw new NotFoundError("Usuário não encontrado");
  }

  const { password, ...usuarioSemSenha } = usuario;
  
  return NextResponse.json({
    ...usuarioSemSenha,
    hasPassword: !!password
  });
}

async function atualizar(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id: targetId } = userIdSchema.parse(params);
  const corpo = await requisicao.json();

  // Validação dos dados
  const dadosValidados = updateUserSchema.parse(corpo);

  const authUser = await getAuthUser(requisicao);

  const usuarioAtualizado = await servico.atualizar(targetId, dadosValidados, {
    id: authUser.userId,
    role: authUser.role!
  });

  const { password, ...usuarioSemSenha } = usuarioAtualizado;

  return NextResponse.json({
    ...usuarioSemSenha,
    hasPassword: !!password
  });
}

async function remover(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id: targetId } = userIdSchema.parse(params);

  const authUser = await getAuthUser(requisicao);

  const sucesso = await servico.remover(targetId, {
    id: authUser.userId,
    role: authUser.role!
  });
  return NextResponse.json({ success: sucesso });
}
