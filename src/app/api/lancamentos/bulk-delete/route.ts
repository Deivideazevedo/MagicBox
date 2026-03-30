import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { lancamentoService as servico } from "@/core/lancamentos/service";

export const DELETE = errorHandler(removerEmMassa);

/**
 * DELETE /api/lancamentos/bulk-delete
 * Remove múltiplos lançamentos de uma vez
 * Body: { ids: (string | number)[] }
 */
async function removerEmMassa(requisicao: NextRequest): Promise<NextResponse> {
  const { id: authUserId } = await getAuthUser();
  const corpo = await requisicao.json();
  const ids = corpo?.ids as Array<string | number>;
  const resultado = await servico.removerEmMassa(ids, authUserId);

  return NextResponse.json({
    success: true,
    deletedCount: resultado.count,
  });
}