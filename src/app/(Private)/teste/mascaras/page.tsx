"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";

// Importação dinâmica do conteúdo do formulário de testes das Máscaras para evitar bloat no bundle inicial
const MascarasTestContent = dynamic(
  () => import("./components/MascarasTestContent"),
  {
    loading: () => (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    ),
    ssr: false,
  }
);

export default function TesteMascarasPage() {
  return <MascarasTestContent />;
}
