"use client";

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

  const logout = async () => {
    try {
      // Registra a auditoria de logout no Neon DB em segundo plano antes do signOut
      await registrarLogout().unwrap().catch((err: Error) =>
        console.error("Erro ao registrar auditoria de logout:", err)
      );
    } finally {
      // Desloga o usuário limpando a sessão no cliente e redirecionando
      signOut({ callbackUrl: "/" });
    }

    setTimeout(() => {
      dispatch(api.util.resetApiState());
      persistor.flush();
    }, 100);
  };


  return {
    session,
    status,
    logout,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading"
  };
};

