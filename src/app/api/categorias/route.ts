// src/app/api/categorias/route.ts
import { categoriaService as service } from "@/core/categorias/service";
import { CategoriaPayload } from "@/core/categorias/types";
import { errorHandler } from "@/lib/error-handler";
import { ValidationError } from "@/lib/errors";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/categorias
 *
 * ✅ Rota protegida pelo middleware - apenas usuários autenticados chegam aqui
 * ✅ Suporta autenticação via Cookie de sessão (browser)
 * ✅ Suporta autenticação via Bearer Token (API externa)
 * ✅ Tratamento de erros automático via errorHandler
 * ✅ Suporta query params: ?search=nome&ativo=true
 *
 * Exemplo browser:
 *   Faz login via NextAuth normalmente → Cookie automático → Funciona
 *
 * Exemplo API externa:
 *   POST /api/auth/login → recebe token
 *   GET /api/categorias?search=alimentacao → Header: Authorization: Bearer {token}
 */
export const GET = errorHandler(findAll);
export const POST = errorHandler(create);

async function findAll(request: NextRequest): Promise<NextResponse> {
  const { id: authId, role } = await getAuthUser();
  const { searchParams } = new URL(request.url);
  const filters = Object.fromEntries(searchParams.entries());

  // Se for admin, pode usar userId do filtro caso exista
  // Se não for admin, só pode usar o próprio userId
  const userId = role === "admin" ? filters.userId || authId : authId;

  const categorias = service.findAll({
    ...filters,
    userId, // Força o userId do usuário logado
  });

  return NextResponse.json(categorias);
}

async function create(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  const body: CategoriaPayload = await request.json();

  if (!body.nome) throw new ValidationError("Nome é obrigatório");

  const novaCategoria = service.create({ ...body, userId: user.id });
  return NextResponse.json(novaCategoria, { status: 201 });
}
