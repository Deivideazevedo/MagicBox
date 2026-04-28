import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export interface HeatmapItem {
  id: string | number;
  nome: string;
  valor: number;
  tipo: "pagamento" | "agendamento";
  origem: "despesa" | "receita" | "meta";
  icone?: string;
  cor?: string;
  observacao?: string;
}

export interface HeatmapDay {
  date: string;
  realized: number;
  projected: number;
  items: HeatmapItem[];
}

export const heatmapRepository = {
  async obterDadosHeatmap(userId: number, dataInicio: string, dataFim: string): Promise<Record<string, HeatmapDay>> {
    // A query SQL a seguir busca lançamentos reais e gera projeções para itens fixos
    // que ainda não foram lançados no mês de referência.
    const response = await prisma.$queryRaw<any[]>`
      WITH dias_do_periodo AS (
        SELECT generate_series(${dataInicio}::date, ${dataFim}::date, '1 day'::interval)::date as dia
      ),
      lancamentos_reais AS (
        SELECT 
          l.id,
          l.data::date as dia,
          l.valor::float as valor,
          l.tipo::text as tipo,
          CASE 
            WHEN l."receitaId" IS NOT NULL THEN 'receita'
            WHEN l."despesaId" IS NOT NULL THEN 'despesa'
            WHEN l."metaId" IS NOT NULL THEN 'meta'
            ELSE 'outros'
          END as origem,
          COALESCE(d.nome, r.nome, m.nome, l.observacao, l."observacaoAutomatica", 'Transação') as nome,
          c.nome as categoria,
          COALESCE(d.icone, r.icone, m.icone) as icone,
          COALESCE(d.cor, r.cor, m.cor) as cor,
          COALESCE(l.observacao, l."observacaoAutomatica", 'Sem observação') as observacao,
          l."despesaId",
          l."receitaId"
        FROM lancamento l
        LEFT JOIN despesa d ON l."despesaId" = d.id
        LEFT JOIN receita r ON l."receitaId" = r.id
        LEFT JOIN meta m ON l."metaId" = m.id
        LEFT JOIN "categorias" c ON (d."categoriaId" = c.id OR r."categoriaId" = c.id)
        WHERE l."userId" = ${userId} 
          AND l.data >= ${dataInicio}::date 
          AND l.data <= ${dataFim}::date
      ),
      recorrencias_base AS (
        -- Despesas Fixas
        SELECT 
          d.id as "origemId",
          'despesa' as origem,
          d.nome,
          c.nome as categoria,
          d."valorEstimado"::float as valor,
          d."diaVencimento" as dia_vencimento,
          d.icone,
          d.cor,
          d."createdAt" as created_at,
          d."dataInicio" as data_inicio
        FROM despesa d
        LEFT JOIN "categorias" c ON d."categoriaId" = c.id
        WHERE d."userId" = ${userId} 
          AND d.status = 'A' 
          AND d.tipo = 'FIXA'
          AND d."deletedAt" IS NULL
        
        UNION ALL
        
        -- Receitas Fixas
        SELECT 
          r.id as "origemId",
          'receita' as origem,
          r.nome,
          c.nome as categoria,
          r."valorEstimado"::float as valor,
          r."diaRecebimento" as dia_vencimento,
          r.icone,
          r.cor,
          r."createdAt" as created_at,
          NULL as data_inicio
        FROM receita r
        LEFT JOIN "categorias" c ON r."categoriaId" = c.id
        WHERE r."userId" = ${userId} 
          AND r.status = 'A' 
          AND r.tipo = 'FIXA'
          AND r."deletedAt" IS NULL
      ),
      projeções_virtuais AS (
        SELECT 
          d.dia,
          rb.valor,
          'agendamento'::text as tipo,
          rb.origem,
          rb.nome,
          rb.categoria,
          rb.icone,
          rb.cor,
          'Projeção baseada em histórico fixo' as observacao
        FROM dias_do_periodo d
        CROSS JOIN recorrencias_base rb
        WHERE 
          -- Somente projetar no dia de vencimento/recebimento
          EXTRACT(DAY FROM d.dia) = rb.dia_vencimento
          -- Somente se o item já existia na data (considerando dataInicio se disponível)
          AND d.dia >= date_trunc('month', COALESCE(rb.data_inicio, rb.created_at))
          -- Somente se não houver NENHUM lançamento do tipo 'agendamento' para este item no mês
          -- (Pagamentos não anulam a projeção virtual conforme regra de negócio)
          AND NOT EXISTS (
            SELECT 1 FROM lancamento l
            WHERE l."userId" = ${userId}
              AND l.tipo = 'agendamento'
              AND (
                (rb.origem = 'despesa' AND l."despesaId" = rb."origemId") OR
                (rb.origem = 'receita' AND l."receitaId" = rb."origemId")
              )
              AND EXTRACT(MONTH FROM l.data) = EXTRACT(MONTH FROM d.dia)
              AND EXTRACT(YEAR FROM l.data) = EXTRACT(YEAR FROM d.dia)
          )
      ),
      uniao_final AS (
        SELECT dia, valor, tipo, origem, nome, categoria, icone, cor, observacao FROM lancamentos_reais
        UNION ALL
        SELECT dia, valor, tipo, origem, nome, categoria, icone, cor, observacao FROM projeções_virtuais
      )
      SELECT 
        to_char(dia, 'YYYY-MM-DD') as date,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'nome', nome,
            'categoria', categoria,
            'valor', valor,
            'tipo', tipo,
            'origem', origem,
            'icone', icone,
            'cor', cor,
            'observacao', observacao
          )
        ) as items
      FROM uniao_final
      GROUP BY dia
      ORDER BY dia;
    `;

    const heatmapData: Record<string, HeatmapDay> = {};

    response.forEach((row: any) => {
      const items = row.items || [];
      const realized = items.filter((i: any) => i.tipo === 'pagamento').length;
      const projected = items.filter((i: any) => i.tipo === 'agendamento').length;

      heatmapData[row.date] = {
        date: row.date,
        realized,
        projected,
        items
      };
    });

    return heatmapData;
  }
};
