import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { receitaService as servico } from "@/core/receitas/service";
import { NextRequest, NextResponse } from "next/server";
import { createReceitaSchema, listReceitasSchema } from "@/core/receitas/receita.dto";

export const GET = errorHandler(listarTodos);
export const POST = errorHandler(criar);

async function listarTodos(requisicao: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(requisicao.url);
  const query = listReceitasSchema.parse(Object.fromEntries(searchParams.entries()));

  // Determina o ID do usuário efetivo diretamente na autenticação
  const { userId } = await getAuthUser(requisicao, query.userId);

  const receitas = await servico.listarPorUsuario(userId);

  return NextResponse.json(receitas);
}

async function criar(requisicao: NextRequest): Promise<NextResponse> {
  const corpo = await requisicao.json();

  // Validação com Zod
  const dados = createReceitaSchema.parse(corpo);

  // Determina o ID do usuário efetivo (permite admin bypass se presente no DTO)
  const { userId } = await getAuthUser(requisicao, dados.userId);

  const novaReceita = await servico.criar({
    ...dados,
    userId,
  });

  return NextResponse.json(novaReceita, { status: 201 });
}
