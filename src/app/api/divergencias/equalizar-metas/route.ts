import { divergenciasService } from "@/core/divergencias/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";

export const POST = errorHandler(equalizarMetas);

async function equalizarMetas(req: NextRequest) {
  const { userId } = await getAuthUser(req);
  const result = await divergenciasService.equalizarCapitalMetas(userId);
  return NextResponse.json(result);
}
