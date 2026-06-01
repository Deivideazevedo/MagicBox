import { sistemaService as servico } from "@/core/sistema/service";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";
import { ForbiddenError } from "@/lib/errors";

export const POST = errorHandler(executarLimpeza);

async function executarLimpeza(requisicao: NextRequest): Promise<NextResponse> {
  // Apenas admins autenticados podem rodar a limpeza
  const usuarioAutenticado = await getAuthUser(requisicao);
  
  if (usuarioAutenticado.role !== "admin") {
    throw new ForbiddenError("Acesso negado: apenas administradores podem executar a limpeza manual.");
  }

  // Parsear corpo da requisição
  let dias = 7; // Valor padrão de 7 dias
  try {
    const corpo = await requisicao.json();
    if (corpo && typeof corpo.dias === "number" && corpo.dias >= 0) {
      dias = corpo.dias;
    }
  } catch (error) {
    // Caso não venha JSON, prossegue com o padrão de 7 dias
  }

  // Executa a limpeza através da camada de serviço (sem invocar o Prisma diretamente na rota)
  const resultado = await servico.executarLimpeza(dias);

  return NextResponse.json({
    success: true,
    ...resultado,
  });
}
