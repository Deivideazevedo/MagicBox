"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useDispatch } from "@/store/hooks";
import { api } from "@/services/api";
import { persistor } from "@/store/store";
import { useRouter } from "next/navigation";
import { useRegistrarLogoutMutation } from "@/services/endpoints/usuariosApi";

/**
 * Hook centralizado de autenticação.
 * Fornece os dados da sessão atual e a função de logout com limpeza de cache.
 */
export const useAuth = () => {
  const { data: session, status } = useSession();
  const [registrarLogout] = useRegistrarLogoutMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  // A MÁGICA AQUI: Limpa o cache sempre que a aplicação estiver em estado "deslogado".
  // Evita o 401 ao sair, pois só limpa DEPOIS que já saiu, e protege contra vazamento de dados.
  useEffect(() => {
    if (status === "unauthenticated") {
      dispatch(api.util.resetApiState());
      persistor.flush(); // Salva o vazio no disco sem apagar o customizer
    }
  }, [status, dispatch]);

  const logout = async () => {
    try {
      // Registra a auditoria de logout no Neon DB em segundo plano antes do signOut
      await registrarLogout()
        .unwrap()
        .catch((err: Error) =>
          console.error("Erro ao registrar auditoria de logout:", err),
        );
    } finally {
      // Desloga o usuário limpando a sessão no cliente e redirecionando
      signOut({ callbackUrl: "/" });
    }
  };

  return {
    session,
    status,
    logout,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
};
