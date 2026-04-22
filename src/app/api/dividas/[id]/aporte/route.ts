import { NextRequest, NextResponse } from "next/server";
import { dividasService } from "@/core/dividas/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";

export const POST = errorHandler(processarAporte);

async function processarAporte(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await getAuthUser(request);
  const body = await request.json();
  const resultado = await dividasService.processarAporte(params.id, body, userId);
  return NextResponse.json(resultado);
}
