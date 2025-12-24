import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "./errors";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";

/**
 * Formata um log de erro de forma visual
 */
type ErrorResponse = {
  error: string;
  message: string;
  details?: any;
};

type ErrorLogParams = {
  url: string;
  method: string;
} & ErrorResponse;

type ConsoleErrorLogParams = ErrorLogParams | { formattedLog: string };

export function consoleErrorLog(params: ConsoleErrorLogParams) {
  // Log apenas em desenvolvimento
  if (process.env.NODE_ENV == "production") return;

  // Verificar se é um log formatado customizado
  if ("formattedLog" in params) {
    console.error(params.formattedLog);
    return;
  }

  // Caso contrário, formatar com os dados estruturados
  const { url, method, error, message, details } = params;

  const formattedLog =
    "\n" +
    "═══════════════════════════════════════════════════════════════════\n" +
    `🚨 ERRO: ${error}\n` +
    "═══════════════════════════════════════════════════════════════════\n\n" +
    `⏰ Hora: ${fnFormatDateInTimeZone()}\n` +
    `🧰 Metodo: ${method}\n` +
    `🚀 Rota: ${url}\n` +
    `💬 Mensagem: ${message}\n` +
    (details ? `🔍 Detalhes: ${JSON.stringify(details, null, 2)}\n` : "") +
    "\n" +
    "═══════════════════════════════════════════════════════════════════\n";

  console.error(formattedLog);
}

/**
 * Wrapper para tratar erros automaticamente em Route Handlers
 *
 * Retorna:
 * - message: mensagem amigável em português (via zod-config.ts customErrorMap)
 * - details: detalhes técnicos dos issues para debug
 * - error: nome/tipo do erro
 *
 * Console logs aparecem apenas em desenvolvimento
 */

export function errorHandler<
  T extends (...args: any[]) => Promise<NextResponse>
>(handler: T): T {
  return (async (...args: any[]) => {
    // Extrair informações da requisição para logs
    const request = args[0];
    const method = request?.method || "UNKNOWN";
    const url = request?.url || "unknown";

    try {
      return await handler(...args);
    } catch (error) {
      let status = 500;
      let body: ErrorResponse = {
        error: "InternalServerError",
        message: "Ocorreu um erro inesperado. Por favor, tente novamente",
      };

      // Erro de validação do Zod
      if (error instanceof ZodError) {
        status = 400;
        body = {
          error: "ValidationError",
          message: error.issues[0]?.message || "Dados inválidos",
          details: error.issues,
        };
      }

      // Erro HTTP customizado
      if (error instanceof HttpError) {
        status = error.statusCode;
        body = {
          error: error.name,
          message: error.message,
          details: error.details,
        };
      }

      consoleErrorLog({ url, method, ...body });
      return NextResponse.json(body, { status, url });
    }
  }) as T;
}
