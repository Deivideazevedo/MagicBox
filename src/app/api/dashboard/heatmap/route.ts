import { dashboardService } from "@/core/dashboard/service";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(obterHeatmap);

async function obterHeatmap(requisicao: NextRequest): Promise<NextResponse> {
  const { id: authId, role } = await getAuthUser();
  const { searchParams } = new URL(requisicao.url);

  const filtroBrutos = Object.fromEntries(searchParams.entries());

  const userId = role === "admin" ? searchParams.get("userId") || authId : authId;

  const resultado = await dashboardService.obterHeatmap(filtroBrutos, { 
    user: { id: userId } 
  });

  return NextResponse.json(resultado);
}
