import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { despesaService as service } from "@/core/despesas/service";
import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/errors";
import { DespesaPayload } from "@/core/despesas/types";



export const GET = errorHandler(findAll);
export const POST = errorHandler(create);

async function findAll(request: NextRequest): Promise<NextResponse> {
  const { id: authId, role } = await getAuthUser();
  const { searchParams } = new URL(request.url);
  const filters = Object.fromEntries(searchParams.entries());

  // Se for admin, pode usar userId do filtro caso exista
  // Se não for admin, só pode usar o próprio userId
  const userId = role === "admin" ? filters.userId || authId : authId;

  const despesas = service.findAll({
    ...filters,
    userId, // Força o userId do usuário logado
  });

  return NextResponse.json(despesas);
}

async function create(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  const body: DespesaPayload = await request.json();

  if (!body.nome) throw new ValidationError("Nome é obrigatório");

  const novaDespesa = service.create({ ...body, userId: user.id });
  return NextResponse.json(novaDespesa, { status: 201 });
}
