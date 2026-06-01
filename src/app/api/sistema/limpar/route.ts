// src/app/api/sistema/limpar/route.ts
import "@/lib/zod-config";

import { executarLimpezaSchema } from "@/core/sistema/sistema.dto";
import { sistemaService as servico } from "@/core/sistema/service";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = errorHandler(limpar);

async function limpar(requisicao: NextRequest): Promise<NextResponse> {
  // Autentica o usuário na requisição
  await getAuthUser(requisicao);

  const corpo = await requisicao.json();
  const dados = executarLimpezaSchema.parse(corpo);

  const resultado = await servico.executarLimpeza(dados.dias);

  return NextResponse.json(resultado);
}
