import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { despesaService as service } from "@/core/despesas/service";
import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/errors";
import { createDespesaSchema } from "@/core/despesas/despesa.dto";

export const GET = errorHandler(findAll);
export const POST = errorHandler(create);

async function findAll(request: NextRequest): Promise<NextResponse> {
  const { id: authId, role } = await getAuthUser();
  const { searchParams } = new URL(request.url);
  const filters = Object.fromEntries(searchParams.entries());

  // Se for admin, pode usar userId do filtro caso exista
  // Se não for admin, só pode usar o próprio userId
  const userId = role === "admin" ? filters.userId || authId : authId;

  // Converte userId para number se necessário
  const numericUserId = Number(userId);

  const despesas = await service.findByUser(numericUserId);

  return NextResponse.json(despesas);
}

async function create(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  const body = await request.json();

  // Validação com Zod
  const validation = createDespesaSchema.parse(body);

  const payload = {
    ...validation,
    userId: Number(user.id), // Garante que userId seja number
    valorEstimado: validation.valorEstimado ? Number(validation.valorEstimado) : null,
    diaVencimento: validation.diaVencimento ? Number(validation.diaVencimento) : null,
  };

  const novaDespesa = await service.create(payload);
  return NextResponse.json(novaDespesa, { status: 201 });
}
