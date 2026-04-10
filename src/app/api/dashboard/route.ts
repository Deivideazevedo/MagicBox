import { dashboardService } from "@/core/dashboard/service";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(obterDashboard);

async function obterDashboard(requisicao: NextRequest): Promise<NextResponse> {
  const { id: authId, role } = await getAuthUser();
  const { searchParams } = new URL(requisicao.url);

  const filtroBrutos = Object.fromEntries(searchParams.entries());

  // Se for admin, pode usar userId do filtro caso exista
  // Se não for admin, só pode usar o próprio userId
  const userId = role === "admin" ? searchParams.get("userId") || authId : authId;

  // Usa o serviço passando o filtro bruto e a "sessão" simulada
  const resultado = await dashboardService.obterDashboard(filtroBrutos, { 
    user: { id: userId } 
  });

  return NextResponse.json(resultado);
}
