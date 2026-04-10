"use client";

import { useSession, signOut } from "next-auth/react";
import { useDispatch } from "@/store/hooks";
import { api } from "@/services/api";

/**
 * Hook centralizado de autenticação.
 * Fornece os dados da sessão atual e a função de logout com limpeza de cache.
 */
export const useAuth = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      // 1. Limpa o cache do RTK Query explicitamente
      dispatch(api.util.resetApiState());

      // 2. Realiza o signOut do NextAuth
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
      await signOut({ callbackUrl: "/" });
    }
  };

  return { 
    session, 
    status, 
    logout,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading"
  };
};
