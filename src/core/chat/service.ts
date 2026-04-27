import { streamText, convertToModelMessages, UIMessage, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createFallback } from "ai-fallback";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { resumoServico } from "@/core/lancamentos/resumo/service";
import { logChat, resetLogStep } from "@/core/chat/utils";

// ─────────────────────────────────────────────────
// Provedores
// ─────────────────────────────────────────────────
const github = createOpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN_API_KEY,
});

// Tier List de Modelos Gratuitos (Foco em UX: Latência baixa, RPM alto, Reset Rápido)
//
// 🥇 TIER 1: Ultra Rápidos (15 a 30 RPM reais, recarga em minutos/segundos)
//    - Groq 8B Instant (Baixíssima latência, ideal para contexto de chat)
//    - Gemini 3.1 Flash Lite Preview (30~50 RPM free)
//
// 🥈 TIER 2: Balanceados e Qualidade
//    - Gemini 2.5 Flash Lite e 2.5 Flash
//    - Groq 70B Versatile (Melhor qualidade OS, mas limite de tokens/dia esgota rápido)
//
// 🛡️ TIER 3: Github/Copilot (Reserva de Emergência, entra em ação caso Google/Groq esgotem)

const resilientModel = createFallback({
  models: [
    // TIER 1: Ultra Rápidos (Foco em Baixa Latência)
    groq("llama-3.3-70b-versatile"),
    google("gemini-3.1-flash-lite-preview"),
    groq("llama-3.1-8b-instant"),

    // TIER 2: Balanceados (Maior raciocínio, limites um pouco menores)
    google("gemini-2.5-flash-lite"),
    google("gemini-2.5-flash"),

    // TIER 3: GitHub Models (Fallback de Segurança)
    github("gpt-5-mini"),
    github("gpt-4.1-mini"),
    github("gpt-4.1"),
  ],
  // Quarentena: Se um modelo falhar (ex: Rate Limit 429), ele é ignorado por 1 minuto
  modelResetInterval: 60000,
  onError: (error, modelId) => {
    // Dispara a cada tombo individual. 
    // Ex: Groq caiu? Registra e vai pro Google silenciosamente.
    logChat({
      tipo: "FALLBACK",
      modelo: modelId,
      mensagem: `O modelo ${modelId} falhou e entrou em quarentena de 1 minuto.`,
      detalhes: String(error)
    });
  },
});

// ─────────────────────────────────────────────────
// Gestão de Contexto Ativa
// ─────────────────────────────────────────────────
const MAX_CONTEXT_CHARS = 8000;
const MAX_MESSAGES = 10; // 5 trocas completas usuário/IA
const MAX_INPUT_CHARS = 500;

function aplicarJanelaDeContexto(messages: UIMessage[]): UIMessage[] {
  let charCount = 0;
  let resultado: UIMessage[] = [];

  // 1. Pega as últimas N mensagens
  const ultimasMensagens = messages.slice(-MAX_MESSAGES);

  // 2. Filtra por tamanho de caracteres de trás para frente
  for (let i = ultimasMensagens.length - 1; i >= 0; i--) {
    const msg = ultimasMensagens[i];
    const contentStr = msg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");

    if (charCount + contentStr.length > MAX_CONTEXT_CHARS) break;

    resultado.unshift(msg);
    charCount += contentStr.length;
  }

  // 3. REGRA CRÍTICA PARA GEMINI/ANTHROPIC: 
  // O histórico deve SEMPRE começar com uma mensagem do usuário ('user').
  // Se cortarmos no meio e sobrar um 'assistant' ou 'tool' no topo, o provedor rejeita.
  while (resultado.length > 0 && (resultado[0] as any).role !== "user") {
    resultado.shift();
  }

  logChat({
    tipo: "CONTEXTO",
    mensagem: `${messages.length} mensagens recebidas → ${resultado.length} enviadas à IA | Caracters: ${charCount}`,
    detalhes: `Limites: ${MAX_MESSAGES} msgs / ${MAX_CONTEXT_CHARS} chars | Final: ${resultado.length > 0 ? resultado[0].role : 'vazio'} no topo`,
  });

  return resultado;
}

