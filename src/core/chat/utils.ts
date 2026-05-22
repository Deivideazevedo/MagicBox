import { UIMessage } from "ai";
import { logChat } from "./log-utils";

// Limites e constantes do histórico de contexto
export const MAX_CONTEXT_CHARS = 4000;
export const MAX_MESSAGES = 6; // 3 trocas completas usuário/IA
export const MAX_INPUT_CHARS = 500;

/**
 * Higieniza o histórico de mensagens, limitando a quantidade e tamanho dos caracteres,
 * e garantindo a estrutura correta exigida pelas principais LLMs.
 */
export function aplicarJanelaDeContexto(messages: UIMessage[]): UIMessage[] {
  let charCount = 0;
  let resultado: UIMessage[] = [];

  // Pega as últimas N mensagens do histórico
  const ultimasMensagens = messages.slice(-MAX_MESSAGES);

  // Higieniza o histórico de trás para frente mantendo os metadados intactos
  for (let i = ultimasMensagens.length - 1; i >= 0; i--) {
    const msg = ultimasMensagens[i];

    // Higieniza partes de texto vazias (preserva ferramentas, arquivos, etc.)
    const validParts = msg.parts.filter((p) => {
      if (p.type === "text") return p.text.trim().length > 0;
      return true;
    });

    const contentStr = validParts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");

    // Limite de segurança contra estouro de tokens
    if (charCount + contentStr.length > MAX_CONTEXT_CHARS) break;

    resultado.unshift({ ...msg, parts: validParts });
    charCount += contentStr.length;
  }

  // Regra crítica para o Gemini/Anthropic: O histórico de chat deve sempre começar com 'user'
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
