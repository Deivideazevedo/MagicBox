"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Codifica a rota atual (caminho + query string) para voltar exatamente
      // para onde o usuário estava — preservando filtros como ?ano=2026.
      const queryString = searchParams.toString();
      const destino = queryString ? `${pathname}?${queryString}` : pathname;
      const callbackUrl = encodeURIComponent(destino);
      router.replace(`/auth/login?callbackUrl=${callbackUrl}`);
    } else if (status === "authenticated" && session?.isNewUser) {
      if (pathname !== "/cadastros") {
        router.replace("/cadastros");
      } else {
        // Se já chegou em /cadastros, "consome" a flag para não redirecionar mais
        update({ isNewUser: false });
      }
    }
  }, [status, session, router, pathname, searchParams, update]);

  // Apenas verifica o status da sessão e redireciona no frontend.
  // A middleware já faz o bloqueio de rotas no backend/servidor.
  // Ao transitar entre páginas, o próprio Next.js exibe o loading.tsx.
  return <>{children}</>;
};

export default AuthGuard;
