// src/app/api/categorias/route.ts
// 🎯 IMPORTANTE: Importar zod-config ANTES de qualquer uso do Zod
import "@/lib/zod-config";

import { categoriaService as servico } from "@/core/categorias/service";
import { createCategoriaSchema, listCategoriasSchema } from "@/core/categorias/categoria.dto";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/categorias
 */
export const GET = errorHandler(listarTodos);
export const POST = errorHandler(criar);

async function listarTodos(requisicao: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(requisicao.url);
  const filtros = Object.fromEntries(searchParams.entries());

  // Validação via Zod dos parâmetros de busca
  const query = listCategoriasSchema.parse(filtros);

  // Determina o ID do usuário efetivo diretamente na autenticação
  const { userId } = await getAuthUser(requisicao, query.userId);

  const categorias = await servico.listarPorUsuario(userId);

  return NextResponse.json(categorias);
}

async function criar(requisicao: NextRequest): Promise<NextResponse> {
  const corpo = await requisicao.json();
  const dados = createCategoriaSchema.parse(corpo);

  // Determina o ID do usuário efetivo na autenticação (permite admin bypass se presente no DTO)
  const { userId } = await getAuthUser(requisicao, dados.userId);

  const novaCategoria = await servico.criar({
    ...dados,
    userId,
  });

  return NextResponse.json(novaCategoria, { status: 201 });
}
