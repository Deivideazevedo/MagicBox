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
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";

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

/**
 * Wrapper para adicionar logs automáticos a cada tentativa de modelo no fallback.
 * Substitui o log genérico por um rastro real de qual modelo está sendo acionado.
 */
function withLog(model: any): any {
  const prepararParams = (params: any) => {
    // Só precisamos injetar o bypass se o modelo destino for o Google/Gemini
    const isGoogle =
      model.provider?.toLowerCase().includes("google") ||
      model.modelId?.toLowerCase().includes("gemini");

    if (!isGoogle || !params.prompt) return params;

    return {
      ...params,
      prompt: params.prompt.map((msg: any) => {
        if (Array.isArray(msg.content)) {
          return {
            ...msg,
            content: msg.content.map((part: any) => {
              if (part.type === "tool-call") {
                const bypass = "skip_thought_signature_validator";
                // Injetamos em múltiplos campos para garantir que o SDK do Google capture em qualquer versão
                return {
                  ...part,
                  thoughtSignature: part.thoughtSignature || bypass,
                  providerOptions: {
                    ...part.providerOptions,
                    google: { ...part.providerOptions?.google, thoughtSignature: bypass }
                  },
                  providerMetadata: {
                    ...part.providerMetadata,
                    google: { ...part.providerMetadata?.google, thoughtSignature: bypass },
                  },
                };
              }
              return part;
            }),
          };
        }
        return msg;
      }),
    };
  };

  // Intercepta a transmissão (streaming)
  const originalDoStream = model.doStream.bind(model);
  model.doStream = async (params: any) => {
    logChat({
      tipo: "PROVEDOR",
      modelo: model.modelId,
      provider: model.provider,
      mensagem: "Acionado para transmissão (Streaming).",
    });
    return originalDoStream(prepararParams(params));
  };

  // Intercepta a geração única (text/tool call)
  const originalDoGenerate = model.doGenerate.bind(model);
  model.doGenerate = async (params: any) => {
    logChat({
      tipo: "PROVEDOR",
      modelo: model.modelId,
      provider: model.provider,
      mensagem: "Acionado para geração (Tool Call/Text).",
    });
    return originalDoGenerate(prepararParams(params));
  };

  return model;
}

const resilientModel = createFallback({
  models: [
    // TIER 1: Velocidade Extrema (Garante resposta instantânea)
    withLog(groq("llama-3.1-8b-instant")),
    withLog(google("gemini-3.1-flash-lite-preview")),

    // TIER 2: Raciocínio Pesado (Entra se os rápidos falharem)
    withLog(groq("llama-3.3-70b-versatile")),
    withLog(google("gemini-2.5-flash-lite")),
    withLog(google("gemini-2.5-flash")),

    // TIER 3: Fallback de Segurança
    withLog(github("gpt-5-mini")),
    withLog(github("gpt-4.1-mini")),
    withLog(github("gpt-4.1")),
  ],
  // Quarentena: Se um modelo falhar (ex: Rate Limit 429), ele é ignorado por 2 minuto
  modelResetInterval: 120000,
  onError: (error, modelId) => {
    // Dispara a cada tombo individual. 
    // Ex: Groq caiu? Registra e vai pro Google silenciosamente.
    logChat({
      tipo: "FALLBACK",
      modelo: modelId,
      mensagem: `O modelo ${modelId} falhou e entrou em quarentena de 2 minutos.`,
      detalhes: String(error),
      erro: error // Passa o objeto completo para depuração técnica
    });
  },
});

// ─────────────────────────────────────────────────
// Gestão de Contexto Ativa
// ─────────────────────────────────────────────────
const MAX_CONTEXT_CHARS = 8000;
const MAX_MESSAGES = 8; // 4 trocas completas usuário/IA
const MAX_INPUT_CHARS = 500;
const TOOL_ONLY_PLACEHOLDER = "[Consulta de dados realizada com sucesso]";

