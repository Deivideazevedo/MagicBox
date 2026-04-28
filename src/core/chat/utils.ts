import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";

const isDev = process.env.NODE_ENV !== "production";

// ─────────────────────────────────────────────────
// Cores ANSI para terminal
// ─────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  white: "\x1b[37m",
};

// ─────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────
type TipoChatLog =
  | "REQ_INICIO"
  | "CONTEXTO"
  | "PROVEDOR"
  | "TOOL_CALL"
  | "TOOL_RESULT"
  | "RESPOSTA"
  | "FALLBACK"
  | "ERRO";

interface ChatLogParams {
  tipo: TipoChatLog;
  modelo?: string;
  provider?: string;
  userId?: number;
  ferramenta?: string;
  mensagem?: string;
  detalhes?: string;
  erro?: any; // Objeto de erro bruto
}

// ─────────────────────────────────────────────────
// Mapeamento visual por tipo
// ─────────────────────────────────────────────────

const icons: Record<TipoChatLog, string> = {
  REQ_INICIO: "📩",
  CONTEXTO: "📋",
  PROVEDOR: "🤖",
  TOOL_CALL: "🔧",
  TOOL_RESULT: "📊",
  RESPOSTA: "💬",
  FALLBACK: "🔄",
  ERRO: "🚨",
};

const labels: Record<TipoChatLog, string> = {
  REQ_INICIO: "NOVA REQUISIÇÃO",
  CONTEXTO: "CONTEXTO",
  PROVEDOR: "PROVEDOR",
  TOOL_CALL: "TOOL CALL",
  TOOL_RESULT: "TOOL RESULT",
  RESPOSTA: "RESPOSTA",
  FALLBACK: "FALLBACK",
  ERRO: "ERRO",
};

const corPorTipo: Record<TipoChatLog, string> = {
  REQ_INICIO: c.green,
  CONTEXTO: c.gray,
  PROVEDOR: c.cyan,
  TOOL_CALL: c.magenta,
  TOOL_RESULT: c.blue,
  RESPOSTA: c.green,
  FALLBACK: c.yellow,
  ERRO: c.red,
};

// Contador de etapas por requisição
let stepCounter = 0;

/** Reseta o contador de etapas (chamar no início de cada requisição) */
export function resetLogStep() {
  stepCounter = 0;
}

/**
 * Formata e exibe logs do chat no terminal (modo dev).
 * Formato flat e limpo, preparado para futura persistência em banco.
 */
export function logChat(params: ChatLogParams) {
  if (!isDev) return;

  stepCounter++;
  const hora = fnFormatDateInTimeZone();
  const { tipo, modelo, provider, userId, ferramenta, mensagem, detalhes, erro } = params;

  const cor = corPorTipo[tipo] || c.white;
  const icon = icons[tipo] || "📌";
  const label = labels[tipo] || tipo;
  const step = String(stepCounter).padStart(2, "0");

  // Gerar linha contínua sólida
  const linhaDivisoria = `${cor}${"─".repeat(70)}${c.reset}`;

  // Cabeçalho com o nome da etapa
  let log = `\n${linhaDivisoria}\n`;
  log += `${cor}[${step}]${c.reset} ${icon} ${cor}${c.bright}${label}${c.reset}\n`;

  // Metadados em formato de lista (um por linha)
  log += `Horário:  ⏰ ${c.gray}${hora}${c.reset}\n`;
  if (userId !== undefined) log += `Usuário:  👤 ${c.cyan}#${userId}${c.reset}\n`;
  if (provider) log += `Provedor: 🏢 ${c.magenta}${provider}${c.reset}\n`;
  if (modelo) log += `Modelo:   🤖 ${c.cyan}${modelo}${c.reset}\n`;
  if (ferramenta) log += `Tool:     🔧 ${c.yellow}${ferramenta}${c.reset}\n`;

  if (mensagem || detalhes || erro) {
    log += `Mensagem:\n`;
    if (mensagem) {
      const msgTruncada = mensagem.length > 500 ? mensagem.substring(0, 500) + "..." : mensagem;
      log += `💬 ${c.white}${msgTruncada}${c.reset}\n`;
    }
    if (detalhes) {
      log += `🔍 ${c.dim}${detalhes}${c.reset}\n`;
    }
    if (erro) {
      const erroStr = typeof erro === 'object' ? JSON.stringify(erro, null, 2) : String(erro);
      log += `🚨 ${c.red}${c.dim}${erroStr.substring(0, 800)}${c.reset}\n`;
    }
  }

  log += `${linhaDivisoria}\n`;

  console.log(log);
}
