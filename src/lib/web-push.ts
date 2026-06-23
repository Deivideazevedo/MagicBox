import webpush from "web-push";

/**
 * Configuração única (singleton) do Web Push via VAPID.
 *
 * Segue a convenção dos providers de disparo (lê `process.env`, modo no-op se
 * faltar chave): sem as chaves VAPID configuradas, `pushConfigurado` é `false`
 * e o envio é ignorado em silêncio — o app continua funcionando, só sem push.
 *
 * Chaves geradas com `npx web-push generate-vapid-keys`:
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY: pública, usada também no client para inscrever.
 * - VAPID_PRIVATE_KEY: privada, só no servidor.
 * - VAPID_SUBJECT: contato do remetente (mailto: ou URL).
 */
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:contato@magicbox.app";

export const pushConfigurado = Boolean(publicKey && privateKey);

if (pushConfigurado) {
  webpush.setVapidDetails(subject, publicKey!, privateKey!);
} else {
  console.warn(
    "[Web Push] Chaves VAPID ausentes — notificações push desativadas (modo no-op).",
  );
}

export { webpush };
