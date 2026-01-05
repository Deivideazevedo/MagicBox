import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { HttpError } from "./errors";
import { consoleErrorLogger, ErrorResponse } from "@/utils/formatterLogs/consoleErrorLogger";
// 🎯 Importa configuração global do Zod para mensagens em português
import "@/lib/zod-config";


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
      else if (error instanceof HttpError) {
        status = error.statusCode;
        body = {
          error: error.name,
          message: error.message,
          details: error.details,
        };
      }

      // Error instance
      else if (error instanceof Error) {
        body = {
          error: error.name,
          message: error.message,
        };
      }

      // Erros do Prisma
      else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        status = 400;
        
        // Mapeamento de códigos de erro do Prisma
        const errorMessages: Record<string, string> = {
          P2002: "Já existe um registro com estes dados",
          P2003: "Referência inválida ou não encontrada",
          P2025: "Registro não encontrado",
          P2014: "A operação viola uma restrição de integridade",
        };

        body = {
          error: "DatabaseError",
          message: errorMessages[error.code] || "Erro no banco de dados",
          details: {
            code: error.code,
            meta: error.meta,
          },
        };
      }

      else if (error instanceof Prisma.PrismaClientValidationError) {
        status = 400;
        body = {
          error: "ValidationError",
          message: "Dados inválidos para o banco de dados",
        };
      }

      consoleErrorLogger({ url, method, ...body });
      return NextResponse.json(body, { status });
    }
  }) as T;
}
