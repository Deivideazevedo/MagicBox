"use client";

import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
} from "@mui/material";

// Component (será criado separadamente)
import FormularioLancamento from "./components/FormularioLancamento";

export default function LancamentosPage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Lançamentos
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Registre pagamentos e agende categorias futuras
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 3, p: 4 }}>
        <FormularioLancamento />
      </Paper>
    </Container>
  );
}