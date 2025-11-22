import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

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

/**
 * GET /api/despesas?categoriaId=xxx (opcional)
 * Busca todas as despesas do usuário autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get("categoriaId");

    const despesas = readDespesas();
    let userDespesas = despesas.filter((desp: any) => desp.userId === session.user.id);
    
    if (categoriaId) {
      userDespesas = userDespesas.filter((desp: any) => desp.categoriaId === categoriaId);
    }
    
    return NextResponse.json(userDespesas);
  } catch (error) {
    console.error("Erro ao buscar despesas:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/despesas
 * Cria uma nova despesa
 * Body: { categoriaId, nome, valorEstimado?, diaVencimento?, status? }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { categoriaId, nome, valorEstimado, diaVencimento, status } = body;

    if (!categoriaId || !nome) {
      return NextResponse.json({ error: "Categoria e nome são obrigatórios" }, { status: 400 });
    }

    const despesas = readDespesas();
    
    const novaDespesa = {
      id: randomUUID(),
      categoriaId,
      nome,
      valorEstimado: valorEstimado || null,
      diaVencimento: diaVencimento || null,
      status: status !== undefined ? status : true,
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    despesas.push(novaDespesa);
    writeDespesas(despesas);

    return NextResponse.json(novaDespesa, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}