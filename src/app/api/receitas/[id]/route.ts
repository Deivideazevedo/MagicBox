import { receitaService as servico } from "@/core/receitas/service";
import { receitaIdSchema, updateReceitaSchema } from "@/core/receitas/receita.dto";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/receitas/[id]
 */
export const PATCH = errorHandler(atualizar);

/**
 * DELETE /api/receitas/[id]
 */
export const DELETE = errorHandler(remover);

async function remover(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  await getAuthUser(requisicao);
  const { id } = receitaIdSchema.parse(params);

  await servico.remover(id);
  return NextResponse.json({ success: true });
}

async function atualizar(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id: receitaId } = receitaIdSchema.parse(params);
  const corpo = await requisicao.json();

  // Validação Zod
  const dados = updateReceitaSchema.parse(corpo);

  // A autenticação já nos provê o userId efetivo (dono ou via admin override)
  const { userId } = await getAuthUser(requisicao, dados.userId);

  const receitaAtualizada = await servico.atualizar(receitaId, {
    ...dados,
    userId,
  });

  return NextResponse.json(receitaAtualizada);
}
