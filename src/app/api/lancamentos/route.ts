import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { lancamentoService as service } from "@/core/lancamentos/service";
import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/errors";
import { createLancamentoSchema } from "@/core/lancamentos/lancamento.dto";

export const GET = errorHandler(findAll);
export const POST = errorHandler(create);

async function findAll(request: NextRequest): Promise<NextResponse> {
  const { id: authId, role } = await getAuthUser();
  const { searchParams } = new URL(request.url);
  
  // Se for admin, pode usar userId do filtro caso exista
  // Se não for admin, só pode usar o próprio userId
  const userId = role === "admin" ? searchParams.get('userId') || authId : authId;

  // Construir filtros
  const filters: any = {
    userId: Number(userId),
    page: Number(searchParams.get('page')) || 0,
    limit: Number(searchParams.get('limit')) || 10,
  };

  // Filtros de data
  if (searchParams.get('dataInicio')) {
    filters.dataInicio = searchParams.get('dataInicio');
  }
  if (searchParams.get('dataFim')) {
    filters.dataFim = searchParams.get('dataFim');
  }

  // Filtro por categoria
  if (searchParams.get('categoriaId')) {
    filters.categoriaId = Number(searchParams.get('categoriaId'));
  }

  // Filtro por despesa
  if (searchParams.get('despesaId')) {
    filters.despesaId = Number(searchParams.get('despesaId'));
  }

  // Filtro por fonte de renda
  if (searchParams.get('fonteRendaId')) {
    filters.fonteRendaId = Number(searchParams.get('fonteRendaId'));
  }

  // Filtro por tipo
  if (searchParams.get('tipo')) {
    filters.tipo = searchParams.get('tipo');
  }

  // Filtro por busca
  if (searchParams.get('busca')) {
    filters.busca = searchParams.get('busca');
  }

  const result = await service.findAll(filters);
  
  // Sempre retorna resposta paginada
  return NextResponse.json(result);
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