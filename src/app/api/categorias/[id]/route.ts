import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "src/data/categorias.json");

function readCategorias() {
  try {
    const data = readFileSync(DATA_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeCategorias(categorias: any[]) {
  writeFileSync(DATA_PATH, JSON.stringify(categorias, null, 2));
}

/**
 * PATCH /api/categorias/[id]
 * Atualiza uma categoria existente
 * Body: { nome: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nome } = body;
    const { id } = params;

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const categorias = readCategorias();
    const categoriaIndex = categorias.findIndex(
      (cat: any) => cat.id === id && cat.userId === session.user.id
    );

    if (categoriaIndex === -1) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    categorias[categoriaIndex] = {
      ...categorias[categoriaIndex],
      nome,
      updatedAt: new Date().toISOString(),
    };

    writeCategorias(categorias);

    return NextResponse.json(categorias[categoriaIndex]);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/categorias/[id]
 * Remove uma categoria
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const categorias = readCategorias();
    const categoriaIndex = categorias.findIndex(
      (cat: any) => cat.id === id && cat.userId === session.user.id
    );

    if (categoriaIndex === -1) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    categorias.splice(categoriaIndex, 1);
    writeCategorias(categorias);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}