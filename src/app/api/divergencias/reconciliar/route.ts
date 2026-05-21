import { divergenciasService } from "@/core/divergencias/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";

export const POST = errorHandler(reconciliarSaldo);

async function reconciliarSaldo(req: NextRequest) {
  const { userId } = await getAuthUser(req);
  const body = await req.json();
  const { saldoReal } = body;

  if (saldoReal === undefined || isNaN(parseFloat(saldoReal))) {
    return NextResponse.json(
      { success: false, message: "Saldo real inválido ou não informado." },
      { status: 400 }
    );
  }

  const result = await divergenciasService.ajustarSaldoReal(userId, parseFloat(saldoReal));

  return NextResponse.json(result);
}
