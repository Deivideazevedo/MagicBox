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
 * PATCH /api/lancamentos/[id]
 * Atualiza um lançamento existente
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
    const { id } = params;

    const lancamentos = readLancamentos();
    const lancamentoIndex = lancamentos.findIndex(
      (lancamento: any) => lancamento.id === id && lancamento.userId === session.user.id
    );

    if (lancamentoIndex === -1) {
      return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 });
    }

    lancamentos[lancamentoIndex] = {
      ...lancamentos[lancamentoIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    writeLancamentos(lancamentos);

    return NextResponse.json(lancamentos[lancamentoIndex]);
  } catch (error) {
    console.error("Erro ao atualizar lançamento:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/lancamentos/[id]
 * Remove um lançamento
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
    const lancamentos = readLancamentos();
    const lancamentoIndex = lancamentos.findIndex(
      (lancamento: any) => lancamento.id === id && lancamento.userId === session.user.id
    );

    if (lancamentoIndex === -1) {
      return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 });
    }

    lancamentos.splice(lancamentoIndex, 1);
    writeLancamentos(lancamentos);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir lançamento:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}