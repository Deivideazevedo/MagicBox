import { authService as servico } from "@/core/users/service";
import { updateUserSchema, userIdSchema } from "@/core/users/user.dto";
import { errorHandler } from "@/lib/error-handler";
import { NotFoundError } from "@/lib/errors";
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

  // Valida permissão: dono do perfil ou admin
  await getAuthUser(requisicao, targetId);

  const usuario = await servico.findByID(targetId);

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

  // Valida permissão: dono do perfil ou admin
  const { userId } = await getAuthUser(requisicao, targetId);

  const usuarioAtualizado = await servico.atualizar(userId, dadosValidados);

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

  // Valida permissão: dono da conta ou admin
  const { userId } = await getAuthUser(requisicao, targetId);

  const sucesso = await servico.remover(userId);
  return NextResponse.json({ success: sucesso });
}