// ─────────────────────────────────────────────────
// System Prompt Builder
// ─────────────────────────────────────────────────
function construirSystemPrompt(): string {
  const chatSkillPath = path.join(process.cwd(), "docs", "skills", "agente-chat.md");
  let relatorioSkills = "";

  try {
    if (fs.existsSync(chatSkillPath)) {
      relatorioSkills = fs.readFileSync(chatSkillPath, "utf8");
    } else {
      relatorioSkills = "Documentação do agente não encontrada.";
    }
  } catch (err) {
    console.error("Erro ao ler agente-chat.md:", err);
  }

  return `
Você é o Assistente Virtual Oficial do MagicBox. Sua prioridade absoluta é a precisão dos dados.

# DIRETRIZ DE OURO: CONSULTA OBRIGATÓRIA
- NUNCA invente valores, contas, datas ou saldos. 
- Para QUALQUER pergunta sobre finanças, saldo, gastos ou contas, você deve OBRIGATORIAMENTE chamar uma ferramenta ("obterResumoFinanceiro" ou "consultarLancamentos") antes de dar a primeira palavra ao usuário.
- Se a ferramenta retornar vazio, diga explicitamente: "Não encontrei registros para este período no seu MagicBox. 🧐".
- DATA ATUAL: ${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Bahia" })} (Use esta data como referência real para calcular "ontem", "hoje", "amanhã" ao chamar as ferramentas).

# ENTENDIMENTO DE DADOS
- **Pagamento Parcial**: Ocorre quando o 'valorPago' é maior que zero mas menor que o 'valorPrevisto'. Explique isso ao usuário como "Pago parcialmente".
- **Lançamento Projetado (Virtual)**: Identificado por 'isProjetado: true'. São projeções automáticas de despesas fixas (ex: Luz, Aluguel) que ainda não possuem um agendamento manual ou pagamento real. Trate-os como "Previsões".
- **Granularidade**: Se o usuário perguntar por um dia específico, passe a mesma data para 'dataInicio' e 'dataFim'.

# COMPORTAMENTO E TOM
- Responda de forma amigável, lúdica e PREMIUM.
- Use emojis em todas as listas e para enfatizar ações.
- Mantenha sigilo total sobre a arquitetura técnica (APIs, tabelas, código). Fale apenas da interface do usuário.

# REGRAS DE FORMATAÇÃO (ESTRITA)
1. Pule DUAS LINHAS entre cada parágrafo ou item de lista para garantir o "respiro" visual.
2. Valores financeiros devem estar sempre em **Negrito** no formato brasileiro: **R$ 1.250,50**.
3. Use links markdown para navegação: [Texto](/rota).
4. Listas: Cada item deve começar com um emoji temático e ter espaçamento duplo entre eles.

# FLUXO DE RESPOSTA
- Passo 1: Analisar se a pergunta exige dados reais.
- Passo 2: Se sim, chamar a ferramenta adequada.
- Passo 3: Formatar a resposta usando APENAS os dados retornados.
- Passo 4: Sugerir um link útil de navegação.

# DOCUMENTAÇÃO DE APOIO:
${relatorioSkills}
  `;
}

