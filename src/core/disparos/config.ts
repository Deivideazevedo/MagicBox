import { CanalEnvio } from "./types";

/**
 * Indica se um canal tem credenciais (.env) configuradas para envio REAL.
 *
 * Usado pelo motor de disparos para PULAR (status BARRADO) os canais sem
 * configuração em vez de enviar mensagens mocadas/falsas em produção. Assim,
 * um canal não configurado nunca conta como "ENVIADO" nem como "FALHOU" —
 * ele é simplesmente ignorado e fica auditável no log do destinatário.
 *
 * `IN_APP` não depende de env (grava direto no banco) e está sempre disponível.
 */
export function canalConfigurado(canal: CanalEnvio): boolean {
  switch (canal) {
    case "IN_APP":
      return true;
    case "EMAIL":
      return Boolean(
        (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
          process.env.RESEND_API_KEY,
      );
    case "TELEGRAM":
      return Boolean(process.env.TELEGRAM_BOT_TOKEN);
    case "SMS":
      return Boolean(process.env.COMTELE_API_KEY);
    case "WHATSAPP":
      return Boolean(
        process.env.WHATSAPP_TOKEN &&
          process.env.WHATSAPP_PHONE_NUMBER_ID &&
          process.env.WHATSAPP_TEMPLATE_NAME,
      );
    default:
      return false;
  }
}
