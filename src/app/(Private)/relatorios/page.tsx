"use client";
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  FormControlLabel,
  Switch,
  Stack,
  Backdrop
} from "@mui/material";
import { IconDownload } from "@tabler/icons-react";
import { useRelatorios } from "./hooks/useRelatorios";

// Components
import FiltrosRelatorio from "./components/FiltrosRelatorio";
import CardsKPI from "./components/CardsKPI";
import GraficoDistribuicao from "./components/GraficoDistribuicao";
import GraficoEvolucao from "./components/GraficoEvolucao";
import TabelaAnalise from "./components/TabelaAnalise";

export default function RelatoriosPage() {
  const {
    data,
    loading,
    error,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    selectedIds,
    toggleSelection,
    resumoExibido,
    historicoItem,
    loadingHistorico,
    fetchHistorico,
  } = useRelatorios();

  const [itemSelecionadoId, setItemSelecionadoId] = useState<number | null>(null);

  const handleSelectItem = (id: number, tipo: "RECEITA" | "DESPESA") => {
    setItemSelecionadoId(id);
    fetchHistorico(id, tipo);
  };

  const [incluirProjecao, setIncluirProjecao] = useState(true);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const handleExportPDF = async () => {
    setGerandoPdf(true);
    try {
      const element = document.getElementById("report-content");
      if (!element) return;
      
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt = {
        margin:       [10, 10, 10, 10] as [number, number, number, number],
        filename:     `Relatorio-360-${dataInicio}-a-${dataFim}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'landscape' as const }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setGerandoPdf(false);
    }
  };

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 9999, flexDirection: "column", gap: 2 }}
        open={gerandoPdf}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" fontWeight={600}>Gerando Documento Premium...</Typography>
      </Backdrop>

      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h3" gutterBottom fontWeight={800} sx={{ letterSpacing: "-0.02em" }}>
            Relatório Financeiro <Box component="span" sx={{ color: "primary.main" }}>360º</Box>
          </Typography>
          <Typography variant="h6" color="textSecondary" fontWeight={500}>
            Análise sistêmica de suas receitas, despesas e metas.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControlLabel
            control={<Switch checked={incluirProjecao} onChange={(e) => setIncluirProjecao(e.target.checked)} />}
            label={<Typography fontWeight={600} color="textSecondary">Incluir Projeções</Typography>}
          />
          <Button
            variant="contained"
            startIcon={<IconDownload size={20} />}
            onClick={handleExportPDF}
            disabled={gerandoPdf || loading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}40`
            }}
          >
            Exportar PDF
          </Button>
        </Stack>
      </Box>

      <Paper 
        className="no-print"
        elevation={0} 
        sx={{ 
          borderRadius: 4, 
          p: 0, 
          mb: 4, 
          bgcolor: "transparent"
        }}
      >
        <FiltrosRelatorio dataInicio={dataInicio} setDataInicio={setDataInicio} dataFim={dataFim} setDataFim={setDataFim} />
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <Box id="report-content" sx={{ p: gerandoPdf ? 2 : 0, bgcolor: gerandoPdf ? "background.default" : "transparent" }}>
          {/* KPIs Dinâmicos */}
          <CardsKPI resumo={resumoExibido} />

          {/* Gráficos Principais */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={7}>
              <GraficoEvolucao evolucao={data?.evolucao || []} />
            </Grid>
            <Grid item xs={12} md={5}>
              <GraficoDistribuicao categorias={data?.categorias || []} />
            </Grid>
          </Grid>

          {/* Tabela de Análise Sistêmica */}
          <TabelaAnalise 
            categorias={data?.categorias || []}
            selectedIds={selectedIds}
            onToggle={toggleSelection}
            onSelectItem={handleSelectItem}
            historicoItem={historicoItem}
            loadingHistorico={loadingHistorico}
            itemSelecionadoParaHistorico={itemSelecionadoId}
          />
        </Box>
      )}
    </Container>
  );
}