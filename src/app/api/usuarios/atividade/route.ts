import { authService as servico } from "@/core/users/service";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = errorHandler(registrarAtividade);

async function registrarAtividade(requisicao: NextRequest): Promise<NextResponse> {
  const authUser = await getAuthUser(requisicao);
  await servico.atualizarAtividadeUsuario(authUser.userId);
  return NextResponse.json({ success: true });
}
