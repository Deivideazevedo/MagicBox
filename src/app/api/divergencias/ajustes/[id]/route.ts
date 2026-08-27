import { divergenciasService } from "@/core/divergencias/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = errorHandler(reverterAjuste);

async function reverterAjuste(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await getAuthUser(req);
  const ajusteId = Number(params.id);

  if (isNaN(ajusteId)) {
    return NextResponse.json(
      { success: false, message: "ID de ajuste inválido." },
      { status: 400 }
    );
  }

  const result = await divergenciasService.reverterAjuste(userId, ajusteId);
  return NextResponse.json(result);
}
