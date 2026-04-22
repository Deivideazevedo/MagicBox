import { NextRequest, NextResponse } from "next/server";
import { dividasService } from "@/core/dividas/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { updateDividaSchema } from "@/core/dividas/divida.dto";

export const GET = errorHandler(buscarPorId);
export const PATCH = errorHandler(atualizar);
export const DELETE = errorHandler(remover);

async function buscarPorId(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await getAuthUser(request);
  const divida = await dividasService.buscarPorId(params.id, userId);
  return NextResponse.json(divida);
}

async function atualizar(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await getAuthUser(request);
  const body = await request.json();
  const dados = updateDividaSchema.parse(body);
  const divida = await dividasService.atualizar(params.id, dados);
  return NextResponse.json(divida);
}

async function remover(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await getAuthUser(request);
  await dividasService.remover(params.id);
  return NextResponse.json({ success: true });
}
