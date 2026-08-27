import { divergenciasService } from "@/core/divergencias/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";

export const POST = errorHandler(resolverAtrasado);

async function resolverAtrasado(req: NextRequest) {
  const { userId } = await getAuthUser(req);
  const body = await req.json();
  const { id, acao, valor } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { success: false, message: "ID do lançamento inválido." },
      { status: 400 }
    );
  }

  if (!acao || !["quitar", "isentar", "descartar"].includes(acao)) {
    return NextResponse.json(
      { success: false, message: "Ação inválida. Utilize quitar, isentar ou descartar." },
      { status: 400 }
    );
  }

  const result = await divergenciasService.resolverAtrasado(userId, {
    id,
    acao,
    valor: valor ? Number(valor) : undefined,
  });

  return NextResponse.json(result);
}
