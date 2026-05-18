import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { chatService } from "@/core/chat/service";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { TooManyRequestsError } from "@/lib/errors";

export const maxDuration = 60;

export const POST = errorHandler(enviarMensagem);

async function enviarMensagem(requisicao: NextRequest): Promise<NextResponse> {
  const { id: authId } = await getAuthUser();
  const { messages } = await requisicao.json();

  const userId = Number(authId);
  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);

  // 1. Contar as requisições de IA do usuário na última 1 hora
  const totalRequests = await prisma.aiUsageLog.count({
    where: {
      userId,
      createdAt: { gte: umaHoraAtras },
    },
  });

  // Limite configurado: 20 requisições por hora
  const LIMITE_IA_POR_HORA = 20;

  if (totalRequests >= LIMITE_IA_POR_HORA) {
    throw new TooManyRequestsError(
      "Limite de uso da Inteligência Artificial atingido por esta hora. Por favor, aguarde e tente novamente mais tarde."
    );
  }

  // 2. Registrar o uso da IA de forma segura
  await prisma.aiUsageLog.create({
    data: { userId },
  });

  const result = await chatService.executarChat({
    messages,
    userId,
  });

  return result as unknown as NextResponse;
}
