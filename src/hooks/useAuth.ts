"use client";

import { useSession, signOut } from "next-auth/react";
import { useDispatch } from "@/store/hooks";
import { api } from "@/services/api";
import { persistor } from "@/store/store";
import { useRouter } from "next/navigation";

/**
 * Hook centralizado de autenticação.
 * Fornece os dados da sessão atual e a função de logout com limpeza de cache.
 */
export const useAuth = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
      router.replace("/");
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

