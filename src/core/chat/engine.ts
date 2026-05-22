import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createFallback } from "ai-fallback";
import { logChat } from "./log-utils";

// Provedor do GitHub/Azure de emergência (Reserva de contingência absoluta)
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
  /**
   * ===================================================================================
   * 🌟 O CORAÇÃO DA INTEGRAÇÃO COM O GEMINI: CORREÇÃO DE ASSINATURA DE PENSAMENTO (Thought Signature)
   * ===================================================================================
   * 
   * 1. A Exigência do Gemini: A API do Google Gemini exige de forma muito rígida que todas as 
   * chamadas e respostas de ferramentas (Tool Calling) no histórico da conversa contenham uma 
   * assinatura de validação de pensamento (thoughtSignature) gerada pelo próprio modelo do Gemini.
   * 
   * 2. O Conflito no Fallback: Como nossa cascata inteligente de provedores troca de modelo 
   * dinamicamente (ex: começa na Groq e depois chaveia para o Gemini se a Groq falhar), o histórico 
   * enviado para o Gemini frequentemente conterá ferramentas chamadas por outros modelos. Sem a 
   * assinatura válida neles, a API do Google quebra imediatamente com erro fatal de validação.
   * 
   * 3. A Solução (Bypass): O 'prepararParams' intercepta a requisição e varre o histórico injetando 
   * a chave de bypass "skip_thought_signature_validator" nas chamadas de ferramentas. Isso faz com 
   * que a API do Google Gemini ignore a validação e processe o histórico com 100% de sucesso.
   */
  const prepararParams = (params: any) => {
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

/**
 * Motor de Fallback Resiliente multiprovedores
 */
export const resilientModel = createFallback({
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
  // Quarentena: Se um modelo falhar (ex: Rate Limit 429), ele é ignorado por 2 minutos
  modelResetInterval: 120000,
  onError: (error, modelId) => {
    // Dispara a cada tombo individual. 
    // Ex: Groq caiu? Registra e vai pro Google silenciosamente.
    logChat({
      tipo: "FALLBACK",
      modelo: modelId,
      mensagem: `O modelo ${modelId} falhou e entrou em quarentena de 2 minutos.`,
      detalhes: String(error),
      erro: error,
    });
  },
});
