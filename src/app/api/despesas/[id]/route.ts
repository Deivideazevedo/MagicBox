import { despesaService as servico } from "@/core/despesas/service";
import { despesaIdSchema, updateDespesaSchema } from "@/core/despesas/despesa.dto";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/despesas/[id]
 */
export const PATCH = errorHandler(atualizar);

/**
 * DELETE /api/despesas/[id]
 */
export const DELETE = errorHandler(remover);

async function remover(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // Autentica o usuário (middleware já garante acesso, aqui apenas pegamos os dados se necessário)
  await getAuthUser(requisicao);
  const { id } = despesaIdSchema.parse(params);

  await servico.remover(id);
  return NextResponse.json({ success: true });
}

async function atualizar(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id: despesaId } = despesaIdSchema.parse(params);
  const corpo = await requisicao.json();
  
  // Validação com Zod
  const dados = updateDespesaSchema.parse(corpo);

  // A autenticação já nos provê o userId efetivo (dono ou via admin override)
  const { userId } = await getAuthUser(requisicao, dados.userId);

  const despesaAtualizada = await servico.atualizar(despesaId, {
    ...dados,
    userId,
  });

  return NextResponse.json(despesaAtualizada);
}
