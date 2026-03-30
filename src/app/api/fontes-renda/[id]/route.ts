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
  { params }: { params: { id: string } }
) {
  await getAuthUser();
  const { id } = params;

  await servico.remover(id);
  return NextResponse.json({ success: true });
}

async function atualizar(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: fonteRendaId } = params;
  const corpo: FonteRendaPayload = await requisicao.json();

  const fonteRendaAtualizada = await servico.atualizar(fonteRendaId, corpo);

  return NextResponse.json(fonteRendaAtualizada);
}
