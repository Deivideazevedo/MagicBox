import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { objetivoService as servico } from "@/core/objetivos/service";
import { NextRequest, NextResponse } from "next/server";
import { createObjetivoSchema, listObjetivosSchema } from "@/core/objetivos/objetivo.dto";

export const GET = errorHandler(listarTodos);
export const POST = errorHandler(criar);

async function listarTodos(requisicao: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(requisicao.url);
  const query = listObjetivosSchema.parse(Object.fromEntries(searchParams.entries()));

  // Determina o ID do usuário efetivo diretamente na autenticação
  const { userId } = await getAuthUser(requisicao, query.userId);

  const objetivos = await servico.listarPorUsuario(userId);
  return NextResponse.json(objetivos);
}

async function criar(requisicao: NextRequest): Promise<NextResponse> {
  const corpo = await requisicao.json();

  // Validação com Zod
  const dados = createObjetivoSchema.parse(corpo);

  // Determina o ID do usuário efetivo (permite admin bypass se presente no DTO)
  const { userId } = await getAuthUser(requisicao, dados.userId);

  const novoObjetivo = await servico.criar({
    ...dados,
    userId,
  });

  return NextResponse.json(novoObjetivo, { status: 201 });
}
