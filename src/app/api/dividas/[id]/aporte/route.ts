import { NextRequest, NextResponse } from "next/server";
import { dividasService } from "@/core/dividas/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";

export const POST = errorHandler(processarAporte);
export const PUT = errorHandler(quitarDespesa);
export const DELETE = errorHandler(desquitarAporte);

async function processarAporte(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await getAuthUser(request);
  const body = await request.json();
  const resultado = await dividasService.processarAporte(Number(params.id), body, userId);
  return NextResponse.json(resultado);
}

async function quitarDespesa(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await getAuthUser(request);
  const resultado = await dividasService.quitarDespesa(Number(params.id), userId);
  return NextResponse.json(resultado);
}

async function desquitarAporte(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await getAuthUser(request);
  const resultado = await dividasService.desquitarAporte(Number(params.id), userId);
  return NextResponse.json(resultado);
}
