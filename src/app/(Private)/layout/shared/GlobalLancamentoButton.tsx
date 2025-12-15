"use client";

import { useState } from "react";
import { Fab, Tooltip } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import LancamentoDrawer from "@/app/(Private)/lancamentos/components/LancamentoDrawer";

export default function GlobalLancamentoButton() {
  const { data: session } = useSession();

  // Só mostra o botão se o usuário estiver logado
  if (!session) {
    return null;
  }

  return <LancamentoDrawer />;
}
