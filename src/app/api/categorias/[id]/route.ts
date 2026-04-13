import { categoriaService as servico } from "@/core/categorias/service";
import { updateCategoriaSchema, categoriaIdSchema } from "@/core/categorias/categoria.dto";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/categorias/[id]
 */
export const PATCH = errorHandler(atualizar);

/**
 * DELETE /api/categorias/[id]
 */
export const DELETE = errorHandler(remover);

async function remover(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  await getAuthUser(requisicao);
  const { id } = categoriaIdSchema.parse(params);

  await servico.remover(id);
  return NextResponse.json({ success: true });
}

async function atualizar(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = categoriaIdSchema.parse(params);
  const corpo = await requisicao.json();
  const dados = updateCategoriaSchema.parse(corpo);
  
  // A autenticação já nos provê o userId efetivo (dono ou via admin override)
  const { userId } = await getAuthUser(requisicao, dados.userId);

  const categoriaAtualizada = await servico.atualizar(id, {
    ...dados,
    userId,
  });

  return NextResponse.json(categoriaAtualizada);
}
