import { streamText, convertToModelMessages, UIMessage, stepCountIs } from "ai";
import { logChat, resetLogStep } from "./log-utils";
import { chatUsageRepository } from "./repository";
import { TooManyRequestsError } from "@/lib/errors";
import { construirSystemPrompt } from "./orientacoes/instructions";
import { resilientModel } from "./engine";
import { aplicarJanelaDeContexto, MAX_INPUT_CHARS } from "./utils";
import { criarFerramentas } from "./tools";

// ─────────────────────────────────────────────────
// Execução do Chat (Motor Resiliente)
// ─────────────────────────────────────────────────
interface ExecutarChatParams {
  messages: UIMessage[];
  userId: number;
  logId?: number; // Referência opcional do log local criado na rota
}

async function executarChat({ messages, userId, logId }: ExecutarChatParams) {
  const tInicio = performance.now();

  // Reseta contador de etapas para cada nova requisição
  resetLogStep();

  // Log da mensagem do usuário (última mensagem)
  const ultimaMsg = messages[messages.length - 1];
  if (ultimaMsg) {
    const textoUser = ultimaMsg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");

    if (textoUser.length > MAX_INPUT_CHARS) {
      logChat({
        tipo: "ERRO",
        userId,
        mensagem: `Input excedeu limite de ${MAX_INPUT_CHARS} caracteres (${textoUser.length} chars)`,
      });
      throw new Error(
        `A sua última mensagem está muito longa (máximo ${MAX_INPUT_CHARS} caracteres). Por favor, resuma sua pergunta.`,
      );
    }

    logChat({
      tipo: "REQ_INICIO",
      userId,
      mensagem: textoUser,
      detalhes: `Total no histórico: ${messages.length} mensagens`,
    });
  }

  const recentMessages = aplicarJanelaDeContexto(messages);
  const systemPrompt = construirSystemPrompt();
  const tools = criarFerramentas(userId);
  const modelMessages = await convertToModelMessages(recentMessages);

  const result = streamText({
    model: resilientModel,
    system: systemPrompt,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(5),
    onFinish: async ({ text, steps, model }) => {
      logChat({
        tipo: "RESPOSTA",
        modelo: model.modelId,
        provider: model.provider,
        mensagem: text,
        detalhes: `Etapas lógicas realizadas: ${steps.length}`,
      });

      // Atualiza o log local no Prisma com o modelo exato e latência final de sucesso em background
      if (logId) {
        try {
          const latencia = Math.round(performance.now() - tInicio);
          await chatUsageRepository.atualizarLogUso(logId, {
            modelo: model.modelId,
            latencia,
          });
        } catch (updateErr) {
          console.error("Erro ao atualizar modelo e latência no log:", updateErr);
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}

/**
 * Valida a cota de uso e o cooldown do chat para o usuário.
 * Realiza uma única chamada de banco de dados via CTE SQL obtendo todas as métricas necessárias.
 */
async function validarLimiteDeUso(userId: number): Promise<void> {
  const agora = Date.now();

  // 1. Obtém todos os dados consolidados do banco em uma única query ultra otimizada com CTE
  const { totalGlobal2Min, totalUser1Hour, lastSuccessDate } = 
    await chatUsageRepository.obterDadosMétricasCota(userId);

  // ─────────────────────────────────────────────────
  // CAMADA 1: Prevenção contra Sobrecarga Global (Máximo 20 requisições globais em 2 minutos)
  // ─────────────────────────────────────────────────
  const LIMITE_GLOBAL_2MIN = 20;

  if (totalGlobal2Min >= LIMITE_GLOBAL_2MIN) {
    throw new TooManyRequestsError(
      `O sistema de IA está sob alta demanda global no momento. Por segurança das cotas de API, o chat foi suspenso temporariamente. Por favor, aguarde 2 minutos para tentar novamente.`
    );
  }

  // ─────────────────────────────────────────────────
  // CAMADA 2: Controle de Cota Horária Sustentada (Uso normal por hora)
  // ─────────────────────────────────────────────────
  const LIMITE_IA_POR_HORA = 20;
  const COOLDOWN_BLOQUEIO_MS = 30 * 60 * 1000; // 30 minutos de cooldown para cota horária

  if (totalUser1Hour >= LIMITE_IA_POR_HORA && lastSuccessDate) {
    const msPassados = agora - new Date(lastSuccessDate).getTime();

    if (msPassados < COOLDOWN_BLOQUEIO_MS) {
      const minutosRestantes = Math.ceil((COOLDOWN_BLOQUEIO_MS - msPassados) / (60 * 1000));
      throw new TooManyRequestsError(
        `Limite de uso atingido (20 mensagens na última hora). Por segurança, o chat foi bloqueado temporariamente. Por favor, aguarde mais ${minutosRestantes} minuto(s) para voltar a usar.`
      );
    }
  }
}

export const chatService = {
  executarChat,
  validarLimiteDeUso,
};
