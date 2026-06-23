// Helpers de Web Push no client: inscreve o dispositivo no push e registra a
// inscrição no backend (ou cancela). Usado pelo PromptNotificacoesPush.

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/** O navegador suporta Web Push? (precisa de SW + Push API + Notification API) */
export function pushSuportado(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Pede permissão (se necessário), inscreve o dispositivo no Push e envia a
 * inscrição ao backend. Retorna `true` se inscreveu com sucesso.
 */
export async function assinarPush(): Promise<boolean> {
  if (!pushSuportado() || !VAPID_PUBLIC_KEY) return false;

  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") return false;

  const registration = await navigator.serviceWorker.ready;

  // Reusa a inscrição existente, ou cria uma nova com a chave VAPID.
  // `applicationServerKey` aceita a chave base64url direto (Push API) — não
  // precisa converter para Uint8Array nos navegadores atuais.
  const inscricao =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    }));

  const resposta = await fetch("/api/notificacoes/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inscricao.toJSON()),
  });

  return resposta.ok;
}

/** Cancela a inscrição local e remove o registro no backend. */
export async function cancelarPush(): Promise<void> {
  if (!pushSuportado()) return;

  const registration = await navigator.serviceWorker.ready;
  const inscricao = await registration.pushManager.getSubscription();
  if (!inscricao) return;

  await fetch("/api/notificacoes/push", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: inscricao.endpoint }),
  }).catch(() => {});

  await inscricao.unsubscribe().catch(() => {});
}
