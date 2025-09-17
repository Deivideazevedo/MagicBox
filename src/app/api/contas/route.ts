import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const despesaId = searchParams.get("despesaId");

    const contas = readContas();
    let userContas = contas.filter((conta: any) => conta.userId === session.user.id);
    
    if (despesaId) {
      userContas = userContas.filter((conta: any) => conta.despesaId === despesaId);
    }
    
    return NextResponse.json(userContas);
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { despesaId, nome, valorEstimado, diaVencimento, status } = body;

    if (!despesaId || !nome) {
      return NextResponse.json({ error: "Despesa e nome são obrigatórios" }, { status: 400 });
    }

    const contas = readContas();
    
    const novaConta = {
      id: randomUUID(),
      despesaId,
      nome,
      valorEstimado: valorEstimado || null,
      diaVencimento: diaVencimento || null,
      status: status !== undefined ? status : true,
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    contas.push(novaConta);
    writeContas(contas);

    return NextResponse.json(novaConta, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}