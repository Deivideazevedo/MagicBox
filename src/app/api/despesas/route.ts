import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { despesaService } from "@/services/despesaService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const despesas = await despesaService.getDespesasByUserId(session.user.id);
    
    return NextResponse.json(despesas);
  } catch (error) {
    console.error("Erro ao buscar despesas:", error);
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
    
    // Validação dos dados
    const validation = despesaService.validateDespesaData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.errors }, 
        { status: 400 }
      );
    }

    const novaDespesa = await despesaService.createDespesa(session.user.id, body);
    
    return NextResponse.json(novaDespesa, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}