import { fnFormatDateInTimeZone } from "../functions/fnFormatDateInTimeZone";

/**
 * Formata um log de erro de forma visual
 */
export type ErrorResponse = {
  error: string;
  message: string;
  details?: any;
};

type ErrorLogParams = {
  url: string;
  method: string;
} & ErrorResponse;

type ConsoleErrorLogParams = ErrorLogParams | { formattedLog: string };

export function consoleErrorLogger(params: ConsoleErrorLogParams) {
  // Log apenas em desenvolvimento
  if (process.env.NODE_ENV == "production") return;

  // Verificar se é um log formatado customizado
  if ("formattedLog" in params) {
    console.error(params.formattedLog);
    return;
  }

  // Caso contrário, formatar com os dados estruturados
  const { url, method, error, message, details } = params;

  const colors = {
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
  };

  // ... dentro da sua função de log
  const formattedLog =
    "\n" +
    `${colors.red}═══════════════════════════════════════════════════════════════════${colors.reset}\n` +
    `🚨 ERRO: ${colors.red}${colors.bright}${error}${colors.reset}\n` +
    `${colors.red}═══════════════════════════════════════════════════════════════════${colors.reset}\n` +
    `⏰ Hora:     ${colors.green}${fnFormatDateInTimeZone()}${colors.reset}\n` +
    `🧰 Metodo:   ${colors.magenta}${colors.bright}${method}${colors.reset}\n` +
    `🚀 Rota:     ${colors.cyan}${url}${colors.reset}\n` +
    `💬 Mensagem: ${colors.yellow}${message}${colors.reset}\n` +
    (details ? `🔍 Detalhes: ${JSON.stringify(details, null, 2)}\n` : "") +
    `${colors.red}═══════════════════════════════════════════════════════════════════${colors.reset}\n`;

  console.error(formattedLog);
}
