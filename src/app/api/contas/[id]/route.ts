import { authOptions } from "@/lib/authOptions";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "src/data/contas.json");

function readContas() {
  try {
    const data = readFileSync(DATA_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeContas(contas: any[]) {
  writeFileSync(DATA_PATH, JSON.stringify(contas, null, 2));
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
    const { despesaId, nome, valorEstimado, diaVencimento, status } = body;
    const { id } = params;

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const contas = readContas();
    const contaIndex = contas.findIndex(
      (conta: any) => conta.id === id && conta.userId === session.user.id
    );

    if (contaIndex === -1) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    contas[contaIndex] = {
      ...contas[contaIndex],
      despesaId: despesaId || contas[contaIndex].despesaId,
      nome,
      valorEstimado: valorEstimado !== undefined ? valorEstimado : contas[contaIndex].valorEstimado,
      diaVencimento: diaVencimento !== undefined ? diaVencimento : contas[contaIndex].diaVencimento,
      status: status !== undefined ? status : contas[contaIndex].status,
      updatedAt: new Date().toISOString(),
    };

    writeContas(contas);

    return NextResponse.json(contas[contaIndex]);
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
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
    const contas = readContas();
    const contaIndex = contas.findIndex(
      (conta: any) => conta.id === id && conta.userId === session.user.id
    );

    if (contaIndex === -1) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    contas.splice(contaIndex, 1);
    writeContas(contas);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}