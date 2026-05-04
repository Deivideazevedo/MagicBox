"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * GuestGuard - Protege rotas de autenticação (Login, Registro).
 * Redireciona para o dashboard se o usuário já estiver autenticado.
 */
const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const isNewUser = session?.isNewUser;
      router.replace(isNewUser ? "/cadastros" : "/dashboard");
    }
  }, [status, session, router]);

  // Apenas verifica o status da sessão e redireciona no frontend.
  // A middleware já faz o bloqueio de rotas no backend/servidor.
  // Ao transitar entre páginas, o próprio Next.js exibe o loading.tsx.
  return <>{children}</>;
};

export default GuestGuard;
