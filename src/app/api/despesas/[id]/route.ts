import { despesaService as servico } from "@/core/despesas/service";
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
export const PATCH = errorHandler(atualizar);

/**
 * DELETE /api/despesas/[id]
 * Remove uma despesa
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
  const { id: despesaId } = parametros;
  const corpo: DespesaPayload = await requisicao.json();
  const usuario = await getAuthUser();


  const validacao = updateDespesaSchema.parse(corpo);

  const dados = {
    ...validacao,
    userId: validacao.idUsuario ?? Number(usuario.id), // Garante que userId seja number
  };

  const despesaAtualizada = await servico.atualizar(Number(despesaId), dados);

  return NextResponse.json(despesaAtualizada);
}
