import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { despesaService as servico } from "@/core/despesas/service";
import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/errors";
import { createDespesaSchema } from "@/core/despesas/despesa.dto";

export const GET = errorHandler(listarTodos);
export const POST = errorHandler(criar);

async function listarTodos(requisicao: NextRequest): Promise<NextResponse> {
  const { id: authId, role } = await getAuthUser();
  const { searchParams } = new URL(requisicao.url);
  const filtros = Object.fromEntries(searchParams.entries());

  // Se for admin, pode usar userId do filtro caso exista
  // Se não for admin, só pode usar o próprio userId
  const userId = role === "admin" ? filtros.userId || authId : authId;

  // Converte userId para number se necessário
  const numericUserId = Number(userId);

  const despesas = await servico.listarPorUsuario(numericUserId);

  return NextResponse.json(despesas);
}

async function criar(requisicao: NextRequest): Promise<NextResponse> {
  const usuario = await getAuthUser();
  const corpo = await requisicao.json();

  // Validação com Zod
  const validacao = createDespesaSchema.parse(corpo);

  const dados = {
    ...validacao,
    userId: Number(usuario.id), // Garante que userId seja number
    valorEstimado: validacao.valorEstimado ? Number(validacao.valorEstimado) : null,
    diaVencimento: validacao.diaVencimento ? Number(validacao.diaVencimento) : null,
  };

  const novaDespesa = await servico.criar(dados);
  return NextResponse.json(novaDespesa, { status: 201 });
}
