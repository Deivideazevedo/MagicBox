import { prisma } from "@/lib/prisma";
import { AiUsageLog } from "@prisma/client";

interface MetricasCotaRaw {
  totalGlobal2Min: number;
  totalUser1Hour: number;
  lastSuccessDate: Date | null;
}

/**
 * Executa uma única query unificada via Raw SQL e CTE (Common Table Expressions)
 * para extrair as 3 métricas de cota e cooldown necessárias no chat de uma única vez.
 */
async function obterDadosMétricasCota(userId: number): Promise<{
  totalGlobal2Min: number;
  totalUser1Hour: number;
  lastSuccessDate: Date | null;
}> {
  const result = await prisma.$queryRaw<MetricasCotaRaw[]>`
    WITH 
    global_2min AS (
      SELECT COUNT(1)::int AS total_global_2min
      FROM "AiUsageLog"
      WHERE status != 'FAILED'
        AND "createdAt" >= NOW() - INTERVAL '2 minutes'
    ),
    user_1hour AS (
      SELECT COUNT(1)::int AS total_user_1hour
      FROM "AiUsageLog"
      WHERE "userId" = ${userId}
        AND status != 'FAILED'
        AND "createdAt" >= NOW() - INTERVAL '1 hour'
    ),
    last_success AS (
      SELECT "createdAt" AS last_success_date
      FROM "AiUsageLog"
      WHERE "userId" = ${userId}
        AND status != 'FAILED'
      ORDER BY "createdAt" DESC
      LIMIT 1
    )
    SELECT 
      COALESCE((SELECT total_global_2min FROM global_2min), 0) AS "totalGlobal2Min",
      COALESCE((SELECT total_user_1hour FROM user_1hour), 0) AS "totalUser1Hour",
      (SELECT last_success_date FROM last_success) AS "lastSuccessDate";
  `;

  if (!result || result.length === 0) {
    return {
      totalGlobal2Min: 0,
      totalUser1Hour: 0,
      lastSuccessDate: null,
    };
  }

  // Garantindo que a data seja convertida corretamente para o timezone do JS
  const dados = result[0];
  return {
    totalGlobal2Min: Number(dados.totalGlobal2Min),
    totalUser1Hour: Number(dados.totalUser1Hour),
    lastSuccessDate: dados.lastSuccessDate ? new Date(dados.lastSuccessDate) : null,
  };
}

/**
 * Registra a tentativa inicial de uso do chat
 */
async function criarLogUso(userId: number): Promise<AiUsageLog> {
  return await prisma.aiUsageLog.create({
    data: {
      userId,
      status: "SUCCESS",
      latencia: 0,
    },
  });
}

/**
 * Atualiza um log de uso existente com status, latência, erros ou o modelo utilizado
 */
async function atualizarLogUso(
  id: number,
  data: { status?: string; latencia?: number; erro?: string; modelo?: string }
): Promise<AiUsageLog> {
  return await prisma.aiUsageLog.update({
    where: { id },
    data,
  });
}

export const chatUsageRepository = {
  obterDadosMétricasCota,
  criarLogUso,
  atualizarLogUso,
};
