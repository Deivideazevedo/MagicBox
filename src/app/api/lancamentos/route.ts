import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { addMonths, format } from "date-fns";

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const despesaId = searchParams.get("despesaId");
    const contaId = searchParams.get("contaId");
    const status = searchParams.get("status");

    const lancamentos = readLancamentos();
    let userLancamentos = lancamentos.filter((lancamento: any) => lancamento.userId === session.user.id);
    
    // Filtros
    if (dataInicio && dataFim) {
      userLancamentos = userLancamentos.filter((lancamento: any) => {
        const dataLancamento = new Date(lancamento.data);
        return dataLancamento >= new Date(dataInicio) && dataLancamento <= new Date(dataFim);
      });
    }
    
    if (despesaId) {
      userLancamentos = userLancamentos.filter((lancamento: any) => lancamento.despesaId === despesaId);
    }
    
    if (contaId) {
      userLancamentos = userLancamentos.filter((lancamento: any) => lancamento.contaId === contaId);
    }
    
    if (status && status !== "todos") {
      userLancamentos = userLancamentos.filter((lancamento: any) => lancamento.status === status);
    }
    
    return NextResponse.json(userLancamentos);
  } catch (error) {
    console.error("Erro ao buscar lançamentos:", error);
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
    const { tipo, despesaId, contaId, valor, data, descricao, parcelas } = body;

    if (!despesaId || !contaId || !valor || !data) {
      return NextResponse.json({ 
        error: "Despesa, conta, valor e data são obrigatórios" 
      }, { status: 400 });
    }

    const lancamentos = readLancamentos();
    const novosLancamentos: any[] = [];
    
    if (tipo === "pagamento") {
      // Criar um único lançamento
      const novoLancamento = {
        id: randomUUID(),
        despesaId,
        contaId,
        tipo,
        valor,
        data,
        descricao: descricao || null,
        parcelas: null,
        valorPago: valor, // Para pagamentos, considera-se já pago
        status: "pago",
        userId: session.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      novosLancamentos.push(novoLancamento);
      
    } else if (tipo === "agendamento") {
      // Criar múltiplos lançamentos (um para cada parcela)
      if (!parcelas || parcelas < 1) {
        return NextResponse.json({ 
          error: "Número de parcelas é obrigatório para agendamentos" 
        }, { status: 400 });
      }
      
      const dataBase = new Date(data);
      
      for (let i = 0; i < parcelas; i++) {
        const dataLancamento = addMonths(dataBase, i);
        
        const novoLancamento = {
          id: randomUUID(),
          despesaId,
          contaId,
          tipo,
          valor,
          data: format(dataLancamento, "yyyy-MM-dd"),
          descricao: descricao || null,
          parcelas,
          valorPago: null,
          status: "pendente",
          userId: session.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        novosLancamentos.push(novoLancamento);
      }
    }

    lancamentos.push(...novosLancamentos);
    writeLancamentos(lancamentos);

    return NextResponse.json(novosLancamentos, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar lançamento:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}