"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard - Protege rotas que exigem autenticação.
 * Redireciona para o login se o usuário não estiver autenticado.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Codifica a URL atual para redirecionar de volta após o login
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/auth/login?callbackUrl=${callbackUrl}`);
    } else if (status === "authenticated" && session?.isNewUser) {
      if (pathname !== "/cadastros") {
        router.replace("/cadastros");
      } else {
        // Se já chegou em /cadastros, "consome" a flag para não redirecionar mais
        update({ isNewUser: false });
      }
    }
  }, [status, session, router, pathname, update]);

  // Apenas verifica o status da sessão e redireciona no frontend.
  // A middleware já faz o bloqueio de rotas no backend/servidor.
  // Ao transitar entre páginas, o próprio Next.js exibe o loading.tsx.
  return <>{children}</>;
};

export default AuthGuard;
