// Marca todas as notificações in-app do usuário logado como lidas.
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { notificacoesService } from "@/core/notificacoes/service";
import { NextRequest, NextResponse } from "next/server";

export const POST = errorHandler(async (req: NextRequest) => {
  const authUser = await getAuthUser(req);
  await notificacoesService.marcarTodasLidas(authUser.userId);
  return NextResponse.json({ success: true });
});
