import { despesaService as service } from "@/core/despesas/service";
import { DespesaPayload } from "@/core/despesas/types";
import { updateDespesaSchema } from "@/dtos";
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
  const user = await getAuthUser();


  const validation = updateDespesaSchema.parse(body);

  const payload = {
    ...validation,
    userId: validation.userId ?? Number(user.id), // Garante que userId seja number
  };

  const despesaAtualizada = service.update(Number(despesaId), payload);

  return NextResponse.json(despesaAtualizada);
}
