import { streamText, convertToModelMessages, UIMessage, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
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
const MODELS = [
  // TIER 1: Ultra Rápidos (Foco em Baixa Latência)
  { name: "Groq (llama-3.1-8b-instant)", provider: "Groq", model: groq("llama-3.1-8b-instant") },
  { name: "Gemini (3.1-flash-lite-preview)", provider: "Gemini", model: google("gemini-3.1-flash-lite-preview") },

  // TIER 2: Balanceados (Maior raciocínio, limites um pouco menores)
  { name: "Gemini (2.5-flash-lite)", provider: "Gemini", model: google("gemini-2.5-flash-lite") },
  { name: "Gemini (2.5-flash)", provider: "Gemini", model: google("gemini-2.5-flash") },
  { name: "Groq (llama-3.3-70b-versatile)", provider: "Groq", model: groq("llama-3.3-70b-versatile") },

  // TIER 3: GitHub Models (Fallback de Segurança)
  { name: "GitHub (gpt-5-mini)", provider: "GitHub", model: github("gpt-5-mini") },
  { name: "GitHub (gpt-4.1-mini)", provider: "GitHub", model: github("gpt-4.1-mini") },
  { name: "GitHub (gpt-4.1)", provider: "GitHub", model: github("gpt-4.1") },
] as const;

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
Você é o Assistente Virtual Oficial do aplicativo MagicBox.
Sua missão EXCLUSIVA é ajudar o usuário final da aplicação a entender como o sistema funciona e orientá-lo sobre a gestão das suas finanças.

# Restrições de Segurança (CRÍTICO):
1. PRIVACIDADE DE SISTEMA: Sob nenhuma hipótese compartilhe código fonte, chaves de API, arquivos .env, scripts de banco de dados ou fale sobre a arquitetura interna do sistema.
2. Você NÃO é um assistente de desenvolvedores. Se perguntarem sobre código backend, credenciais ou variáveis de ambiente, responda gentilmente que você é focado na experiência do usuário.
3. JAMAIS mencione nomes de ferramentas internas, funções, endpoints ou termos técnicos como "obterResumoFinanceiro", "obterContasProximasVencimento", "tool", "API", "endpoint" ou semelhantes. Fale sempre em linguagem natural com o usuário final

# Uso de Ferramentas Internas (INVISÍVEL ao usuário):
- Quando precisar consultar dados financeiros (saldo, gastos, receitas, projeções), use as ferramentas disponíveis como "obterResumoFinanceiro", "obterContasProximasVencimento" mas não mencione que está usando as ferramentas, apenas apresente os dados de forma natural.
- NUNCA diga "vou chamar a ferramenta X", "consultando a função Y" ou "usando a API Z". Simplesmente consulte e apresente os dados de forma natural.
- Exemplo ERRADO: "Vou chamar a ferramenta obterResumoFinanceiro para você! 🤖"
- Exemplo CORRETO: "Deixa eu verificar suas finanças! 📊" (e então use a ferramenta internamente)

# Formato de Resposta e Estética UX (CRÍTICO):
- Tom de Voz: Amigável, lúdico, prestativo e PREMIUM. Você é a cara do MagicBox.
- Seja CONCISO e DIRETO.
- REGRA ABSOLUTA DE ESPAÇAMENTO: Você DEVE pular DUAS linhas (dois parágrafos) entre CADA tópico ou item de lista. 
- Espaçamento Visual: O texto não pode parecer um bloco compacto. Cada frase importante merece seu próprio parágrafo com espaço de respiro.
- Emojis: Use emojis em TODA resposta para listar dados e enfatizar ações, tornando a leitura leve e divertida. 
- Listas: Nunca use listas coladas. Cada item deve ter um emoji temático no início.
- Valores: R$ X.XXX,XX sempre em Negrito (**R$ 1.200,00**).
- Navegação: Forneça links markdown: [Acessar Dívidas](/cadastros/dividas)

Exemplo de ESTRUTURA de resposta PREMIUM (Atenção: JAMAIS use estes valores fictícios, são apenas para visualização de layout):
"""
Olá! [Sua saudação amigável aqui]! 🧐

• [Emoji] **[Nome Real da Conta]:** **[Valor Real da Conta]** (Status: [Status Real])

[Pule duas linhas entre itens]

[Sua conclusão ou link útil aqui] 😊
"""

# Diretrizes de Ouro:
1. Você DEVE obrigatoriamente chamar uma ferramenta se o usuário perguntar qualquer dado sobre o financeiro dele.
2. Se a ferramenta não retornar dados para o período, responda: "Não encontrei nenhum registro de [tipo de dado] para este período no seu MagicBox. 🧐"
3. JAMAIS invente nomes de contas, valores, parcelas ou datas. A alucinação de dados financeiros é um erro gravíssimo.
4. Caso a resposta não exista no documento, busque nas ferramentas disponíveis e se não encontrar, informe ao usuário que não tem essa informação.

# Documentação:
---
${relatorioSkills}
---
  `;
}

// ─────────────────────────────────────────────────
// Tool Definitions (invocam services internos)
// ─────────────────────────────────────────────────
function criarFerramentas(userId: number) {
  const agora = new Date();
  const dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const dataFim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  return {
    obterResumoFinanceiro: {
      description:
        "Retorna o resumo financeiro do mês atual do usuário: saldo disponível, saldo livre, gastos, receitas, saldo bloqueado em metas e projeções.",
      inputSchema: z.object({
        motivo: z.string().describe("Motivo da consulta").default("resumo"),
      }),
      execute: async () => {
        logChat({
          tipo: "TOOL_CALL",
          userId,
          ferramenta: "obterResumoFinanceiro",
          mensagem: `Período: ${dataInicio} → ${dataFim}`,
        });

        const card = await resumoServico.obterCardResumo({
          userId,
          dataInicio,
          dataFim,
        });

        logChat({
          tipo: "TOOL_RESULT",
          ferramenta: "obterResumoFinanceiro",
          mensagem: `Saldo: R$${card.saldoAtual} | Livre: R$${card.saldoLivre} | Bloqueado: R$${card.saldoBloqueado}`,
          detalhes: `Entradas: R$${card.totalEntradas} | Saídas: R$${card.totalSaidas} | Projeção: R$${card.saldoProjetado}`,
        });

        return {
          saldoAtual: card.saldoAtual,
          saldoLivre: card.saldoLivre,
          saldoBloqueado: card.saldoBloqueado,
          saldoProjetado: card.saldoProjetado,
          totalEntradas: card.totalEntradas,
          entradasRecebidas: card.entradasPagas,
          entradasPendentes: card.diferencaEntradas,
          totalSaidas: card.totalSaidas,
          saidasPagas: card.saidasPagas,
          saidasPendentes: card.diferencaSaidas,
          mesReferencia: `${agora.getMonth() + 1}/${agora.getFullYear()}`,
        };
      },
    },

    obterContasProximasVencimento: {
      description:
        "Retorna as contas (despesas e receitas) do mês atual com seus status: vencidas, vencendo hoje, próximas do vencimento ou pendentes.",
      inputSchema: z.object({
        motivo: z.string().describe("Motivo da consulta").default("vencimentos"),
      }),
      execute: async () => {
        logChat({
          tipo: "TOOL_CALL",
          userId,
          ferramenta: "obterContasProximasVencimento",
          mensagem: `Período: ${dataInicio} → ${dataFim}`,
        });

        const itens = await resumoServico.obterResumo({
          userId,
          dataInicio,
          dataFim,
        });

        const pendentes = itens
          .filter((item) => item.status !== "Pago" && item.origem === "despesa")
          .map((item) => ({
            nome: item.nome,
            valorPrevisto: item.valorPrevisto,
            valorPago: item.valorPago,
            status: item.status,
            atrasado: item.atrasado,
            diaVencimento: item.diaVencido,
          }));

        logChat({
          tipo: "TOOL_RESULT",
          ferramenta: "obterContasProximasVencimento",
          mensagem: `${pendentes.length} contas pendentes encontradas`,
          detalhes: pendentes.slice(0, 5).map((p) => `${p.nome}: R$${p.valorPrevisto} (${p.status})`).join(" | "),
        });

        return {
          totalPendentes: pendentes.length,
          contas: pendentes,
          mesReferencia: `${agora.getMonth() + 1}/${agora.getFullYear()}`,
        };
      },
    },
  };
}

// ─────────────────────────────────────────────────
// Fallback com Blacklist de Provedores
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
      throw new Error(`A sua última mensagem está muito longa (máximo ${MAX_INPUT_CHARS} caracteres). Por favor, resuma sua pergunta.`);
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

  const blacklistedProviders = new Set<string>();

  for (const m of MODELS) {
    if (blacklistedProviders.has(m.provider)) continue;

    try {
      logChat({
        tipo: "PROVEDOR",
        modelo: m.name,
        provider: m.provider,
        userId,
        mensagem: "Conectando...",
      });

      const result = streamText({
        model: m.model,
        system: systemPrompt,
        messages: modelMessages,
        tools,
        stopWhen: stepCountIs(5), // Nesta versão (6.0), stopWhen controla o limite de execuções (substitui maxSteps)
        onFinish: ({ text, steps }) => {
          logChat({
            tipo: "RESPOSTA",
            modelo: m.name,
            provider: m.provider,
            mensagem: text,
            detalhes: `Etapas executadas: ${steps.length}`,
          });
        },
      });

      logChat({
        tipo: "PROVEDOR",
        modelo: m.name,
        provider: m.provider,
        mensagem: "✅ Stream iniciado",
      });

      return result;
    } catch (e: unknown) {
      const erro = e as { statusCode?: number; message?: string };

      const isAuthError =
        erro?.statusCode === 401 ||
        erro?.statusCode === 403 ||
        (typeof erro?.message === "string" &&
          erro.message.toLowerCase().includes("key"));

      if (isAuthError) {
        logChat({
          tipo: "ERRO",
          modelo: m.name,
          provider: m.provider,
          mensagem: `Autenticação falhou (${erro?.statusCode}). Provedor ${m.provider} bloqueado.`,
          detalhes: erro?.message,
        });
        blacklistedProviders.add(m.provider);
      } else {
        logChat({
          tipo: "FALLBACK",
          modelo: m.name,
          provider: m.provider,
          mensagem: `${erro?.message || "Erro desconhecido"}`,
          detalhes: "Tentando próximo modelo...",
        });
      }
    }
  }

  logChat({
    tipo: "ERRO",
    mensagem: "TODOS os modelos falharam.",
    detalhes: `Bloqueados: ${[...blacklistedProviders].join(", ") || "nenhum"}`,
  });

  throw new Error(
    "Todos os modelos de IA falharam. Verifique suas chaves de API no .env.local."
  );
}

export const chatService = {
  executarChat,
};
