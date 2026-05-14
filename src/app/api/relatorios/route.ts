import { relatoriosService as servico } from "@/core/relatorios/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/relatorios
 * Retorna TODOS os dados (reais + projeções) em uma única chamada.
 * O filtro de projeção é feito no frontend via switch.
 */
export const GET = errorHandler(buscarRelatorio);

async function buscarRelatorio(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataInicioParam = searchParams.get("dataInicio");
  const dataFimParam = searchParams.get("dataFim");

  const dataInicio = dataInicioParam ? new Date(dataInicioParam) : new Date();
  const dataFim = dataFimParam ? new Date(dataFimParam) : new Date();
  const itemId = searchParams.get("itemId");
  const tipo = searchParams.get("tipo") as "RECEITA" | "DESPESA" | null;
  const { userId } = await getAuthUser(req);
  const relatorio = await servico.gerarRelatorio(userId, dataInicio, dataFim);
  return NextResponse.json(relatorio);
}
