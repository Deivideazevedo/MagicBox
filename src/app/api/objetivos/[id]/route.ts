import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { objetivoService as servico } from "@/core/objetivos/service";
import { NextRequest, NextResponse } from "next/server";
import { objetivoIdSchema, updateObjetivoSchema } from "@/core/objetivos/objetivo.dto";

export const GET = errorHandler(buscarPorId);
export const PATCH = errorHandler(atualizar);
export const DELETE = errorHandler(remover);

async function buscarPorId(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  await getAuthUser(requisicao);
  const { id } = objetivoIdSchema.parse(params);
  const objetivo = await servico.buscarPorId(id);
  return NextResponse.json(objetivo);
}

async function atualizar(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id: objetivoId } = objetivoIdSchema.parse(params);
  const corpo = await requisicao.json();

  // Validação Zod
  const dados = updateObjetivoSchema.parse(corpo);

  // A autenticação já nos provê o userId efetivo (dono ou via admin override)
  const { userId } = await getAuthUser(requisicao, dados.userId);

  const objetivoAtualizado = await servico.atualizar(objetivoId, {
    ...dados,
    userId,
  });

  return NextResponse.json(objetivoAtualizado);
}

async function remover(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  await getAuthUser(requisicao);
  const { id } = objetivoIdSchema.parse(params);

  const sucesso = await servico.remover(id);
  return NextResponse.json({ success: sucesso });
}
