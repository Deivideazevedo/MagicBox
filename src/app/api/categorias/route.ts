// src/app/api/categorias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { categoriaService } from "@/core/categorias/service";
import { CreateCategoriaDTO } from "@/core/categorias/dto";

/**
 * GET /api/categorias
 *
 * ✅ Rota protegida pelo middleware - apenas usuários autenticados chegam aqui
 * ✅ Suporta autenticação via Cookie de sessão (browser)
 * ✅ Suporta autenticação via Bearer Token (API externa)
 *
 * Exemplo browser:
 *   Faz login via NextAuth normalmente → Cookie automático → Funciona
 *
 * Exemplo API externa:
 *   POST /api/auth/login → recebe token
 *   GET /api/categorias → Header: Authorization: Bearer {token}
 */
export async function GET() {
  const user = await getAuthUser();

  const categorias = categoriaService.listarPorUsuario(user.id);
  return NextResponse.json(categorias);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  const body: CreateCategoriaDTO = await request.json();

  if (!body.nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const novaCategoria = categoriaService.criar(user.id, body);

  return NextResponse.json(novaCategoria, { status: 201 });
}
