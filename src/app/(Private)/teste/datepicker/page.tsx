"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";

// Importação dinâmica do conteúdo do formulário de testes do DatePicker para evitar bloat no bundle inicial
const DatePickerTestContent = dynamic(
  () => import("./components/DatePickerTestContent"),
  {
    loading: () => (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    ),
    ssr: false,
  }
);

export default function TesteDatePickerPage() {
  return <DatePickerTestContent />;
}
