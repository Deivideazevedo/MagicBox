import { divergenciasService } from "@/core/divergencias/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(obterDivergencias);

async function obterDivergencias(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const saldoRealParam = searchParams.get("saldoReal");

  const { userId } = await getAuthUser(req);

  const saldoReal = saldoRealParam !== null && !isNaN(parseFloat(saldoRealParam))
    ? parseFloat(saldoRealParam)
    : undefined;

  const data = await divergenciasService.obterCentralDivergencias(userId, saldoReal);

  return NextResponse.json(data);
}
