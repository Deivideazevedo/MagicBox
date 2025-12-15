import { fonteRendaService as service } from "@/core/fontesRenda/service";
import { FonteRendaPayload } from "@/core/fontesRenda/types";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/fonteRendas/[id]
 * Atualiza uma fonteRenda existente
 * Body: { nome: string }
 */
export const PATCH = errorHandler(update);

/**
 * DELETE /api/fonteRendas/[id]
 * Remove uma fonteRenda
 */
export const DELETE = errorHandler(remove);


async function remove(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  const { id } = params;

  service.remove(id);
  return NextResponse.json({ success: true });
}

async function update(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: fonteRendaId } = params;
  const body: FonteRendaPayload = await request.json();

  const fonteRendaAtualizada = service.update(fonteRendaId, body);

  return NextResponse.json(fonteRendaAtualizada);
}
