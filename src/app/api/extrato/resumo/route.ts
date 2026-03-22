import { extratoResumoFiltrosSchema } from "@/core/lancamentos/extrato/extrato.dto";
import { extratoService as servico } from "@/core/lancamentos/extrato/service";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(listarTodos);

async function listarTodos(requisicao: NextRequest): Promise<NextResponse> {
  const { id: authId, role } = await getAuthUser();
  const { searchParams } = new URL(requisicao.url);

  const filtroBrutos = Object.fromEntries(searchParams.entries());

  const userId =
    role === "admin" ? searchParams.get("userId") || authId : authId;

  const filtros = extratoResumoFiltrosSchema.parse({
    ...filtroBrutos,
    userId: Number(userId),
  });

  const resultado = await servico.obterResumo(filtros);

  // Sempre retorna resposta paginada
  return NextResponse.json(resultado);
}
