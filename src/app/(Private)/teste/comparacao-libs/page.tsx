"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";

// Importação dinâmica do conteúdo de comparação de libs de testes para evitar bloat no bundle inicial
const ComparacaoLibsTestContent = dynamic(
  () => import("./components/ComparacaoLibsTestContent"),
  {
    loading: () => (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    ),
    ssr: false,
  }
);

export default function ComparacaoLibsPage() {
  return <ComparacaoLibsTestContent />;
}
