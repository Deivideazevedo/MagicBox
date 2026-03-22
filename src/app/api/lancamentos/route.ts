import { createLancamentoSchema, findAllQuerySchema } from "@/core/lancamentos/lancamento.dto";
import { lancamentoService as servico } from "@/core/lancamentos/service";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(listarTodos);
export const POST = errorHandler(criar);

async function listarTodos(requisicao: NextRequest): Promise<NextResponse> {
  const { id: authId, role } = await getAuthUser();
  const { searchParams } = new URL(requisicao.url);

  const rawFilters = Object.fromEntries(searchParams.entries());

  // Se for admin, pode usar userId do filtro caso exista
  // Se não for admin, só pode usar o próprio userId
  const userId =
    role === "admin" ? searchParams.get("userId") || authId : authId;

  const filtros = findAllQuerySchema.parse({
    ...rawFilters,
    userId: Number(userId),
  });

  const resultado = await servico.listarTodos(filtros);

  // Sempre retorna resposta paginada
  return NextResponse.json(resultado);
}

async function criar(requisicao: NextRequest): Promise<NextResponse> {
  const usuario = await getAuthUser();
  const corpo = await requisicao.json();

  // Validação com Zod
  const validacao = createLancamentoSchema.parse(corpo);

  const dados = {
    ...validacao,
    userId: Number(usuario.id), // Garante que userId seja number
  };

  const novoLancamento = await servico.criar(dados);
  return NextResponse.json(novoLancamento, { status: 201 });
}
