// Gera o deep link para o usuário vincular o Telegram (o webhook captura o chat_id).
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { notificacoesService } from "@/core/notificacoes/service";
import { NextRequest, NextResponse } from "next/server";

export const POST = errorHandler(async (req: NextRequest) => {
  const authUser = await getAuthUser(req);
  const resultado = await notificacoesService.gerarLinkTelegram(authUser.userId);
  return NextResponse.json(resultado);
});

// Remove o vínculo do Telegram do usuário logado (apaga chatId e desativa o canal).
export const DELETE = errorHandler(async (req: NextRequest) => {
  const authUser = await getAuthUser(req);
  await notificacoesService.desvincularTelegram(authUser.userId);
  return NextResponse.json({ success: true });
});
