import { fonteRendaService as servico } from "@/core/fontesRenda/service";
import { FonteRendaPayload } from "@/core/fontesRenda/types";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/fonteRendas/[id]
 * Atualiza uma fonteRenda existente
 * Body: { nome: string }
 */
export const PATCH = errorHandler(atualizar);

/**
 * DELETE /api/fonteRendas/[id]
 * Remove uma fonteRenda
 */
export const DELETE = errorHandler(remover);


async function remover(
  requisicao: NextRequest,
  { parametros }: { parametros: { id: string } }
) {
  const usuario = await getAuthUser();
  const { id } = parametros;

  await servico.remover(id);
  return NextResponse.json({ success: true });
}

async function atualizar(
  requisicao: NextRequest,
  { parametros }: { parametros: { id: string } }
) {
  const { id: fonteRendaId } = parametros;
  const corpo: FonteRendaPayload = await requisicao.json();

  const fonteRendaAtualizada = await servico.atualizar(fonteRendaId, corpo);

  return NextResponse.json(fonteRendaAtualizada);
}
