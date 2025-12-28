// src/app/api/categorias/route.ts
// 🎯 IMPORTANTE: Importar zod-config ANTES de qualquer uso do Zod
import "@/lib/zod-config";

import { categoriaService as service } from "@/core/categorias/service";
import { createCategoriaSchema } from "@/core/categorias/categoria.dto";
import { errorHandler } from "@/lib/error-handler";
import { ValidationError } from "@/lib/errors";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

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

  // Converte userId para number se necessário
  const numericUserId = Number(userId);

  const categorias = await service.findByUser(numericUserId);

  return NextResponse.json(categorias);
}

async function create(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  const body = await request.json();

  // Validação com Zod - parse() lança ZodError automaticamente se falhar
  // O errorHandler vai capturar e traduzir para mensagens amigáveis
  const validation = createCategoriaSchema.parse(body);

  const payload = {
    ...validation,
    userId: Number(user.id), // Garante que userId seja number
  };

  const novaCategoria = await service.create(payload);

  return NextResponse.json(novaCategoria, { status: 201 });
}
