import { resumoFiltrosSchema } from "@/core/lancamentos/resumo/resumo.dto";
import { resumoServico as servico } from "@/core/lancamentos/resumo/service";
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

  const filtros = resumoFiltrosSchema.parse({
    ...filtroBrutos,
    userId: Number(userId),
  });

  const resultado = await servico.obterCardResumo(filtros);

  // Sempre retorna resposta paginada
  return NextResponse.json(resultado);
}