function aplicarJanelaDeContexto(messages: UIMessage[]): UIMessage[] {
  let charCount = 0;
  let resultado: UIMessage[] = [];

  // 1. Pega as últimas N mensagens
  const ultimasMensagens = messages.slice(-MAX_MESSAGES);

  // 2. Higieniza o histórico de trás para frente mantendo metadados
  for (let i = ultimasMensagens.length - 1; i >= 0; i--) {
    const msg = ultimasMensagens[i];

    // Higienização de partes: Preservamos tudo o que não for texto vazio
    const validParts = msg.parts.filter((p) => {
      if (p.type === "text") return p.text.trim().length > 0;
      return true; // Mantém ferramentas, raciocínio, arquivos, etc.
    });

    const contentStr = validParts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");

    // REGRA DE SEGURANÇA: Limite de caracteres
    if (charCount + contentStr.length > MAX_CONTEXT_CHARS) break;

    // Adicionamos a mensagem ao resultado (usamos spread para manter IDs e outras props)
    resultado.unshift({ ...msg, parts: validParts });
    charCount += contentStr.length;
  }

  // 3. REGRA CRÍTICA PARA GEMINI/ANTHROPIC:
  // O histórico deve SEMPRE começar com uma mensagem do usuário ('user').
  while (resultado.length > 0 && resultado[0].role !== "user") {
    resultado.shift();
  }

  logChat({
    tipo: "CONTEXTO",
    mensagem: `${messages.length} msgs recebidas → ${resultado.length} limpas e enviadas | Caracteres: ${charCount}`,
    detalhes: `Limites: ${MAX_MESSAGES} msgs / ${MAX_CONTEXT_CHARS} chars | Topo: ${resultado.length > 0 ? resultado[0].role : "vazio"}`,
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

  const dataLocal = fnFormatDateInTimeZone({ format: "date" }); // yyyy-MM-dd
  const diaSemana = fnFormatDateInTimeZone({ format: "eeee", date: new Date() }); // terça-feira (usando formato eeee do date-fns)
  const anoAtual = fnFormatDateInTimeZone({ format: "yyyy" });

  return `
Você é o Assistente Virtual Oficial do MagicBox. Sua prioridade absoluta é a precisão dos dados.

# DIRETRIZ DE OURO: CONSULTA OBRIGATÓRIA
- NUNCA invente valores, contas, datas ou saldos. 
- Para QUALQUER pergunta sobre finanças, saldo, gastos ou contas, você deve OBRIGATORIAMENTE chamar uma ferramenta ("obterResumoFinanceiro" ou "consultarLancamentos") antes de dar a primeira palavra ao usuário.
- Se a ferramenta retornar vazio, diga explicitamente: "Não encontrei registros para este período no seu MagicBox. 🧐".
- DATA ATUAL: ${dataLocal} (${diaSemana}). Use esta data como referência real para calcular "ontem", "hoje", "amanhã" ao chamar as ferramentas. Mantenha SEMPRE o ano atual (${anoAtual}) a menos que solicitado o contrário.

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
2. Valores financeiros devem estar sempre em **Negrito** no formato brasileiro: **R$ [VALOR]**.
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
    consultarResumoGeral: {
      description:
        "Diagnóstico financeiro 360º. Retorna Saldo Livre, Bruto, Bloqueado e o status de todas as Metas e Dívidas ativas. Use para perguntas amplas como 'Quanto eu tenho?', 'Como está minha saúde financeira?', 'Me fale dos meus sonhos/metas' ou panoramas temporais. Forneça datas para incluir projeções futuras no PERÍODO solicitado.",
      inputSchema: z.object({
        dataInicio: z
          .string()
          .optional()
          .describe("Opcional: Data de início (YYYY-MM-DD). Use para ver projeções de um período específico."),
        dataFim: z
          .string()
          .optional()
          .describe("Opcional: Data de fim (YYYY-MM-DD)."),
      }),
      execute: async ({ dataInicio, dataFim }: { dataInicio?: string; dataFim?: string }) => {
        logChat({
          tipo: "TOOL_CALL",
          userId,
          ferramenta: "consultarResumoGeral",
          mensagem: dataInicio ? `Período: ${dataInicio} → ${dataFim}` : "Visão Atemporal",
        });

        const diagnostico = await resumoServico.obterDiagnosticoCompleto(userId, dataInicio && dataFim ? {
          userId,
          dataInicio,
          dataFim
        } : undefined);

        logChat({
          tipo: "TOOL_RESULT",
          ferramenta: "consultarResumoGeral",
          mensagem: `Contexto: ${diagnostico.contexto} | Saldo Livre: R$${diagnostico.saldos.saldoLivre}`,
        });

        return diagnostico;
      },
    },

    consultarLancamentos: {
      description:
        "Extrato detalhado de lançamentos. Use para granularidade diária, semanal, mensal (Ex: 'O que gastei ontem?', 'vencimentos de hoje', 'gastos da semana', 'quanto gastei esse mês'). Retorna status de pagamento, categorias e nomes dos itens. Para períodos longos (>3 meses), retorna um sumário agrupado.",
      inputSchema: z.object({
        dataInicio: z
          .string()
          .optional()
          .describe("Data de início (YYYY-MM-DD). Padrão: primeiro dia do mês atual."),
        dataFim: z
          .string()
          .optional()
          .describe("Data de fim (YYYY-MM-DD). Padrão: último dia do mês atual."),
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

        const filtrados = itens.filter((item) => tipo === "todos" || item.origem === tipo);

        // Lógica de Agrupamento para evitar estouro de contexto em períodos longos
        const diffMs = new Date(dFim).getTime() - new Date(dInicio).getTime();
        const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);

        if (diffMonths > 3) {
          interface ItemAgrupado {
            nome: string;
            tipo: string;
            totalPrevisto: number;
            totalPago: number;
            ocorrencias: number;
          }

          const agrupado = filtrados.reduce((acc: Record<string, ItemAgrupado>, item) => {
            const chave = `${item.origem}-${item.nome}`;
            if (!acc[chave]) {
              acc[chave] = {
                nome: item.nome,
                tipo: item.origem,
                totalPrevisto: 0,
                totalPago: 0,
                ocorrencias: 0
              };
            }
            acc[chave].totalPrevisto += item.valorPrevisto;
            acc[chave].totalPago += item.valorPago;
            acc[chave].ocorrencias += 1;
            return acc;
          }, {});

          return {
            totalEncontrados: filtrados.length,
            periodoReferencia: `${dInicio} a ${dFim}`,
            formato: "SUMARIO_AGRUPADO",
            aviso: "Período longo detectado. Os dados foram agrupados por item/fonte para facilitar a análise.",
            sumario: Object.values(agrupado),
          };
        }

        const listagem = filtrados.map((item) => ({
          nome: item.nome,
          tipo: item.origem,
          valorPrevisto: item.valorPrevisto,
          valorPago: item.valorPago,
          status: item.status,
          atrasado: item.atrasado,
          isProjetado: item.isProjetado,
          diaVencimento: item.diaVencido,
          mes: item.mes,
          ano: item.ano
        }));

        logChat({
          tipo: "TOOL_RESULT",
          ferramenta: "consultarLancamentos",
          mensagem: `Encontrados ${listagem.length} lançamentos para o período ${dInicio} a ${dFim}`,
        });

        return {
          totalEncontrados: listagem.length,
          lancamentos: listagem,
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
        detalhes: `Etapas lógicas realizadas: ${steps.length}`,
      });
    },
  });

  return result.toUIMessageStreamResponse();
}

export const chatService = {
  executarChat,
};
