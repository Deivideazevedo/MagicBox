import { divergenciasService } from "@/core/divergencias/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";

export const POST = errorHandler(ajustarFuro);

async function ajustarFuro(req: NextRequest) {
  const { userId } = await getAuthUser(req);
  const body = await req.json();
  const { mes } = body;

  if (!mes || typeof mes !== "string") {
    return NextResponse.json(
      { success: false, message: "Mês inválido ou não informado." },
      { status: 400 }
    );
  }

  const result = await divergenciasService.ajustarFuroMensal(userId, mes);

  return NextResponse.json(result);
}
