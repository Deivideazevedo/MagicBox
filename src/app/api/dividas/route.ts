import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { dividasService as servico } from "@/core/dividas/service";
import { NextRequest, NextResponse } from "next/server";
import { createDividaSchema } from "@/core/dividas/divida.dto";

export const GET = errorHandler(listarTodos);
export const POST = errorHandler(criar);

async function listarTodos(requisicao: NextRequest): Promise<NextResponse> {
  const { userId } = await getAuthUser(requisicao);
  const dividas = await servico.listarPorUsuario(userId);
  return NextResponse.json(dividas);
}

async function criar(requisicao: NextRequest): Promise<NextResponse> {
  const corpo = await requisicao.json();
  const dados = createDividaSchema.parse(corpo);
  const { userId } = await getAuthUser(requisicao, dados.userId);

  const novaDivida = await servico.criar({
    ...dados,
    userId,
  });

  return NextResponse.json(novaDivida, { status: 201 });
}
