import { useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRegistrarAtividadeMutation } from "@/services/endpoints/usuariosApi";
import { usePathname } from "next/navigation";

const THROTTLE_INTERVAL = 2 * 60 * 1000; // 2 minutos em milissegundos

/**
 * useUserHeartbeat - Hook econômico de presença
 *
 * Registra a atividade (lastActive) do usuário logado no banco de dados via POST.
 * Dispara nos seguintes eventos:
 *   - Ao montar (primeiro acesso / login)
 *   - Ao trocar de rota (navegação interna do Next.js)
 *   - Ao ganhar foco na janela (visibilitychange → visible)
 *   - Ao reconectar com a internet (online)
 *
 * Para evitar sobrecarga, aplica um throttle de 2 minutos em memória (useRef).
 * A referência é isolada por aba/dispositivo do navegador.
 */
export const useUserHeartbeat = () => {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [registrarAtividade] = useRegistrarAtividadeMutation();
  const pathname = usePathname();

  // Timestamp da última chamada enviada com sucesso (isolado por aba)
  const lastSentRef = useRef<number>(0);

  const enviarPulso = useCallback(async () => {
    const agora = Date.now();

    // Respeita o intervalo mínimo de 2 minutos entre chamadas
    if (agora - lastSentRef.current < THROTTLE_INTERVAL) return;

    try {
      lastSentRef.current = agora;
      await registrarAtividade().unwrap();
    } catch (error) {
      // Reseta o timestamp para permitir nova tentativa na próxima oportunidade
      lastSentRef.current = 0;
      console.error("[Heartbeat] Erro ao registrar atividade:", error);
    }
  }, [registrarAtividade]);

  // Dispara na montagem inicial e ao ganhar foco / reconectar
  useEffect(() => {
    if (!isAuthenticated) return;

    // Ping inicial ao montar o componente (login / primeiro acesso)
    enviarPulso();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") enviarPulso();
    };
    const handleOnline = () => enviarPulso();
    const handleFocus = () => enviarPulso();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", handleOnline);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthenticated, enviarPulso]);

  // Dispara ao navegar entre rotas internas do Next.js
  useEffect(() => {
    if (!isAuthenticated) return;
    enviarPulso();
  }, [pathname, isAuthenticated, enviarPulso]);
};
