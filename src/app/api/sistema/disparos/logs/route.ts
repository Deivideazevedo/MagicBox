// src/app/api/sistema/disparos/logs/route.ts
// 🎯 IMPORTANTE: Importar zod-config ANTES de qualquer uso do Zod
import "@/lib/zod-config";

import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { ForbiddenError } from "@/lib/errors";
import { disparosLogsService } from "@/core/disparos/logs/service";
import { getNotificacaoLogsSchema } from "@/core/disparos/logs/dto";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(obterLogsOuDetalhes);

async function obterLogsOuDetalhes(requisicao: NextRequest): Promise<NextResponse> {
  const authUser = await getAuthUser(requisicao);

  if (authUser.role !== "admin") {
    throw new ForbiddenError("Acesso negado: Apenas administradores podem acessar dados de logs.");
  }

  // Obter parâmetros da URL
  const { searchParams } = new URL(requisicao.url);
  const params = Object.fromEntries(searchParams.entries());

  // Validar e fazer o parse via Zod
  const query = getNotificacaoLogsSchema.parse(params);

  // Se logId for informado, retorna os destinatários daquele lote
  if (query.logId) {
    const detalhes = await disparosLogsService.obterDestinatariosLote(query.logId);
    return NextResponse.json(detalhes);
  }

  // Senão, retorna a lista paginada de logs
  const { logs, total } = await disparosLogsService.listarLogsPaginado(query.limit, query.page);
  return NextResponse.json({
    data: logs,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      lastPage: Math.ceil(total / query.limit),
    },
  });
}
