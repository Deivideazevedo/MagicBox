import { prisma } from "@/lib/prisma";

export interface DespesaPendenteRow {
  id: number;
  nome: string;
  tipo: "DIVIDA" | "VARIAVEL" | "FIXA";
  valorRestante: number;
  valorProximaParcela: number;
  proximoVencimento: Date | null;
  diasParaVencer: number | null;
}

export interface DespesaPendenteGeralRow extends DespesaPendenteRow {
  userId: number;
}

export const disparosRepository = {
  /**
   * Executa a query CTE para consolidar todas as despesas pendentes do usuário.
   * Retorna os dados correspondentes às listagens de cards da rota de dívidas:
   * 1. Únicas (DIVIDA): com saldo global em aberto.
   * 2. Voláteis (VARIAVEL / FIXA com agendamento): com parcelas pendentes.
   * 3. Fixas puras: sem agendamento no mês atual e não quitadas.
   */
  async obterDespesasPendentesCTE(userId: number, dataAtual: Date): Promise<DespesaPendenteRow[]> {
    // Para evitar problemas com timezone e garantir consistência,
    // o truncamento e cálculo de data de hoje deve ser referenciado pela dataAtual passada por argumento.
    const rows = await prisma.$queryRaw<any[]>`
      WITH despesas_ativas AS (
        SELECT id, nome, tipo, "valorTotal", "valorEstimado", "diaVencimento", "dataInicio", "userId"
        FROM despesa
        WHERE "userId" = ${userId} AND status = 'A' AND "deletedAt" IS NULL
      ),
      pagamentos_globais AS (
        -- Total pago acumulado globalmente por despesa
        SELECT 
          "despesaId",
          COALESCE(SUM(valor), 0)::float as pago_global
        FROM lancamento
        WHERE "userId" = ${userId} AND tipo = 'pagamento'
        GROUP BY "despesaId"
      ),
      agendamentos_unicas AS (
        -- Cronograma mensal de agendamentos e pagamentos de dívidas Únicas
        SELECT 
          l."despesaId",
          l.data as data_vencimento,
          l.valor as valor_agendado,
          COALESCE(lp.total_pago_mes, 0)::float as valor_pago_mes
        FROM lancamento l
        INNER JOIN despesa d ON l."despesaId" = d.id
        LEFT JOIN (
          SELECT 
            "despesaId",
            DATE_TRUNC('month', data) as mes,
            SUM(valor) as total_pago_mes
          FROM lancamento
          WHERE "userId" = ${userId} AND tipo = 'pagamento'
          GROUP BY "despesaId", DATE_TRUNC('month', data)
        ) lp ON l."despesaId" = lp."despesaId" AND DATE_TRUNC('month', l.data) = lp.mes
        WHERE d."userId" = ${userId} AND d.tipo = 'DIVIDA' AND d.status = 'A' AND d."deletedAt" IS NULL AND l.tipo = 'agendamento'
      ),
      unicas_proximo AS (
        -- Seleciona a primeira parcela não totalmente paga de cada dívida única
        SELECT DISTINCT ON ("despesaId")
          "despesaId",
          data_vencimento as proximo_vencimento,
          (valor_agendado - valor_pago_mes)::float as valor_proxima_parcela
        FROM agendamentos_unicas
        WHERE valor_pago_mes < valor_agendado - 0.01
        ORDER BY "despesaId", data_vencimento ASC
      ),
      unicas_consolidado AS (
        SELECT 
          du.id as despesa_id,
          du.nome,
          du.tipo,
          GREATEST(0, du."valorTotal" - COALESCE(pg.pago_global, 0))::float as valor_restante,
          COALESCE(up.valor_proxima_parcela, 0)::float as valor_proxima_parcela,
          up.proximo_vencimento
        FROM despesas_ativas du
        LEFT JOIN pagamentos_globais pg ON du.id = pg."despesaId"
        LEFT JOIN unicas_proximo up ON du.id = up."despesaId"
        WHERE du.tipo = 'DIVIDA' AND GREATEST(0, du."valorTotal" - COALESCE(pg.pago_global, 0)) > 0.01
      ),
      -- Dívidas voláteis (VARIAVEL ou FIXA com agendamentos)
      volateis_meses AS (
        SELECT 
          l."despesaId",
          DATE_TRUNC('month', l.data) as mes_referencia,
          MIN(l.data) as data_referencia,
          COALESCE(SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END), 0)::float as total_agendado,
          COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END), 0)::float as total_pago
        FROM lancamento l
        INNER JOIN despesa d ON l."despesaId" = d.id
        WHERE d."userId" = ${userId} 
          AND d.tipo IN ('VARIAVEL', 'FIXA') 
          AND d.status = 'A'
          AND d."deletedAt" IS NULL
        GROUP BY l."despesaId", DATE_TRUNC('month', l.data)
      ),
      volateis_meses_abertos AS (
        SELECT 
          "despesaId",
          mes_referencia,
          data_referencia,
          total_agendado,
          total_pago,
          GREATEST(0, total_agendado - total_pago) as valor_aberto
        FROM volateis_meses
        WHERE total_agendado > 0 AND total_pago < total_agendado - 0.01
      ),
      volateis_proximo_parcela AS (
        SELECT DISTINCT ON ("despesaId")
          "despesaId",
          data_referencia as proximo_vencimento,
          valor_aberto as valor_proxima_parcela
        FROM volateis_meses_abertos
        ORDER BY "despesaId", mes_referencia ASC
      ),
      volateis_consolidado AS (
        SELECT 
          da.id as despesa_id,
          da.nome,
          da.tipo,
          COALESCE(vma.valor_restante, 0)::float as valor_restante,
          COALESCE(vpp.valor_proxima_parcela, 0)::float as valor_proxima_parcela,
          vpp.proximo_vencimento
        FROM despesas_ativas da
        JOIN (
          SELECT "despesaId", SUM(valor_aberto) as valor_restante
          FROM volateis_meses_abertos
          GROUP BY "despesaId"
        ) vma ON da.id = vma."despesaId"
        LEFT JOIN volateis_proximo_parcela vpp ON da.id = vpp."despesaId"
        WHERE da.tipo IN ('VARIAVEL', 'FIXA')
      ),
      -- Dívidas fixas sem agendamento no mês atual (FIXA puras)
      fixas_pagamentos_mes_atual AS (
        SELECT 
          l."despesaId",
          COALESCE(SUM(l.valor), 0)::float as pago_mes_atual,
          BOOL_OR(COALESCE(l."observacaoAutomatica" LIKE '%[QUITAÇÃO]%', false)) as tem_quitacao
        FROM lancamento l
        WHERE l."userId" = ${userId} 
          AND l.tipo = 'pagamento'
          AND l.data >= DATE_TRUNC('month', ${dataAtual}::timestamp)
          AND l.data <= (DATE_TRUNC('month', ${dataAtual}::timestamp) + INTERVAL '1 month' - INTERVAL '1 millisecond')
        GROUP BY l."despesaId"
      ),
      fixas_sem_agendamentos AS (
        SELECT 
          da.id as despesa_id,
          da.nome,
          da.tipo,
          da."valorEstimado",
          da."diaVencimento",
          COALESCE(fpm.pago_mes_atual, 0)::float as pago_mes_atual,
          COALESCE(fpm.tem_quitacao, false) as tem_quitacao
        FROM despesas_ativas da
        LEFT JOIN fixas_pagamentos_mes_atual fpm ON da.id = fpm."despesaId"
        WHERE da.tipo = 'FIXA'
          AND NOT EXISTS (
            SELECT 1 FROM lancamento l
            WHERE l."despesaId" = da.id AND l.tipo = 'agendamento'
          )
      ),
      fixas_calculadas AS (
        SELECT 
          despesa_id,
          nome,
          tipo,
          "valorEstimado",
          "diaVencimento",
          pago_mes_atual,
          tem_quitacao,
          (tem_quitacao OR (pago_mes_atual >= "valorEstimado" - 0.01)) as concluida
        FROM fixas_sem_agendamentos
      ),
      fixas_consolidado AS (
        SELECT 
          fc.despesa_id,
          fc.nome,
          fc.tipo,
          (CASE WHEN fc.concluida THEN 0 ELSE GREATEST(0, fc."valorEstimado" - fc.pago_mes_atual) END)::float as valor_restante,
          (CASE WHEN fc.concluida THEN 0 ELSE fc."valorEstimado" END)::float as valor_proxima_parcela,
          (
            DATE_TRUNC('month', ${dataAtual}::timestamp) + 
            (LEAST(
              fc."diaVencimento", 
              EXTRACT(DAY FROM (DATE_TRUNC('month', ${dataAtual}::timestamp) + INTERVAL '1 month' - INTERVAL '1 day'))
            )::integer - 1) * INTERVAL '1 day'
          )::timestamp as proximo_vencimento
        FROM fixas_calculadas fc
        WHERE NOT fc.concluida
      )
      
      -- Unificação de todos os tipos de despesas
      SELECT 
        despesa_id as "id",
        nome,
        tipo::text as "tipo",
        valor_restante as "valorRestante",
        valor_proxima_parcela as "valorProximaParcela",
        proximo_vencimento as "proximoVencimento",
        EXTRACT(DAY FROM (proximo_vencimento - DATE_TRUNC('day', ${dataAtual}::timestamp)))::integer as "diasParaVencer"
      FROM unicas_consolidado
      
      UNION ALL
      
      SELECT 
        despesa_id as "id",
        nome,
        tipo::text as "tipo",
        valor_restante as "valorRestante",
        valor_proxima_parcela as "valorProximaParcela",
        proximo_vencimento as "proximoVencimento",
        EXTRACT(DAY FROM (proximo_vencimento - DATE_TRUNC('day', ${dataAtual}::timestamp)))::integer as "diasParaVencer"
      FROM volateis_consolidado
      
      UNION ALL
      
      SELECT 
        despesa_id as "id",
        nome,
        tipo::text as "tipo",
        valor_restante as "valorRestante",
        valor_proxima_parcela as "valorProximaParcela",
        proximo_vencimento as "proximoVencimento",
        EXTRACT(DAY FROM (proximo_vencimento - DATE_TRUNC('day', ${dataAtual}::timestamp)))::integer as "diasParaVencer"
      FROM fixas_consolidado;
    `;

    return rows.map(r => ({
      id: Number(r.id),
      nome: r.nome,
      tipo: r.tipo as "DIVIDA" | "VARIAVEL" | "FIXA",
      valorRestante: Number(r.valorRestante || 0),
      valorProximaParcela: Number(r.valorProximaParcela || 0),
      proximoVencimento: r.proximoVencimento ? new Date(r.proximoVencimento) : null,
      diasParaVencer: r.diasParaVencer !== null && r.diasParaVencer !== undefined ? Number(r.diasParaVencer) : null
    }));
  },

  /**
   * Executa a query CTE para consolidar todas as despesas pendentes de TODOS os usuários ativos.
   * Retorna os dados com o respectivo userId para mapeamento em memória.
   */
  async obterDespesasPendentesGeralCTE(dataAtual: Date): Promise<DespesaPendenteGeralRow[]> {
    const rows = await prisma.$queryRaw<any[]>`
      WITH despesas_ativas AS (
        SELECT d.id, d.nome, d.tipo, d."valorTotal", d."valorEstimado", d."diaVencimento", d."dataInicio", d."userId"
        FROM despesa d
        INNER JOIN "user" u ON d."userId" = u.id
        WHERE u.status = 'A' AND u."deletedAt" IS NULL AND d.status = 'A' AND d."deletedAt" IS NULL
      ),
      pagamentos_globais AS (
        -- Total pago acumulado globalmente por despesa
        SELECT 
          "despesaId",
          COALESCE(SUM(valor), 0)::float as pago_global
        FROM lancamento
        WHERE tipo = 'pagamento'
        GROUP BY "despesaId"
      ),
      agendamentos_unicas AS (
        -- Cronograma mensal de agendamentos e pagamentos de dívidas Únicas
        SELECT 
          l."despesaId",
          l.data as data_vencimento,
          l.valor as valor_agendado,
          COALESCE(lp.total_pago_mes, 0)::float as valor_pago_mes
        FROM lancamento l
        INNER JOIN despesas_ativas d ON l."despesaId" = d.id
        LEFT JOIN (
          SELECT 
            "despesaId",
            DATE_TRUNC('month', data) as mes,
            SUM(valor) as total_pago_mes
          FROM lancamento
          WHERE tipo = 'pagamento'
          GROUP BY "despesaId", DATE_TRUNC('month', data)
        ) lp ON l."despesaId" = lp."despesaId" AND DATE_TRUNC('month', l.data) = lp.mes
        WHERE l.tipo = 'agendamento'
      ),
      unicas_proximo AS (
        -- Seleciona a primeira parcela não totalmente paga de cada dívida única
        SELECT DISTINCT ON ("despesaId")
          "despesaId",
          data_vencimento as proximo_vencimento,
          (valor_agendado - valor_pago_mes)::float as valor_proxima_parcela
        FROM agendamentos_unicas
        WHERE valor_pago_mes < valor_agendado - 0.01
        ORDER BY "despesaId", data_vencimento ASC
      ),
      unicas_consolidado AS (
        SELECT 
          du.id as despesa_id,
          du.nome,
          du.tipo,
          du."userId",
          GREATEST(0, du."valorTotal" - COALESCE(pg.pago_global, 0))::float as valor_restante,
          COALESCE(up.valor_proxima_parcela, 0)::float as valor_proxima_parcela,
          up.proximo_vencimento
        FROM despesas_ativas du
        LEFT JOIN pagamentos_globais pg ON du.id = pg."despesaId"
        LEFT JOIN unicas_proximo up ON du.id = up."despesaId"
        WHERE du.tipo = 'DIVIDA' AND GREATEST(0, du."valorTotal" - COALESCE(pg.pago_global, 0)) > 0.01
      ),
      -- Dívidas voláteis (VARIAVEL ou FIXA com agendamentos)
      volateis_meses AS (
        SELECT 
          l."despesaId",
          DATE_TRUNC('month', l.data) as mes_referencia,
          MIN(l.data) as data_referencia,
          COALESCE(SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END), 0)::float as total_agendado,
          COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END), 0)::float as total_pago
        FROM lancamento l
        INNER JOIN despesas_ativas d ON l."despesaId" = d.id
        WHERE d.tipo IN ('VARIAVEL', 'FIXA')
        GROUP BY l."despesaId", DATE_TRUNC('month', l.data)
      ),
      volateis_meses_abertos AS (
        SELECT 
          "despesaId",
          mes_referencia,
          data_referencia,
          total_agendado,
          total_pago,
          GREATEST(0, total_agendado - total_pago) as valor_aberto
        FROM volateis_meses
        WHERE total_agendado > 0 AND total_pago < total_agendado - 0.01
      ),
      volateis_proximo_parcela AS (
        SELECT DISTINCT ON ("despesaId")
          "despesaId",
          data_referencia as proximo_vencimento,
          valor_aberto as valor_proxima_parcela
        FROM volateis_meses_abertos
        ORDER BY "despesaId", mes_referencia ASC
      ),
      volateis_consolidado AS (
        SELECT 
          da.id as despesa_id,
          da.nome,
          da.tipo,
          da."userId",
          COALESCE(vma.valor_restante, 0)::float as valor_restante,
          COALESCE(vpp.valor_proxima_parcela, 0)::float as valor_proxima_parcela,
          vpp.proximo_vencimento
        FROM despesas_ativas da
        JOIN (
          SELECT "despesaId", SUM(valor_aberto) as valor_restante
          FROM volateis_meses_abertos
          GROUP BY "despesaId"
        ) vma ON da.id = vma."despesaId"
        LEFT JOIN volateis_proximo_parcela vpp ON da.id = vpp."despesaId"
        WHERE da.tipo IN ('VARIAVEL', 'FIXA')
      ),
      -- Dívidas fixas sem agendamento no mês atual (FIXA puras)
      fixas_pagamentos_mes_atual AS (
        SELECT 
          l."despesaId",
          COALESCE(SUM(l.valor), 0)::float as pago_mes_atual,
          BOOL_OR(COALESCE(l."observacaoAutomatica" LIKE '%[QUITAÇÃO]%', false)) as tem_quitacao
        FROM lancamento l
        INNER JOIN despesas_ativas d ON l."despesaId" = d.id
        WHERE l.tipo = 'pagamento'
          AND l.data >= DATE_TRUNC('month', ${dataAtual}::timestamp)
          AND l.data <= (DATE_TRUNC('month', ${dataAtual}::timestamp) + INTERVAL '1 month' - INTERVAL '1 millisecond')
        GROUP BY l."despesaId"
      ),
      fixas_sem_agendamentos AS (
        SELECT 
          da.id as despesa_id,
          da.nome,
          da.tipo,
          da."userId",
          da."valorEstimado",
          da."diaVencimento",
          COALESCE(fpm.pago_mes_atual, 0)::float as pago_mes_atual,
          COALESCE(fpm.tem_quitacao, false) as tem_quitacao
        FROM despesas_ativas da
        LEFT JOIN fixas_pagamentos_mes_atual fpm ON da.id = fpm."despesaId"
        WHERE da.tipo = 'FIXA'
          AND NOT EXISTS (
            SELECT 1 FROM lancamento l
            WHERE l."despesaId" = da.id AND l.tipo = 'agendamento'
          )
      ),
      fixas_calculadas AS (
        SELECT 
          despesa_id,
          nome,
          tipo,
          "userId",
          "valorEstimado",
          "diaVencimento",
          pago_mes_atual,
          tem_quitacao,
          (tem_quitacao OR (pago_mes_atual >= "valorEstimado" - 0.01)) as concluida
        FROM fixas_sem_agendamentos
      ),
      fixas_consolidado AS (
        SELECT 
          fc.despesa_id,
          fc.nome,
          fc.tipo,
          fc."userId",
          (CASE WHEN fc.concluida THEN 0 ELSE GREATEST(0, fc."valorEstimado" - fc.pago_mes_atual) END)::float as valor_restante,
          (CASE WHEN fc.concluida THEN 0 ELSE fc."valorEstimado" END)::float as valor_proxima_parcela,
          (
            DATE_TRUNC('month', ${dataAtual}::timestamp) + 
            (LEAST(
              fc."diaVencimento", 
              EXTRACT(DAY FROM (DATE_TRUNC('month', ${dataAtual}::timestamp) + INTERVAL '1 month' - INTERVAL '1 day'))
            )::integer - 1) * INTERVAL '1 day'
          )::timestamp as proximo_vencimento
        FROM fixas_calculadas fc
        WHERE NOT fc.concluida
      )
      
      -- Unificação de todos os tipos de despesas
      SELECT 
        despesa_id as "id",
        nome,
        tipo::text as "tipo",
        "userId",
        valor_restante as "valorRestante",
        valor_proxima_parcela as "valorProximaParcela",
        proximo_vencimento as "proximoVencimento",
        EXTRACT(DAY FROM (proximo_vencimento - DATE_TRUNC('day', ${dataAtual}::timestamp)))::integer as "diasParaVencer"
      FROM unicas_consolidado
      
      UNION ALL
      
      SELECT 
        despesa_id as "id",
        nome,
        tipo::text as "tipo",
        "userId",
        valor_restante as "valorRestante",
        valor_proxima_parcela as "valorProximaParcela",
        proximo_vencimento as "proximoVencimento",
        EXTRACT(DAY FROM (proximo_vencimento - DATE_TRUNC('day', ${dataAtual}::timestamp)))::integer as "diasParaVencer"
      FROM volateis_consolidado
      
      UNION ALL
      
      SELECT 
        despesa_id as "id",
        nome,
        tipo::text as "tipo",
        "userId",
        valor_restante as "valorRestante",
        valor_proxima_parcela as "valorProximaParcela",
        proximo_vencimento as "proximoVencimento",
        EXTRACT(DAY FROM (proximo_vencimento - DATE_TRUNC('day', ${dataAtual}::timestamp)))::integer as "diasParaVencer"
      FROM fixas_consolidado;
    `;

    return rows.map(r => ({
      id: Number(r.id),
      nome: r.nome,
      tipo: r.tipo as "DIVIDA" | "VARIAVEL" | "FIXA",
      userId: Number(r.userId),
      valorRestante: Number(r.valorRestante || 0),
      valorProximaParcela: Number(r.valorProximaParcela || 0),
      proximoVencimento: r.proximoVencimento ? new Date(r.proximoVencimento) : null,
      diasParaVencer: r.diasParaVencer !== null && r.diasParaVencer !== undefined ? Number(r.diasParaVencer) : null
    }));
  },

  async buscarUsuarioPorId(userId: number) {
    return await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: { id: true, name: true, email: true, phone: true },
    });
  },

  async obterUsuariosAtivos() {
    return await prisma.user.findMany({
      where: { deletedAt: null, status: "A" },
      select: { id: true, name: true, email: true, phone: true },
    });
  },

  async obterUsuariosAtivosSimplificado() {
    return await prisma.user.findMany({
      where: { deletedAt: null, status: "A" },
      select: { id: true, name: true },
    });
  },

  async criarLogPrincipal(origem: any, previstos: number, contexto: string = "DIVIDA") {
    return await prisma.disparo.create({
      data: {
        origem,
        contexto,
        status: "PENDENTE",
        previstos,
        enviados: 0,
      },
    });
  },

  async finalizarLogPrincipal(disparoId: number, status: any, enviados: number, mensagemErro?: string | null) {
    return await prisma.disparo.update({
      where: { id: disparoId },
      data: {
        status,
        enviados,
        mensagemErro,
      },
    });
  },

  /**
   * Remove em massa os lotes de disparo (e, por FK Cascade, seus DisparoEnvio)
   * criados antes de `dataLimite`. É um único DELETE em massa — rápido e seguro
   * para o timeout do cron. Retorna a quantidade de lotes removidos.
   */
  async deletarLogsAntigos(dataLimite: Date) {
    const { count } = await prisma.disparo.deleteMany({
      where: { createdAt: { lt: dataLimite } },
    });
    return count;
  },

  async salvarLogUsuario(disparoId: number, userId: number, canal: any, status: any, mensagemErro?: string | null) {
    return await prisma.disparoEnvio.create({
      data: {
        disparoId,
        userId,
        canal,
        status,
        mensagemErro,
      },
    });
  },

  async listarLogs(userId?: number, limit = 20) {
    return await prisma.disparo.findMany({
      where: userId
        ? {
            envios: {
              some: {
                userId,
              },
            },
          }
        : {},
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        envios: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  },

  async listarLogsPaginado(limit = 10, page = 0) {
    const skip = page * limit;
    const [logs, total] = await Promise.all([
      prisma.disparo.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.disparo.count(),
    ]);
    return { logs, total };
  }
};
