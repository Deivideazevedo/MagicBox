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

/**
 * GET /api/lancamentos
 * Busca lançamentos com filtros opcionais
 * Query params: dataInicio, dataFim, despesaId, contaId, receitaId, fonteRendaId, tipo, status
 */
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
    const receitaId = searchParams.get("receitaId");
    const fonteRendaId = searchParams.get("fonteRendaId");
    const tipo = searchParams.get("tipo");
    const status = searchParams.get("status");

    const lancamentos = readLancamentos();
    let userLancamentos = lancamentos.filter((lancamento: any) => lancamento.userId === session.user.id);
    
    // Aplicar filtros
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
    
    if (receitaId) {
      userLancamentos = userLancamentos.filter((lancamento: any) => lancamento.receitaId === receitaId);
    }
    
    if (fonteRendaId) {
      userLancamentos = userLancamentos.filter((lancamento: any) => lancamento.fonteRendaId === fonteRendaId);
    }
    
    if (tipo && tipo !== "todos") {
      userLancamentos = userLancamentos.filter((lancamento: any) => lancamento.tipo === tipo);
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

/**
 * POST /api/lancamentos
 * Cria um ou mais lançamentos (suporta parcelamento)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tipo, despesaId, contaId, receitaId, fonteRendaId, valor, data, descricao, parcelas } = body;

    // Validação: deve ter ou (despesaId + contaId) ou (receitaId + fonteRendaId)
    const temDespesa = despesaId && contaId;
    const temReceita = receitaId && fonteRendaId;
    
    if (!temDespesa && !temReceita) {
      return NextResponse.json({ 
        error: "Informe despesa e conta OU receita e fonte de renda" 
      }, { status: 400 });
    }
    
    if (temDespesa && temReceita) {
      return NextResponse.json({ 
        error: "Informe apenas despesa/conta OU receita/fonte de renda, não ambos" 
      }, { status: 400 });
    }

    if (!valor || !data) {
      return NextResponse.json({ 
        error: "Valor e data são obrigatórios" 
      }, { status: 400 });
    }

    const lancamentos = readLancamentos();
    const novosLancamentos: any[] = [];
    
    if (tipo === "pagamento" || tipo === "receita") {
      // Criar um único lançamento
      const novoLancamento: any = {
        id: randomUUID(),
        tipo,
        valor,
        data,
        descricao: descricao || null,
        parcelas: null,
        valorPago: valor, // Para pagamentos e receitas, considera-se já efetivado
        status: "pago", // Unifica status para ambos os tipos
        userId: session.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Adicionar campos específicos baseado no tipo
      if (tipo === "pagamento") {
        novoLancamento.despesaId = despesaId;
        novoLancamento.contaId = contaId;
      } else {
        novoLancamento.receitaId = receitaId;
        novoLancamento.fonteRendaId = fonteRendaId;
      }
      
      novosLancamentos.push(novoLancamento);
      
    } else if (tipo === "agendamento") {
      // Agendamentos só são válidos para categorias/contas
      if (!temDespesa) {
        return NextResponse.json({ 
          error: "Agendamentos só são válidos para categorias/contas" 
        }, { status: 400 });
      }
      
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