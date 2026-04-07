import { fonteRendaService as servico } from "@/core/fontesRenda/service";
import { updateFonteRendaSchema } from "@/core/fontesRenda/fonte-renda.dto";
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
  const usuario = await getAuthUser();
  const { id } = params;

  await servico.remover(id);
  return NextResponse.json({ success: true });
}

async function atualizar(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: fonteRendaId } = params;
  const corpo = await requisicao.json();
  await getAuthUser();

  // Valida e filtra campos permitidos (icone, cor incluídos)
  const validacao = updateFonteRendaSchema.parse(corpo);

  const fonteRendaAtualizada = await servico.atualizar(fonteRendaId, validacao as Partial<FonteRendaPayload>);

  return NextResponse.json(fonteRendaAtualizada);
}
