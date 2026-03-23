import { resumoTodosFiltrosSchema } from "@/core/lancamentos/resumo/resumo.dto";
import { resumoServico as servico } from "@/core/lancamentos/resumo/service";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(listarTodos);

async function listarTodos(requisicao: NextRequest): Promise<NextResponse> {
  const { id: authId, role } = await getAuthUser();
  const { searchParams } = new URL(requisicao.url);

  const filtroBrutos = Object.fromEntries(searchParams.entries());

  // Se for admin, pode usar userId do filtro caso exista
  // Se não for admin, só pode usar o próprio userId
  const userId =
    role === "admin" ? searchParams.get("userId") || authId : authId;

  const filtros = resumoTodosFiltrosSchema.parse({
    ...filtroBrutos,
    userId: Number(userId),
  });

  const resultado = await servico.listarTodos(filtros);

  // Sempre retorna resposta paginada
  return NextResponse.json(resultado);
}
