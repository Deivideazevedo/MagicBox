import { categoriaService as service } from "@/core/categorias/service";
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
export const PATCH = errorHandler(update);

/**
 * DELETE /api/categorias/[id]
 * Remove uma categoria
 */
export const DELETE = errorHandler(remove);

async function remove(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  const { id } = params;

  service.remove(id);
  return NextResponse.json({ success: true });
}

async function update(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: categoriaId } = params;
  const body: CategoriaPayload = await request.json();
  const user = await getAuthUser();

  
  const validation = updateCategoriaSchema.parse(body);

  const payload = {
    ...validation,
    userId: validation.userId ?? Number(user.id), // Garante que userId seja number
  };


  const categoriaAtualizada = await service.update(Number(categoriaId), payload);
  return NextResponse.json(categoriaAtualizada);
}
