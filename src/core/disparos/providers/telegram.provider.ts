import { NotificationProvider, SendMessageOptions } from "../types";
import axios from "axios";

/**
 * Provider de Telegram (canal gratuito e oficial via Bot API).
 * `destinatario` deve ser o chat_id do usuário (obtido no vínculo via webhook).
 * Roda na Vercel (HTTP puro). Sem token configurado, cai em modo mock.
 */
export class TelegramProvider implements NotificationProvider {
  async send(options: SendMessageOptions): Promise<{ success: boolean; error?: string }> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.log(`[Telegram MOCK] Enviando para chat_id: ${options.destinatario}`);
      console.log(`Conteúdo:\n${options.conteudo}`);
      return { success: true };
    }

    const chatId = options.destinatario?.trim();
    if (!chatId) {
      return { success: false, error: "Telegram não vinculado (chat_id ausente)." };
    }

    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          chat_id: chatId,
          text: options.conteudo,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.data?.ok) {
        return { success: true };
      }
      return { success: false, error: `Telegram respondeu sem ok: ${JSON.stringify(response.data)}` };
    } catch (err: any) {
      console.error("[Telegram Error] Falha ao enviar via Bot API:", err.message);
      return {
        success: false,
        error: err.response?.data?.description || err.message || "Erro desconhecido",
      };
    }
  }
}
