import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "src/data/lancamentos.json");

function readLancamentos() {
  try {
    const data = readFileSync(DATA_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeLancamentos(lancamentos: any[]) {
  writeFileSync(DATA_PATH, JSON.stringify(lancamentos, null, 2));
}

/**
 * DELETE /api/lancamentos/bulk-delete
 * Remove múltiplos lançamentos de uma vez
 * Body: { ids: string[] }
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs são obrigatórios" }, { status: 400 });
    }

    const lancamentos = readLancamentos();
    
    // Filtrar apenas lançamentos do usuário que não estão na lista de IDs para deletar
    const lancamentosFiltrados = lancamentos.filter((lancamento: any) => {
      // Manter apenas se NÃO for do usuário atual OU se não estiver na lista de exclusão
      return lancamento.userId !== session.user.id || !ids.includes(lancamento.id);
    });

    writeLancamentos(lancamentosFiltrados);

    return NextResponse.json({ success: true, deletedCount: lancamentos.length - lancamentosFiltrados.length });
  } catch (error) {
    console.error("Erro ao excluir lançamentos em massa:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}