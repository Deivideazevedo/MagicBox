import { divergenciasService } from "@/core/divergencias/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(listarAjustes);

async function listarAjustes(req: NextRequest) {
  const { userId } = await getAuthUser(req);
  const ajustes = await divergenciasService.listarHistoricoAjustes(userId);
  return NextResponse.json({ success: true, ajustes });
}
