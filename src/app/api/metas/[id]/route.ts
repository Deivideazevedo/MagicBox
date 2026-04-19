import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { metaService as servico } from "@/core/metas/service";
import { NextRequest, NextResponse } from "next/server";
import { metaIdSchema, updateMetaSchema } from "@/core/metas/meta.dto";

export const GET = errorHandler(buscarPorId);
export const PATCH = errorHandler(atualizar);
export const DELETE = errorHandler(remover);

async function buscarPorId(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  await getAuthUser(requisicao);
  const { id } = metaIdSchema.parse(params);
  const meta = await servico.buscarPorId(id);
  return NextResponse.json(meta);
}

async function atualizar(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id: metaId } = metaIdSchema.parse(params);
  const corpo = await requisicao.json();

  // Validação Zod
  const dados = updateMetaSchema.parse(corpo);

  // A autenticação já nos provê o userId efetivo (dono ou via admin override)
  const { userId } = await getAuthUser(requisicao, dados.userId);

  const metaAtualizada = await servico.atualizar(metaId, {
    ...dados,
    userId,
  });

  return NextResponse.json(metaAtualizada);
}

async function remover(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  await getAuthUser(requisicao);
  const { id } = metaIdSchema.parse(params);
  
  const sucesso = await servico.remover(id);
  return NextResponse.json({ success: sucesso });
}
