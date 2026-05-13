import { relatoriosService } from "@/core/relatorios/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";
import { historicoFiltroSchema } from "@/core/relatorios/relatorio.dto";

export const GET = errorHandler(obterHistorico);

async function obterHistorico(req: NextRequest) {
  const { userId } = await getAuthUser(req);
  
  const { searchParams } = req.nextUrl;
  
  // Validar via Zod DTO
  const { itens, ano } = historicoFiltroSchema.parse(Object.fromEntries(searchParams));

  const historico = await relatoriosService.obterHistoricoAgrupado(
    userId,
    itens,
    ano
  );

  return NextResponse.json(historico);
}
