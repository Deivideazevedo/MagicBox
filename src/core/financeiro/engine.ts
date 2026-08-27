import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import {
  ConsolidadoFinanceiroResponse,
  PeriodoFiltro,
  TotaisAjustes,
  TotaisHistoricosGerais,
  TotaisOperacionais,
  SaldosConsolidados,
} from "./types";

interface RawTotaisDB {
  receitas_pagas: number;
  receitas_agendadas: number;
  despesas_pagas: number;
  despesas_agendadas: number;
  metas_pagas: number;
  metas_agendadas: number;
  ajustes_entrada: number;
  ajustes_saida: number;
}

interface RawHistoricoGeralDB {
  rec_pagas: number;
  desp_pagas: number;
  metas_pagas: number;
  ajustes_entrada: number;
  ajustes_saida: number;
  saldo_bloqueado_metas: number;
}

export const financeEngine = {
  /**
   * Calcula os totais históricos acumulados de caixa (Geral)
   */
  async calcularTotaisHistoricosGerais(userId: number): Promise<TotaisHistoricosGerais> {
    const raw = await prisma.$queryRaw<RawHistoricoGeralDB[]>`
      SELECT
        COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' AND l."receitaId" IS NOT NULL THEN l.valor ELSE 0 END), 0)::float as rec_pagas,
        COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' AND l."despesaId" IS NOT NULL THEN l.valor ELSE 0 END), 0)::float as desp_pagas,
        COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' AND l."objetivoId" IS NOT NULL THEN l.valor ELSE 0 END), 0)::float as metas_pagas,
        COALESCE(SUM(CASE WHEN l.tipo = 'ajuste' AND l.valor > 0 THEN l.valor ELSE 0 END), 0)::float as ajustes_entrada,
        COALESCE(SUM(CASE WHEN l.tipo = 'ajuste' AND l.valor < 0 THEN ABS(l.valor) ELSE 0 END), 0)::float as ajustes_saida
      FROM lancamento l
      WHERE l."userId" = ${userId};
    `;

    const row = raw[0] || {
      rec_pagas: 0,
      desp_pagas: 0,
      metas_pagas: 0,
      ajustes_entrada: 0,
      ajustes_saida: 0,
    };

    const receitasPagasGeral = row.rec_pagas;
    const despesasPagasGeral = row.desp_pagas;
    const metasPagasGeral = row.metas_pagas;
    const ajustesEntradaGeral = row.ajustes_entrada;
    const ajustesSaidaGeral = row.ajustes_saida;

    const saldoLivreGeral =
      receitasPagasGeral + ajustesEntradaGeral - despesasPagasGeral - ajustesSaidaGeral - metasPagasGeral;
    const saldoBrutoLiquido = saldoLivreGeral + metasPagasGeral;

    return {
      receitasPagasGeral,
      despesasPagasGeral,
      metasPagasGeral,
      ajustesEntradaGeral,
      ajustesSaidaGeral,
      saldoLivreGeral,
      saldoBrutoLiquido,
    };
  },

  /**
   * Executa a agregação e consolidação pura de valores para um período específico
   */
  async calcularConsolidadoPeriodo(filtro: PeriodoFiltro): Promise<ConsolidadoFinanceiroResponse> {
    const { userId, dataInicio, dataFim } = filtro;

    const [dadosPeriodoRaw, historicoGeral] = await Promise.all([
      prisma.$queryRaw<RawTotaisDB[]>`
        SELECT
          -- Operacionais Pagos
          COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' AND l."receitaId" IS NOT NULL THEN l.valor ELSE 0 END), 0)::float as receitas_pagas,
          COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' AND l."despesaId" IS NOT NULL THEN l.valor ELSE 0 END), 0)::float as despesas_pagas,
          COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' AND l."objetivoId" IS NOT NULL THEN l.valor ELSE 0 END), 0)::float as metas_pagas,

          -- Operacionais Agendados
          COALESCE(SUM(CASE WHEN l.tipo = 'agendamento' AND l."receitaId" IS NOT NULL THEN l.valor ELSE 0 END), 0)::float as receitas_agendadas,
          COALESCE(SUM(CASE WHEN l.tipo = 'agendamento' AND l."despesaId" IS NOT NULL THEN l.valor ELSE 0 END), 0)::float as despesas_agendadas,
          COALESCE(SUM(CASE WHEN l.tipo = 'agendamento' AND l."objetivoId" IS NOT NULL THEN l.valor ELSE 0 END), 0)::float as metas_agendadas,

          -- Ajustes de Conciliação / Divergência (Autônomos com sinal)
          COALESCE(SUM(CASE WHEN l.tipo = 'ajuste' AND l.valor > 0 THEN l.valor ELSE 0 END), 0)::float as ajustes_entrada,
          COALESCE(SUM(CASE WHEN l.tipo = 'ajuste' AND l.valor < 0 THEN ABS(l.valor) ELSE 0 END), 0)::float as ajustes_saida
        FROM lancamento l
        WHERE l."userId" = ${userId}
          AND l.data >= ${dataInicio}::date
          AND l.data <= ${dataFim}::date;
      `,
      this.calcularTotaisHistoricosGerais(userId),
    ]);

    const row = dadosPeriodoRaw[0] || {
      receitas_pagas: 0,
      receitas_agendadas: 0,
      despesas_pagas: 0,
      despesas_agendadas: 0,
      metas_pagas: 0,
      metas_agendadas: 0,
      ajustes_entrada: 0,
      ajustes_saida: 0,
    };

    const operacional: TotaisOperacionais = {
      receitasPagas: row.receitas_pagas,
      receitasAgendadas: row.receitas_agendadas,
      despesasPagas: row.despesas_pagas,
      despesasAgendadas: row.despesas_agendadas,
      metasPagas: row.metas_pagas,
      metasAgendadas: row.metas_agendadas,
    };

    const ajustes: TotaisAjustes = {
      entradas: row.ajustes_entrada,
      saidas: row.ajustes_saida,
      saldoLiquido: row.ajustes_entrada - row.ajustes_saida,
    };

    const saldoLivrePeriodo =
      operacional.receitasPagas + ajustes.entradas - operacional.despesasPagas - ajustes.saidas - operacional.metasPagas;

    const saldoProjetadoPeriodo =
      operacional.receitasAgendadas - operacional.despesasAgendadas - operacional.metasAgendadas;

    const saldos: SaldosConsolidados = {
      saldoLivrePeriodo,
      saldoLivreGeral: historicoGeral.saldoLivreGeral,
      saldoProjetadoPeriodo,
      saldoBloqueadoMetas: historicoGeral.metasPagasGeral,
    };

    return {
      periodo: filtro,
      operacional,
      ajustes,
      saldos,
      geradoEm: new Date().toISOString(),
    };
  },

  /**
   * Invalida instantaneamente todo o cache financeiro deste usuário
   */
  invalidarCache(userId: number): void {
    if (!userId) return;
    try {
      revalidateTag(`financeiro-${userId}`);
    } catch {
      // Ignora erro se executado fora do contexto de requisição HTTP do Next.js (ex: scripts/testes locais)
    }
  },
};
