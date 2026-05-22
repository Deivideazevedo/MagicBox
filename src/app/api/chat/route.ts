import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { chatService } from "@/core/chat/service";
import { chatUsageRepository as repository } from "@/core/chat/repository";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export const POST = errorHandler(enviarMensagem);

async function enviarMensagem(requisicao: NextRequest): Promise<NextResponse> {
  const { id: authId } = await getAuthUser();
  const { messages } = await requisicao.json();
  const userId = Number(authId);

  // Validar cota de uso e cooldown do usuário (regra de negócio isolada no Service)
  await chatService.validarLimiteDeUso(userId);

  // Registrar o início do uso do chat
  const log = await repository.criarLogUso(userId);
  const tInicio = performance.now();

  try {
    const result = await chatService.executarChat({
      messages,
      userId,
      logId: log.id,
    });

    // No sucesso, o streamText (onFinish) atualizará a latência e o modelo em background de forma assíncrona!
    return result as unknown as NextResponse;
  } catch (err: any) {
    const latencia = Math.round(performance.now() - tInicio);

    // Em caso de erro na execução, atualizar o log local com status FAILED
    await repository.atualizarLogUso(log.id, {
      status: "FAILED",
      latencia,
      erro: err instanceof Error ? err.message : String(err),
    });

    throw err; // Relança para o errorHandler responder ao cliente
  }
}
