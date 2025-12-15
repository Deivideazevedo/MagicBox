import { despesaService as service } from "@/core/despesas/service";
import { DespesaPayload } from "@/core/despesas/types";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/despesas/[id]
 * Atualiza uma despesa existente
 * Body: { nome: string }
 */
export const PATCH = errorHandler(update);

/**
 * DELETE /api/despesas/[id]
 * Remove uma despesa
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
  const { id: despesaId } = params;
  const body: DespesaPayload = await request.json();

  const despesaAtualizada = service.update(despesaId, body);

  return NextResponse.json(despesaAtualizada);
}
