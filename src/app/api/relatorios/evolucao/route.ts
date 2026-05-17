import { relatoriosService } from "@/core/relatorios/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";
import { evolucaoFiltroSchema } from "@/core/relatorios/relatorio.dto";

export const GET = errorHandler(obterEvolucao);

async function obterEvolucao(req: NextRequest) {
  const { userId } = await getAuthUser(req);

  const { searchParams } = req.nextUrl;
  const { ano } = evolucaoFiltroSchema.parse(Object.fromEntries(searchParams));

  const evolucao = await relatoriosService.obterEvolucaoAnual(userId, ano);

  return NextResponse.json(evolucao);
}
