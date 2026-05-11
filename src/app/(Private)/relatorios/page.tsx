"use client";

import React, { useState, useMemo, memo, useEffect } from "react";
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
  IconGripVertical,
} from "@tabler/icons-react";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from "@hello-pangea/dnd";
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

  // Drag and Drop State
  const [sectionsOrder, setSectionsOrder] = useState<string[]>(['kpis', 'charts', 'table']);
  const [isReady, setIsReady] = useState(false);

  // Carregar ordem do localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('relatorios-sections-order');
    if (savedOrder) {
      try {
        setSectionsOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error("Erro ao carregar ordem das seções:", e);
      }
    }
    setIsReady(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newOrder = Array.from(sectionsOrder);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    setSectionsOrder(newOrder);
    localStorage.setItem('relatorios-sections-order', JSON.stringify(newOrder));
  };

  const historicoConsolidado = useMemo(() => {
    if (!historicoItem || !Array.isArray(historicoItem)) return [];

    return historicoItem
      .map((h) => ({
        ...h,
        previsto: incluirProjecaoTabela ? h.totalPrevistoComProjecao : h.totalPrevisto,
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
        {!isReady ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="relatorios-sections">
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {sectionsOrder.map((sectionId, index) => (
                    <Draggable key={sectionId} draggableId={sectionId} index={index}>
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            mb: 3,
                            ...provided.draggableProps.style,
                            ...(snapshot.isDragging && {
                              '& > div': {
                                boxShadow: theme.shadows[10],
                                border: `1px solid ${theme.palette.primary.main}`,
                              }
                            })
                          }}
                        >
                          {sectionId === 'kpis' && (
                            <Paper sx={{ overflow: "hidden" }}>
                              <Box
                                sx={{
                                  p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box {...provided.dragHandleProps} sx={{ display: 'flex', cursor: 'grab', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                    <IconGripVertical size={20} />
                                  </Box>
                                  <Box onClick={() => setShowKPIs(!showKPIs)} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                                    <IconChartBar size={20} />
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                      Resumo de Indicadores
                                    </Typography>
                                  </Box>
                                </Box>
                                <IconButton size="small" onClick={() => setShowKPIs(!showKPIs)}>
                                  {showKPIs ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                                </IconButton>
                              </Box>
                              <Collapse in={showKPIs}>
                                <Box sx={{ p: 3 }}>
                                  {resumoExibido && <CardsKPI resumo={resumoExibido} />}
                                </Box>
                              </Collapse>
                            </Paper>
                          )}

                          {sectionId === 'charts' && (
                            <Paper sx={{ overflow: "hidden" }}>
                              <Box
                                sx={{
                                  p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box {...provided.dragHandleProps} sx={{ display: 'flex', cursor: 'grab', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                    <IconGripVertical size={20} />
                                  </Box>
                                  <Box onClick={() => setShowCharts(!showCharts)} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                                    <IconTable size={20} />
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                      Distribuição e Evolução
                                    </Typography>
                                  </Box>
                                </Box>
                                <IconButton size="small" onClick={() => setShowCharts(!showCharts)}>
                                  {showCharts ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                                </IconButton>
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
                          )}

                          {sectionId === 'table' && (
                            <Grid container spacing={3}>
                              <Grid item xs={12} lg={selectedIds.size > 0 ? 8 : 12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, ml: 1 }}>
                                  <Box {...provided.dragHandleProps} sx={{ display: 'flex', cursor: 'grab', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                    <IconGripVertical size={20} />
                                  </Box>
                                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                    Tabela Principal (Arraste para mover a seção)
                                  </Typography>
                                </Box>
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
                                                <TableCell><Typography variant="caption" fontWeight={700}>Referência</Typography></TableCell>
                                                <TableCell align="right"><Typography variant="caption" fontWeight={700}>Previsto</Typography></TableCell>
                                                <TableCell align="right"><Typography variant="caption" fontWeight={700}>Pago</Typography></TableCell>
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
                                                  <TableCell sx={{ color: "primary.main", fontWeight: 700 }}>{h.referencia}</TableCell>
                                                  <TableCell align="right" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                                    {formatCurrency(h.previsto)}
                                                  </TableCell>
                                                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(h.totalPago)}</TableCell>
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
                          )}
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Box>
    </Container>
  );
}
