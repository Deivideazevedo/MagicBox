// src/app/api/categorias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { categoriaService } from "@/core/categorias/service";
import { CreateCategoriaDTO } from "@/core/categorias/dto";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categorias = categoriaService.listarPorUsuario(session.user.id);
  return NextResponse.json(categorias);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: CreateCategoriaDTO = await request.json();

  if (!body.nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const novaCategoria = categoriaService.criar(session.user.id, body);

  return NextResponse.json(novaCategoria, { status: 201 });
}
