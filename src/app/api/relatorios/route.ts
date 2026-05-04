import { relatoriosService as servico } from "@/core/relatorios/service";
import { getAuthUser } from "@/lib/server-auth";
import { errorHandler } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/relatorios
 * Query Params: dataInicio, dataFim, itemId (opcional), tipo (opcional)
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

  // Se houver itemId, busca o histórico detalhado do item (tabela lateral)
  if (itemId && tipo) {
    const detalhes = await servico.obterDetalhesItem(userId, parseInt(itemId), tipo);
    return NextResponse.json(detalhes);
  }

  // Caso contrário, busca o relatório completo do período
  const relatorio = await servico.gerarRelatorio(userId, dataInicio, dataFim);
  return NextResponse.json(relatorio);
}
