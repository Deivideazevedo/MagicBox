import { authOptions } from "@/lib/authOptions";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "src/data/despesas.json");

function readDespesas() {
  try {
    const data = readFileSync(DATA_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeDespesas(despesas: any[]) {
  writeFileSync(DATA_PATH, JSON.stringify(despesas, null, 2));
}

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

    const despesas = readDespesas();
    const despesaIndex = despesas.findIndex(
      (despesa: any) => despesa.id === id && despesa.userId === session.user.id
    );

    if (despesaIndex === -1) {
      return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
    }

    despesas[despesaIndex] = {
      ...despesas[despesaIndex],
      nome,
      updatedAt: new Date().toISOString(),
    };

    writeDespesas(despesas);

    return NextResponse.json(despesas[despesaIndex]);
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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
    const despesas = readDespesas();
    const despesaIndex = despesas.findIndex(
      (despesa: any) => despesa.id === id && despesa.userId === session.user.id
    );

    if (despesaIndex === -1) {
      return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
    }

    despesas.splice(despesaIndex, 1);
    writeDespesas(despesas);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir despesa:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}