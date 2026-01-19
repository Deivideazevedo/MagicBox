import { createLancamentoSchema, findAllQuerySchema } from "@/core/lancamentos/lancamento.dto";
import { lancamentoService as service } from "@/core/lancamentos/service";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(findAll);
export const POST = errorHandler(create);

async function findAll(request: NextRequest): Promise<NextResponse> {
  const { id: authId, role } = await getAuthUser();
  const { searchParams } = new URL(request.url);

  const rawFilters = Object.fromEntries(searchParams.entries());

  // Se for admin, pode usar userId do filtro caso exista
  // Se não for admin, só pode usar o próprio userId
  const userId =
    role === "admin" ? searchParams.get("userId") || authId : authId;

  const filters = findAllQuerySchema.parse({
    ...rawFilters,
    userId: Number(userId),
  });

  const result = await service.findAll(filters);

  // Sempre retorna resposta paginada
  return NextResponse.json(result);
}

async function create(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  const body = await request.json();

  // Validação com Zod
  const validation = createLancamentoSchema.parse(body);

  const payload = {
    ...validation,
    userId: Number(user.id), // Garante que userId seja number
  };

  const novoLancamento = await service.create(payload);
  return NextResponse.json(novoLancamento, { status: 201 });
}
