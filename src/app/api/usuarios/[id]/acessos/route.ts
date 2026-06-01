import { authService as servico } from "@/core/users/service";
import { acessosFiltroSchema } from "@/core/users/user.dto";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(listarAcessosUsuario);

async function listarAcessosUsuario(
  requisicao: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const authUser = await getAuthUser(requisicao);
  const { id: authId, role } = authUser;
  
  const { searchParams } = new URL(requisicao.url);
  const filtroBrutos = Object.fromEntries(searchParams.entries());

  const targetId = Number(params.id);

  // Se for admin, pode usar o targetId da URL (id do usuário).
  // Se não for admin, só pode usar o seu próprio authId.
  const userId = role === "admin" ? targetId : authId;

  // Toda informação passada para o backend passa pelo parse do DTO para garantir tipagem e segurança
  const filtros = acessosFiltroSchema.parse({
    ...filtroBrutos,
    userId,
  });

  // A validação de permissão é feita de forma robusta e centralizada dentro do service
  const acessos = await servico.listarAcessosUsuario(filtros, authUser as { id: number; role: string });
  return NextResponse.json(acessos);
}
