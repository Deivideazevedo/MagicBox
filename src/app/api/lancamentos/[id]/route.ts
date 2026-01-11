import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { lancamentoService as service } from "@/core/lancamentos/service";
import { ValidationError } from "@/lib/errors";
import { updateLancamentoSchema } from "@/core/lancamentos/lancamento.dto";
import type { LancamentoPayload } from "@/core/lancamentos/types";

export const GET = errorHandler(findById);
export const PATCH = errorHandler(update);
export const DELETE = errorHandler(remove);

async function findById(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;
  const lancamento = await service.findById(id);
  
  if (!lancamento) {
    throw new ValidationError("Lançamento não encontrado");
  }

  return NextResponse.json(lancamento);
}

async function update(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;
  const body = await request.json();

  // Validação com Zod
  const validation = updateLancamentoSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError((validation.error as any).errors[0].message);
  }

  const lancamentoAtualizado = await service.update(id, validation.data as LancamentoPayload);
  return NextResponse.json(lancamentoAtualizado);
}

async function remove(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;
  const success = await service.remove(id);
  
  if (!success) {
    throw new ValidationError("Lançamento não encontrado");
  }

  return NextResponse.json({ success: true });
}
