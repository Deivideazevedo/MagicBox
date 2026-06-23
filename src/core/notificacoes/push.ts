import { pushConfigurado, webpush } from "@/lib/web-push";
import { notificacoesRepository } from "./repository";

/** Conteúdo entregue ao service worker (public/sw.js, handler `push`). */
export interface PayloadPush {
  titulo: string;
  mensagem: string;
  link?: string | null;
  /** Total de não lidas — vira o número do badge no ícone do app. */
  naoLidas: number;
}

/**
 * Envia um Web Push para todas as inscrições (dispositivos) do usuário.
 *
 * "Best effort": nunca lança para fora — falha de push não pode quebrar a
 * criação da notificação in-app. Inscrições mortas (404/410) são removidas
 * automaticamente para não acumular lixo no banco.
 */
export async function enviarPushParaUsuario(
  userId: number,
  payload: PayloadPush,
): Promise<void> {
  if (!pushConfigurado) return;

  try {
    const inscricoes =
      await notificacoesRepository.listarInscricoesDoUsuario(userId);
    if (inscricoes.length === 0) return;

    const corpo = JSON.stringify(payload);

    await Promise.all(
      inscricoes.map(async (inscricao) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: inscricao.endpoint,
              keys: { p256dh: inscricao.p256dh, auth: inscricao.auth },
            },
            corpo,
          );
        } catch (err) {
          const statusCode = (err as { statusCode?: number }).statusCode;
          // 404/410: inscrição expirou ou foi revogada no navegador → remove.
          if (statusCode === 404 || statusCode === 410) {
            await notificacoesRepository.removerInscricao(inscricao.endpoint);
          } else {
            console.error(
              `[Web Push] Falha ao enviar para userId=${userId}:`,
              (err as Error).message,
            );
          }
        }
      }),
    );
  } catch (err) {
    console.error(
      "[Web Push] Erro inesperado ao processar envio:",
      (err as Error).message,
    );
  }
}
