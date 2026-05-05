"use client";

import React, { useState, useMemo, memo } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  alpha,
  useTheme,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  IconChartBar,
  IconTable,
  IconDownload,
  IconHistory,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { useRelatorios } from "./hooks/useRelatorios";
import { fnCompareValues } from "@/utils/functions/fnComparison";
import { pdf } from "@react-pdf/renderer";
import { RelatorioPDFTemplate } from "./components/pdf/RelatorioPDFTemplate";

// Componentes internos (Importados como Default)
import FiltrosRelatorio from "./components/FiltrosRelatorio";
import GraficoDistribuicao from "./components/GraficoDistribuicao";
import GraficoEvolucao from "./components/GraficoEvolucao";
import CardsKPI from "./components/CardsKPI";
import { CustomTable } from "./components/customTable";

// Utilidade de formatação local para garantir compilação
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function RelatoriosPage() {
  const theme = useTheme();
  const {
    data,
    loading,
    error,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    page,
    setPage,
    limit,
    setLimit,
    selectedIds,
    toggleSelection,
    selectItemForHistory,
    resumoExibido,
    historicoItem,
    loadingHistorico,
    titleHistorico,
    selectedNames,
    incluirProjecaoTabela,
    setIncluirProjecaoTabela,
  } = useRelatorios();

  const [showKPIs, setShowKPIs] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const historicoConsolidado = useMemo(() => {
    if (!historicoItem || !Array.isArray(historicoItem)) return [];

    return historicoItem
      .map((h) => ({
        ...h,
        totalPago: h.realizado,
        restante: incluirProjecaoTabela ? h.restanteComProjecao : h.restanteReal,
      }))
      .sort((a, b) => fnCompareValues(a.dataRef, b.dataRef));
  }, [historicoItem, incluirProjecaoTabela]);

  const handleExportPDF = async () => {
    if (!data?.resumo || !data?.categorias) return;
    setGerandoPdf(true);
    try {
      const blob = await pdf(
        <RelatorioPDFTemplate 
          resumo={data.resumo} 
          categorias={data.categorias} 
          dataInicio={dataInicio}
          dataFim={dataFim}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-financeiro-${dataInicio}-a-${dataFim}.pdf`;
      link.click();
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setGerandoPdf(false);
    }
  };

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Relatório Financeiro 360º
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Análise sistêmica de suas receitas, despesas e metas.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title={selectedIds.size > 0 ? `Exportar PDF (${selectedNames})` : "Exportar PDF Geral"}>
            <IconButton 
              onClick={handleExportPDF} 
              disabled={gerandoPdf}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              {gerandoPdf ? <CircularProgress size={24} /> : <IconDownload />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erro ao carregar dados do relatório. Por favor, tente novamente.
        </Alert>
      )}

      {/* Filtros */}
      <FiltrosRelatorio
        dataInicio={dataInicio}
        setDataInicio={setDataInicio}
        dataFim={dataFim}
        setDataFim={setDataFim}
      />

      <Box sx={{ mt: 3 }}>
        {/* KPI Section */}
        <Paper sx={{ mb: 3, overflow: "hidden" }}>
          <Box 
            onClick={() => setShowKPIs(!showKPIs)}
            sx={{ 
              p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconChartBar size={20} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Resumo de Indicadores
              </Typography>
            </Box>
            {showKPIs ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
          </Box>
          <Collapse in={showKPIs}>
            <Box sx={{ p: 3 }}>
              {resumoExibido && <CardsKPI resumo={resumoExibido} />}
            </Box>
          </Collapse>
        </Paper>

        {/* Charts Section */}
        <Paper sx={{ mb: 3, overflow: "hidden" }}>
          <Box 
            onClick={() => setShowCharts(!showCharts)}
            sx={{ 
              p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconTable size={20} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Distribuição e Evolução
              </Typography>
            </Box>
            {showCharts ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
          </Box>
          <Collapse in={showCharts}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {data?.categorias && <GraficoDistribuicao categorias={data.categorias} />}
                </Grid>
                <Grid item xs={12} md={6}>
                   {data?.evolucao && <GraficoEvolucao evolucao={data.evolucao} />}
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Paper>

        {/* Main Table & History Panel */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={selectedIds.size > 0 ? 8 : 12}>
            <Paper sx={{ p: 0, overflow: 'hidden' }}>
              {data?.categorias && (
                <CustomTable
                  data={data.categorias}
                  selectedIds={selectedIds}
                  onToggle={toggleSelection}
                  onSelectItem={selectItemForHistory}
                  itemSelecionadoParaHistorico={selectedIds.size === 1 ? Array.from(selectedIds)[0] : null}
                  incluirProjecao={incluirProjecaoTabela}
                  onToggleProjecao={setIncluirProjecaoTabela}
                  pagination={{
                    page: page,
                    rowsPerPage: limit,
                    count: data.totalCategorias,
                    onPageChange: (_: any, newPage: number) => setPage(newPage),
                    onRowsPerPageChange: (e: any) => setLimit(parseInt(e.target.value))
                  }}
                  isLoading={loading}
                />
              )}
            </Paper>
          </Grid>

          {/* Lateral History Panel */}
          {selectedIds.size > 0 && (
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconHistory size={20} color={theme.palette.primary.main} />
                  <Typography variant="subtitle1" fontWeight={800}>
                    Resumo: {titleHistorico}
                  </Typography>
                </Box>
                
                {loadingHistorico ? (
                  <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : (
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><Typography variant="caption" fontWeight={700}>Mês</Typography></TableCell>
                            <TableCell><Typography variant="caption" fontWeight={700}>Ano</Typography></TableCell>
                            <TableCell align="right"><Typography variant="caption" fontWeight={700}>Total Pago</Typography></TableCell>
                            <TableCell align="right"><Typography variant="caption" fontWeight={700}>Restante</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {historicoConsolidado.map((h, i) => (
                            <TableRow 
                              key={i} 
                              sx={{ 
                                "&:last-child td, &:last-child th": { border: 0 },
                                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                              }}
                            >
                              <TableCell sx={{ color: "primary.main", fontWeight: 700 }}>{h.mes}</TableCell>
                              <TableCell>{h.ano}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(h.realizado)}</TableCell>
                              <TableCell 
                                align="right" 
                                sx={{ 
                                  color: h.restante < 0 ? "error.main" : "success.main",
                                  fontWeight: 700 
                                }}
                              >
                                {formatCurrency(h.restante)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
}
