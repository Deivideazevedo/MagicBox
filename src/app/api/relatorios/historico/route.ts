import { relatoriosService } from "@/core/relatorios/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";

export const POST = errorHandler(obterHistorico);

async function obterHistorico(req: NextRequest) {
  const { userId } = await getAuthUser(req);
  
  const body = await req.json();
  const { itens, ano } = body;

  if (!itens || !Array.isArray(itens) || !ano) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const historico = await relatoriosService.obterHistoricoAgrupado(
    userId,
    itens,
    Number(ano)
  );

  return NextResponse.json(historico);
}
