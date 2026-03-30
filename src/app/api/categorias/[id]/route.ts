import { categoriaService as servico } from "@/core/categorias/service";
import { CategoriaPayload } from "@/core/categorias/types";
import { updateCategoriaSchema } from "@/dtos";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/categorias/[id]
 * Atualiza uma categoria existente
 * Body: { nome: string }
 */
export const PATCH = errorHandler(atualizar);

/**
 * DELETE /api/categorias/[id]
 * Remove uma categoria
 */
export const DELETE = errorHandler(remover);

async function remover(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
) {
  await getAuthUser();
  const { id } = params;

  await servico.remover(id);
  return NextResponse.json({ success: true });
}

async function atualizar(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: categoriaId } = params;
  const corpo: CategoriaPayload = await requisicao.json();
  const usuario = await getAuthUser();
  
  const validacao = updateCategoriaSchema.parse(corpo);

  const dados = {
    ...validacao,
    userId: validacao.userId ?? Number(usuario.id), // Garante que userId seja number
  };


  const categoriaAtualizada = await servico.atualizar(Number(categoriaId), dados);
  return NextResponse.json(categoriaAtualizada);
}