// ─────────────────────────────────────────────────
// Tool Definitions (invocam services internos)
// ─────────────────────────────────────────────────
function criarFerramentas(userId: number) {
  const agora = new Date();

  return {
    obterResumoFinanceiro: {
      description:
        "Retorna o resumo financeiro (saldo disponível, livre, total de gastos e receitas) para um período específico. Use para responder sobre a situação financeira geral ou saldo em datas específicas (hoje, ontem, este mês).",
      inputSchema: z.object({
        dataInicio: z
          .string()
          .optional()
          .describe("Data de início no formato YYYY-MM-DD. Padrão: primeiro dia do mês atual."),
        dataFim: z
          .string()
          .optional()
          .describe("Data de fim no formato YYYY-MM-DD. Padrão: último dia do mês atual."),
      }),
      execute: async ({ dataInicio, dataFim }: { dataInicio?: string; dataFim?: string }) => {
        const dInicio = dataInicio || new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().split("T")[0];
        const dFim = dataFim || new Date(agora.getFullYear(), agora.getMonth() + 1, 0).toISOString().split("T")[0];

        logChat({
          tipo: "TOOL_CALL",
          userId,
          ferramenta: "obterResumoFinanceiro",
          mensagem: `Período: ${dInicio} → ${dFim}`,
        });

        const card = await resumoServico.obterCardResumo({
          userId,
          dataInicio: dInicio,
          dataFim: dFim,
        });

        logChat({
          tipo: "TOOL_RESULT",
          ferramenta: "obterResumoFinanceiro",
          mensagem: `Saldo Atual: R$${card.saldoAtual} | Livre: R$${card.saldoLivre}`,
          detalhes: `Período: ${dInicio} a ${dFim}`,
        });

        return {
          ...card,
          periodoReferencia: `${dInicio} a ${dFim}`,
        };
      },
    },

    consultarLancamentos: {
      description:
        "Consulta o detalhamento de lançamentos (receitas e despesas) em um período. Retorna status de pagamento (Pago, Parcial, Pendente), valores e se o lançamento é uma projeção virtual. Use para perguntas como 'o que eu gastei ontem?', 'quais contas estão pendentes?' ou 'tenho algo projetado?'.",
      inputSchema: z.object({
        dataInicio: z
          .string()
          .optional()
          .describe("Data de início no formato YYYY-MM-DD. Padrão: primeiro dia do mês atual."),
        dataFim: z
          .string()
          .optional()
          .describe("Data de fim no formato YYYY-MM-DD. Padrão: último dia do mês atual."),
        tipo: z
          .enum(["receita", "despesa", "todos"])
          .optional()
          .default("todos")
          .describe("Filtra por tipo de lançamento."),
      }),
      execute: async ({ dataInicio, dataFim, tipo }: { dataInicio?: string; dataFim?: string; tipo?: "receita" | "despesa" | "todos" }) => {
        const dInicio = dataInicio || new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().split("T")[0];
        const dFim = dataFim || new Date(agora.getFullYear(), agora.getMonth() + 1, 0).toISOString().split("T")[0];

        logChat({
          tipo: "TOOL_CALL",
          userId,
          ferramenta: "consultarLancamentos",
          mensagem: `Período: ${dInicio} → ${dFim} | Tipo: ${tipo}`,
        });

        const itens = await resumoServico.obterResumo({
          userId,
          dataInicio: dInicio,
          dataFim: dFim,
        });

        const filtrados = itens
          .filter((item) => tipo === "todos" || item.origem === tipo)
          .map((item) => ({
            nome: item.nome,
            tipo: item.origem,
            valorPrevisto: item.valorPrevisto,
            valorPago: item.valorPago,
            status: item.status,
            atrasado: item.atrasado,
            isProjetado: item.isProjetado,
            diaVencimento: item.diaVencido,
          }));

        logChat({
          tipo: "TOOL_RESULT",
          ferramenta: "consultarLancamentos",
          mensagem: `Encontrados ${filtrados.length} lançamentos para o período ${dInicio} a ${dFim}`,
        });

        return {
          totalEncontrados: filtrados.length,
          lancamentos: filtrados,
          periodoReferencia: `${dInicio} a ${dFim}`,
        };
      },
    },
  };
}

// ─────────────────────────────────────────────────
// Execução do Chat (Motor Resiliente)
// ─────────────────────────────────────────────────
interface ExecutarChatParams {
  messages: UIMessage[];
  userId: number;
}

async function executarChat({ messages, userId }: ExecutarChatParams) {
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
        `A sua última mensagem está muito longa (máximo ${MAX_INPUT_CHARS} caracteres). Por favor, resuma sua pergunta.`
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

  logChat({
    tipo: "PROVEDOR",
    userId,
    mensagem: "Conectando ao motor resiliente (fallback + quarentena ativos)...",
  });

  const result = streamText({
    model: resilientModel,
    system: systemPrompt,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(5),
    onFinish: ({ text, steps, model }) => {
      logChat({
        tipo: "RESPOSTA",
        modelo: model.modelId,
        provider: model.provider,
        mensagem: text,
        detalhes: `Etapas executadas: ${steps.length}`,
      });
    },
  });

  return result.toUIMessageStreamResponse();
}

export const chatService = {
  executarChat,
};
