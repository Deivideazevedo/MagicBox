import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "./errors";

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
export function errorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Erro de validação do Zod
      if (error instanceof ZodError) {
        // A mensagem já vem em português graças ao customErrorMap (zod-config.ts)
        const friendlyMessage = error.issues[0]?.message || "Erro de validação nos dados enviados";

        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV !== 'production') {
          console.error("❌ Erro de validação Zod:", { 
            message: friendlyMessage, 
            issues: error.issues 
          });
        }

        return NextResponse.json(
          { 
            error: "ValidationError",
            message: friendlyMessage,
            details: error.issues // Issues completos com campos, códigos, etc
          },
          { status: 400 }
        );
      }

      // Erro HTTP customizado
      if (error instanceof HttpError) {
        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV !== 'production') {
          console.error(`❌ ${error.name}:`, { 
            message: error.message, 
            details: error.details,
            statusCode: error.statusCode 
          });
        }

        return NextResponse.json(
          { 
            error: error.name,
            message: error.message,
            ...(error.details && { details: error.details })
          },
          { status: error.statusCode }
        );
      }

      // Erro desconhecido
      // Log apenas em desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        console.error("❌ Erro não tratado:", error);
      }
      
      const message = "Ocorreu um erro inesperado. Por favor, tente novamente";
      const details = {
        tipo: error instanceof Error ? error.constructor.name : typeof error,
        mensagem: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      };

      return NextResponse.json(
        { 
          error: "InternalServerError",
          message,
          details
        },
        { status: 500 }
      );
    }
  }) as T;
}
