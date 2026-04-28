import { dashboardService } from "@/core/dashboard/service";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(obterPerformance);

async function obterPerformance(requisicao: NextRequest): Promise<NextResponse> {
  await getAuthUser(); // Apenas para validar sessão
  const { id: authId } = await getAuthUser();
  const { searchParams } = new URL(requisicao.url);

  const query = Object.fromEntries(searchParams.entries());

  const resultado = await dashboardService.obterPerformance(query, { 
    user: { id: authId } 
  });

  return NextResponse.json(resultado);
}
