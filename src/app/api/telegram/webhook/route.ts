// Webhook do bot do Telegram (Vercel-friendly). O Telegram faz POST aqui a cada update.
// Trata o comando "/start <token>" do fluxo de vínculo: associa o chat_id à preferência.
//
// Setup (uma vez), apontando o webhook para esta rota com um secret:
//   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://SEU_DOMINIO/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
import { errorHandler } from "@/lib/error-handler";
import { notificacoesService } from "@/core/notificacoes/service";
import { TelegramProvider } from "@/core/disparos/providers/telegram.provider";
import { NextRequest, NextResponse } from "next/server";

const telegramProvider = new TelegramProvider();

export const POST = errorHandler(async (req: NextRequest) => {
  // Valida o secret enviado pelo Telegram (configurado no setWebhook).
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (
    process.env.TELEGRAM_WEBHOOK_SECRET &&
    secret !== process.env.TELEGRAM_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await req.json().catch(() => null);
  const msg = update?.message;
  const text: string = msg?.text ?? "";
  const chatId = msg?.chat?.id;

  if (chatId && text.startsWith("/start")) {
    const token = text.split(/\s+/)[1]?.trim();
    if (token) {
      const pref = await notificacoesService.vincularTelegram(token, String(chatId));
      const resposta = pref
        ? "✅ Telegram conectado ao MagicBox! Você passará a receber alertas por aqui."
        : "⚠️ Link de vínculo inválido ou expirado. Gere um novo no seu perfil do MagicBox.";
      await telegramProvider.send({ destinatario: String(chatId), conteudo: resposta });
    }
  }

  // O Telegram espera sempre 200 para não reenviar o update.
  return NextResponse.json({ ok: true });
});
