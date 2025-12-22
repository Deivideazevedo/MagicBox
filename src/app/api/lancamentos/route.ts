import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { lancamentoService as service } from "@/core/lancamentos/service";
import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/errors";
import { createLancamentoSchema } from "@/dtos/lancamento.dto";

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

  // TODO: Implementar filtros avançados no service/repository se necessário
  // Por enquanto, retorna todos do usuário e filtra no frontend ou implementa filtros básicos
  const lancamentos = await service.findByUser(numericUserId);

  // Filtragem básica em memória se o repository não suportar todos os filtros ainda
  // Idealmente, passar filtros para o repository
  // const filtered = lancamentos.filter(...) 

  return NextResponse.json(lancamentos);
}

async function create(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  const body = await request.json();

  // Validação com Zod
  const validation = createLancamentoSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError((validation.error as any).errors[0].message);
  }

  const payload = {
    ...validation.data,
    userId: Number(user.id), // Garante que userId seja number
  };

  const novoLancamento = await service.create(payload);
  return NextResponse.json(novoLancamento, { status: 201 });
}