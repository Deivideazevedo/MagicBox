import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { metaService as servico } from "@/core/metas/service";
import { NextRequest, NextResponse } from "next/server";
import { createMetaSchema, listMetasSchema } from "@/core/metas/meta.dto";

export const GET = errorHandler(listarTodos);
export const POST = errorHandler(criar);

async function listarTodos(requisicao: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(requisicao.url);
  const query = listMetasSchema.parse(Object.fromEntries(searchParams.entries()));

  // Determina o ID do usuário efetivo diretamente na autenticação
  const { userId } = await getAuthUser(requisicao, query.userId);

  const metas = await servico.listarPorUsuario(userId);
  return NextResponse.json(metas);
}

async function criar(requisicao: NextRequest): Promise<NextResponse> {
  const corpo = await requisicao.json();

  // Validação com Zod
  const dados = createMetaSchema.parse(corpo);

  // Determina o ID do usuário efetivo (permite admin bypass se presente no DTO)
  const { userId } = await getAuthUser(requisicao, dados.userId);

  const novaMeta = await servico.criar({
    ...dados,
    userId,
  });

  return NextResponse.json(novaMeta, { status: 201 });
}
