import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { despesaService as servico } from "@/core/despesas/service";
import { NextRequest, NextResponse } from "next/server";
import { createDespesaSchema, listDespesasSchema } from "@/core/despesas/despesa.dto";

export const GET = errorHandler(listarTodos);
export const POST = errorHandler(criar);

async function listarTodos(requisicao: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(requisicao.url);
  const query = listDespesasSchema.parse(Object.fromEntries(searchParams.entries()));

  // Determina o ID do usuário efetivo diretamente na autenticação
  const { userId } = await getAuthUser(requisicao, query.userId);

  const despesas = await servico.listarPorUsuario(userId);

  return NextResponse.json(despesas);
}

async function criar(requisicao: NextRequest): Promise<NextResponse> {
  const corpo = await requisicao.json();

  // Validação com Zod
  const dados = createDespesaSchema.parse(corpo);

  // Determina o ID do usuário efetivo (permite admin bypass se presente no DTO)
  const { userId } = await getAuthUser(requisicao, dados.userId);

  const novaDespesa = await servico.criar({
    ...dados,
    userId,
  });

  return NextResponse.json(novaDespesa, { status: 201 });
}
