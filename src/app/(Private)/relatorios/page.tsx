"use client";

import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
} from "@mui/material";

// Components (serão criados)
import FiltrosRelatorio from "./components/FiltrosRelatorio";
import CardsKPI from "./components/CardsKPI";
import GraficoDistribuicao from "./components/GraficoDistribuicao";
import GraficoComparativo from "./components/GraficoComparativo";
import GraficoEvolucao from "./components/GraficoEvolucao";
import TabelaAnalise from "./components/TabelaAnalise";

export default function RelatoriosPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Relatórios
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Análises e insights sobre suas finanças
        </Typography>
      </Box>

      {/* Filtros Globais */}
      <Paper elevation={2} sx={{ borderRadius: 3, p: 3, mb: 3 }}>
        <FiltrosRelatorio />
      </Paper>

      {/* KPIs */}
      <CardsKPI />

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <GraficoDistribuicao />
        </Grid>
        <Grid item xs={12} md={6}>
          <GraficoComparativo />
        </Grid>
        <Grid item xs={12}>
          <GraficoEvolucao />
        </Grid>
        <Grid item xs={12}>
          <TabelaAnalise />
        </Grid>
      </Grid>
    </Container>
  );
}