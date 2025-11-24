import { NextResponse } from "next/server";
import { HttpError } from "./errors";

/**
 * Wrapper para tratar erros automaticamente em Route Handlers
 */
export function errorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Erro HTTP customizado
      if (error instanceof HttpError) {
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
      console.error("Erro não tratado:", error);
      return NextResponse.json(
        { 
          error: "Erro interno do servidor",
          message: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  }) as T;
}
