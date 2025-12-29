"use client";

// export const dynamic = 'force-dynamic';

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
} from "@mui/material";

// Components
import FiltroExtrato from "./components/FiltroExtrato";
import TabelaExtrato from "./components/TabelaExtrato";

export default function ExtratoPage() {
  const [filtros, setFiltros] = useState<any>(null);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Extrato
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Visualize e gerencie todos os seus lançamentos
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 3, p: 3 }}>
        <FiltroExtrato onFiltrosChange={setFiltros} />
        <TabelaExtrato filtros={filtros} />
      </Paper>
    </Container>
  );
}