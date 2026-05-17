"use client";

import LancamentoDrawer from "@/app/(Private)/lancamentos/components/LancamentoDrawer";
import { useSession } from "next-auth/react";

export default function GlobalLancamentoButton() {
  const { data: session } = useSession();

  // Só mostra o botão se o usuário estiver logado
  if (!session) {
    return null;
  }

  return <LancamentoDrawer />;
}
