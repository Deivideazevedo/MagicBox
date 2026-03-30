import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { lancamentoService as servico } from "@/core/lancamentos/service";
import { ValidationError } from "@/lib/errors";
import { updateLancamentoSchema } from "@/core/lancamentos/lancamento.dto";
import type { LancamentoPayload } from "@/core/lancamentos/types";

export const GET = errorHandler(buscarPorId);
export const PATCH = errorHandler(atualizar);
export const DELETE = errorHandler(remover);

async function buscarPorId(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;
  const lancamento = await servico.buscarPorId(id);
  
  if (!lancamento) {
    throw new ValidationError("Lançamento não encontrado");
  }

  return NextResponse.json(lancamento);
}

async function atualizar(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;
  const corpo = await requisicao.json();

  // Validação com Zod
  const validacao = updateLancamentoSchema.safeParse(corpo);
  if (!validacao.success) {
    throw new ValidationError((validacao.error as any).errors[0].message);
  }

  const lancamentoAtualizado = await servico.atualizar(id, validacao.data as LancamentoPayload);
  return NextResponse.json(lancamentoAtualizado);
}

async function remover(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;
  const success = await servico.remover(id);
  
  if (!success) {
    throw new ValidationError("Lançamento não encontrado");
  }

  return NextResponse.json({ success: true });
}
