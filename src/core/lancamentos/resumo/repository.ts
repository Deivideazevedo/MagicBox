import { prisma } from "@/lib/prisma";
import {
  ResumoMiniCardsProps,
  ResumoResposta,
  TotaisHistoricos,
} from "./types";
import { Prisma, Lancamento as PrismaResumo } from "@prisma/client";
import {
  ResumoCardFiltros,
  ResumoFiltros,
  ResumoTodosFiltros,
} from "./resumo.dto";
import { calcularStatus } from "./utils";

interface ResumoCardDB {
  pagoCount: number;
  agendadoCount: number;
  entradasPagas: number;
  entradasAgendadas: number;
  saidasPagas: number;
  saidasAgendadas: number;
  metasPagas: number;
  metasAgendadas: number;
  total_projetado: number;
  entradas_projetadas: number;
  saidas_projetadas: number;
  saldoBloqueado: number;
}

export const resumoRepository = {
  async obterResumo({
    userId,
    dataInicio,
    dataFim,
  }: ResumoFiltros): Promise<ResumoResposta[]> {
    const response = await prisma.$queryRaw<ResumoResposta[]>`
      WITH meses_do_periodo AS (
        SELECT 
          mes_referencia::date,
          EXTRACT(DAY FROM (mes_referencia + interval '1 month - 1 day')) as ultimo_dia_mes
        FROM generate_series(
          date_trunc('month', ${dataInicio}::date),
          date_trunc('month', ${dataFim}::date),
          '1 month'::interval
        ) as mes_referencia
      ),
      saldos_devedores AS (
        SELECT 
          "despesaId",
          SUM(valor) as total_pago
        FROM lancamento
        WHERE "userId" = ${userId} AND tipo = 'pagamento' AND "despesaId" IS NOT NULL
        GROUP BY "despesaId"
      ),
      itens_recorrentes_base AS (
        -- DESPESAS FIXAS
        SELECT
          d.id as "origemId",
          'despesa' as "origem",
          d.nome,
          d."valorEstimado" as "valorPrevisto",
          d."diaVencimento" as "diaVencido",
          d.icone,
          d.cor,
          d.status as "statusAtivo",
          EXTRACT(MONTH FROM m.mes_referencia) as "mes",
          EXTRACT(YEAR FROM m.mes_referencia) as "ano",
          (date_trunc('month', m.mes_referencia) + (LEAST(d."diaVencimento", m.ultimo_dia_mes) - 1) * interval '1 day')::date as "data_referencia"
        FROM despesa d
        CROSS JOIN meses_do_periodo m
        WHERE d."userId" = ${userId}
          AND d.status = 'A'
          AND d.tipo = 'FIXA'
          AND d."deletedAt" IS NULL
          AND m.mes_referencia >= date_trunc('month', d."createdAt")
        
        UNION ALL
        
        -- DÍVIDAS (Amortizadas)
        SELECT
          d.id as "origemId",
          'despesa' as "origem",
          d.nome,
          d."valorEstimado" as "valorPrevisto",
          d."diaVencimento" as "diaVencido",
          d.icone,
          d.cor,
          d.status as "statusAtivo",
          EXTRACT(MONTH FROM m.mes_referencia) as "mes",
          EXTRACT(YEAR FROM m.mes_referencia) as "ano",
          (date_trunc('month', m.mes_referencia) + (LEAST(d."diaVencimento", m.ultimo_dia_mes) - 1) * interval '1 day')::date as "data_referencia"
        FROM despesa d
        LEFT JOIN saldos_devedores s ON s."despesaId" = d.id
        CROSS JOIN meses_do_periodo m
        WHERE d."userId" = ${userId}
          AND d.status = 'A'
          AND d.tipo = 'DIVIDA'
          AND d."deletedAt" IS NULL
          AND m.mes_referencia >= date_trunc('month', COALESCE(d."dataInicio", d."createdAt"))
          -- Só projeta se ainda houver saldo devedor
          AND (COALESCE(d."valorTotal", 0) - COALESCE(s.total_pago, 0)) > 0
        
        UNION ALL
        
        -- RENDAS MENSAIS (RECEITAS)
        SELECT
          f.id as "origemId",
          'receita' as "origem",
          f.nome,
          f."valorEstimado" as "valorPrevisto",
          f."diaRecebimento" as "diaVencido",
          f.icone,
          f.cor,
          f.status as "statusAtivo",
          EXTRACT(MONTH FROM m.mes_referencia) as "mes",
          EXTRACT(YEAR FROM m.mes_referencia) as "ano",
          (date_trunc('month', m.mes_referencia) + (LEAST(f."diaRecebimento", m.ultimo_dia_mes) - 1) * interval '1 day')::date as "data_referencia"
        FROM receita f
        CROSS JOIN meses_do_periodo m
        WHERE f."userId" = ${userId}
          AND f.status = 'A'
          AND f.tipo = 'FIXA'
          AND f."deletedAt" IS NULL
          AND m.mes_referencia >= date_trunc('month', f."createdAt")
      ),
      lancamentos_reais_agrupados AS (
          SELECT
              COALESCE(l."receitaId", l."despesaId", l."objetivoId") as "origemId",
              CASE 
                WHEN l."receitaId" IS NOT NULL THEN 'receita' 
                WHEN l."objetivoId" IS NOT NULL THEN 'meta'
                ELSE 'despesa' 
              END as "origem",
              EXTRACT(MONTH FROM l.data) as "mes",
              EXTRACT(YEAR FROM l.data) as "ano",
              SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END) as "valorPrevisto",
              SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END) as "valorPago",
              MAX(EXTRACT(DAY FROM l.data)) as "diaReferencia",
              JSON_AGG(
                JSON_BUILD_OBJECT(
                   'id', l.id, 
                   'data', l.data, 
                   'valor', l.valor, 
                   'tipo', l.tipo, 
                   'observacao', COALESCE(l.observacao, l."observacaoAutomatica")
                ) ORDER BY l.data DESC
              ) as "detalhes"
          FROM lancamento l
          LEFT JOIN despesa d ON l."despesaId" = d.id
          LEFT JOIN receita r ON l."receitaId" = r.id
          LEFT JOIN objetivo m ON l."objetivoId" = m.id
          WHERE l."userId" = ${userId} 
            AND l.data >= ${dataInicio}::date 
            AND l.data <= ${dataFim}::date
            AND (
              (l."despesaId" IS NOT NULL AND d."deletedAt" IS NULL) OR
              (l."receitaId" IS NOT NULL AND r."deletedAt" IS NULL) OR
              (l."objetivoId" IS NOT NULL AND m."deletedAt" IS NULL) OR
              (l."despesaId" IS NULL AND l."receitaId" IS NULL AND l."objetivoId" IS NULL)
            )
          GROUP BY 1, 2, 3, 4
      ),
      ultimo_lancamento_despesa AS (
        SELECT DISTINCT ON (l."despesaId", DATE_TRUNC('month', l.data)::date)
          l."despesaId",
          DATE_TRUNC('month', l.data)::date as mes_ref,
          l."observacaoAutomatica"
        FROM lancamento l
        WHERE l.tipo = 'pagamento' AND l."despesaId" IS NOT NULL
        ORDER BY l."despesaId", DATE_TRUNC('month', l.data)::date, l."createdAt" DESC
      ),
      uniao_de_dados AS (
          SELECT
              COALESCE(real."origemId", rec."origemId") as "origemId",
              COALESCE(real."origem", rec."origem") as "origem",
              COALESCE(real."mes", rec."mes") as "mes",
              COALESCE(real."ano", rec."ano") as "ano",
              COALESCE(rec."valorPrevisto", real."valorPrevisto") as "valorPrevisto",
              COALESCE(real."valorPago", 0) as "valorPago",
              COALESCE(real."detalhes",
                JSON_BUILD_ARRAY(
                  JSON_BUILD_OBJECT(
                    'id', rec."origem" || '-' || rec."origemId",
                    'data', rec."data_referencia",
                    'valor', rec."valorPrevisto",
                    'tipo', 'agendamento',
                    'observacao', 'Agendamento recorrente mensal'
                  )
                )
              ) as "detalhes",
              COALESCE(rec.nome, d.nome, f.nome, m.nome) as "nome",
              COALESCE(rec."diaVencido", d."diaVencimento", f."diaRecebimento", real."diaReferencia") as "diaVencido",
              COALESCE(rec.icone, d.icone, f.icone, m.icone) as "icone",
              COALESCE(rec.cor, d.cor, f.cor, m.cor) as "cor",
              CASE WHEN real."origemId" IS NULL THEN true ELSE false END as "isProjetado",
              COALESCE(rec."statusAtivo", d.status, f.status, m.status) as "statusAtivo",
              COALESCE(ult."observacaoAutomatica", '') as "observacaoQuitacao"
          -- União de dados: Cruza o planejado (recorrências) com o realizado (lançamentos)
          FROM itens_recorrentes_base rec
          FULL OUTER JOIN lancamentos_reais_agrupados real
            ON rec."origemId" = real."origemId" AND rec."origem" = real."origem"
            AND rec."mes" = real."mes" AND rec."ano" = real."ano"
          LEFT JOIN despesa d ON real."origemId" = d.id AND real."origem" = 'despesa'
          LEFT JOIN receita f ON real."origemId" = f.id AND real."origem" = 'receita'
          LEFT JOIN objetivo m ON real."origemId" = m.id AND real."origem" = 'meta'
          LEFT JOIN ultimo_lancamento_despesa ult
            ON COALESCE(real."origemId", rec."origemId") = ult."despesaId"
            AND DATE_TRUNC('month', (COALESCE(real."ano", rec."ano")::text || '-' || LPAD(COALESCE(real."mes", rec."mes")::text, 2, '0') || '-01')::date)::date = ult.mes_ref
      )
      SELECT * FROM uniao_de_dados ORDER BY "ano", "mes", "nome";
    `;

    return response.map((item) => {
      const valorPago = Number(item.valorPago);
      const mes = Number(item.mes);
      const ano = Number(item.ano);

      // Verificar quitação apenas para o mês corrente
      const temQuitacao =
        (item.observacaoQuitacao ?? "").includes("[QUITAÇÃO]");

      const valorPrevisto = temQuitacao
        ? valorPago
        : Number(item.valorPrevisto);

      const { label, isAtrasado } = calcularStatus(
        valorPago,
        valorPrevisto,
        item.diaVencido,
        mes,
        ano,
        temQuitacao
      );

      return {
        ...item,
        valorPago,
        valorPrevisto,
        mes,
        ano,
        id: `${item.origem}-${item.origemId}-${mes}-${ano}`,
        status: label,
        statusAtivo: (item.statusAtivo ?? null) as "A" | "I" | null,
        temQuitacao,
        atrasado: isAtrasado,
        isProjetado: item.isProjetado,
        detalhes: item.detalhes,
      };
    });
  },

  async obterCardResumo({
    userId,
    dataInicio,
    dataFim,
  }: ResumoCardFiltros): Promise<ResumoMiniCardsProps> {
    // Para garantir consistência matemática com a tela de detalhes e relatórios (incluindo quitação),
    // utilizamos a função obterResumo que já contém a lógica de encontro de contas e tags correta.
    const projecoes = await this.obterResumo({ userId, dataInicio, dataFim });

    let totalEntradas = 0;
    let entradasPagas = 0;
    let entradasAgendadas = 0;

    let totalSaidas = 0;
    let saidasPagas = 0;
    let saidasAgendadas = 0;

    let metasPagas = 0;
    let metasAgendadas = 0;

    let transacoesPagas = 0;
    let transacoesAgendadas = 0;

    for (const p of projecoes) {
      const pago = Number(p.valorPago) || 0;
      const previsto = Number(p.valorPrevisto) || 0;
      const maior = Math.max(pago, previsto);

      if (p.detalhes && Array.isArray(p.detalhes)) {
        for (const det of p.detalhes as any[]) {
          if (det.tipo === "pagamento") transacoesPagas++;
          if (det.tipo === "agendamento") transacoesAgendadas++;
        }
      }

      if (p.origem === "receita") {
        entradasPagas += pago;
        entradasAgendadas += previsto;
        totalEntradas += maior;
      } else if (p.origem === "meta") {
        metasPagas += pago;
        metasAgendadas += previsto;
      } else {
        saidasPagas += pago;
        saidasAgendadas += previsto;
        totalSaidas += maior;
      }
    }

    const saldoAtual = entradasPagas - saidasPagas;
    const saldoProjetado = entradasAgendadas - saidasAgendadas;
    const saldoBloqueado = metasPagas;
    const saldoLivre = saldoAtual - saldoBloqueado;

    const totaisGerais = userId 
      ? await this.obterTotaisHistoricos(userId) 
      : { receitasPagas: 0, despesasPagas: 0, metas: 0 };
    const saldoGlobal = totaisGerais.receitasPagas - totaisGerais.despesasPagas - totaisGerais.metas;

    return {
      totalTransacoes: transacoesPagas + transacoesAgendadas,
      transacoesPagas,
      transacoesAgendadas,

      totalEntradas,
      entradasPagas,
      entradasAgendadas,
      diferencaEntradas: Math.max(0, entradasAgendadas - entradasPagas),

      totalSaidas,
      saidasPagas,
      saidasAgendadas,
      diferencaSaidas: Math.max(0, saidasAgendadas - saidasPagas),

      totalSaldo: totalEntradas - totalSaidas,
      saldoAtual,
      saldoProjetado,
      saldoGlobal,
      saldoBloqueado,
      saldoLivre,

      metasPagas,
      metasAgendadas,
    };
  },

  async listarTodos(filtros: ResumoTodosFiltros): Promise<PrismaResumo[]> {
    const { dataInicio, dataFim, ...restoDosFiltros } = filtros;
    return await prisma.lancamento.findMany({
      where: {
        ...restoDosFiltros,
        data:
          dataInicio || dataFim
            ? {
                ...(dataInicio && { gte: dataInicio }),
                ...(dataFim && { lte: dataFim }),
              }
            : undefined,
      },
      orderBy: { data: "desc" },
      include: {
        despesa: {
          select: {
            id: true,
            nome: true,
            valorEstimado: true,
            diaVencimento: true,
            icone: true,
            cor: true,
          },
        },
        receita: {
          select: {
            id: true,
            nome: true,
            valorEstimado: true,
            diaRecebimento: true,
            icone: true,
            cor: true,
          },
        },
      },
    });
  },

  async obterTotaisHistoricos(userId: number): Promise<TotaisHistoricos> {
    const results = (await prisma.$queryRaw`
      WITH totais_base AS (
        SELECT 
          SUM(CASE WHEN l."receitaId" IS NOT NULL AND l.tipo = 'pagamento' THEN l.valor ELSE 0 END) as rec_paga,
          SUM(CASE WHEN l."receitaId" IS NOT NULL AND l.tipo = 'agendamento' THEN l.valor ELSE 0 END) as rec_prev,
          SUM(CASE WHEN l."despesaId" IS NOT NULL AND l.tipo = 'pagamento' THEN l.valor ELSE 0 END) as desp_paga,
          SUM(CASE WHEN l."despesaId" IS NOT NULL AND l.tipo = 'agendamento' THEN l.valor ELSE 0 END) as desp_prev,
          SUM(CASE WHEN l."objetivoId" IS NOT NULL AND l.tipo = 'pagamento' THEN l.valor ELSE 0 END) as meta_paga
        FROM lancamento l
        LEFT JOIN despesa d ON l."despesaId" = d.id
        LEFT JOIN receita r ON l."receitaId" = r.id
        LEFT JOIN objetivo m ON l."objetivoId" = m.id
        WHERE l."userId" = ${userId}
          AND (
            (l."despesaId" IS NOT NULL AND d."deletedAt" IS NULL AND d.status = 'A' ) OR
            (l."receitaId" IS NOT NULL AND r."deletedAt" IS NULL AND r.status = 'A' ) OR
            (l."objetivoId" IS NOT NULL AND m."deletedAt" IS NULL AND m.status = 'A' )
          )
      )
      SELECT 
        COALESCE(rec_paga, 0)::float as "receitasPagas",
        COALESCE(rec_prev, 0)::float as "receitasPrevistas",
        COALESCE(desp_paga, 0)::float as "despesasPagas",
        COALESCE(desp_prev, 0)::float as "despesasPrevistas",
        COALESCE(meta_paga, 0)::float as "metasPagas"
      FROM totais_base;
    `) as any[];

    const data = results[0];

    return {
      receitas: Math.max(data.receitasPagas, data.receitasPrevistas),
      despesas: Math.max(data.despesasPagas, data.despesasPrevistas),
      metas: data.metasPagas,
      receitasPagas: data.receitasPagas,
      receitasPrevistas: data.receitasPrevistas,
      despesasPagas: data.despesasPagas,
      despesasPrevistas: data.despesasPrevistas,
    };
  },
};
