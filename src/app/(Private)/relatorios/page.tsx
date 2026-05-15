"use client";

import { fnCompareValues } from "@/utils/functions/fnComparison";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable
} from "@hello-pangea/dnd";
import {
  Alert,
  Box,
  CircularProgress,
  Collapse,
  Container,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { pdf } from "@react-pdf/renderer";
import {
  IconChartBar,
  IconChevronDown,
  IconChevronUp,
  IconDownload,
  IconGripVertical,
  IconHistory,
  IconTable,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { RelatorioPDFTemplate } from "./components/pdf/RelatorioPDFTemplate";
import { useRelatorios } from "./hooks/useRelatorios";

// Redux
import {
  setSectionsOrder,
  toggleOverview,
  toggleTable
} from "@/store/apps/relatorios/RelatoriosSlice";
import { useDispatch, useSelector } from "@/store/hooks";
import { RootState } from "@/store/store";

// Componentes internos (Importados como Default)
import CardsKPI from "./components/CardsKPI";
import { CustomTable } from "./components/customTable";
import FiltrosRelatorio from "./components/FiltrosRelatorio";
import GraficoDistribuicao from "./components/GraficoDistribuicao";
import GraficoEvolucao from "./components/GraficoEvolucao";

// Utilidade de formatação local para garantir compilação
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function RelatoriosPage() {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Redux States
  const { sectionsOrder, showOverview, showTable } = useSelector((state: RootState) => state.relatorioUi);

  // Configurações de densidade da tabela de histórico
  const histPaddingHeader = 1.8;
  const histPaddingRow = 1.4;

  const {
    data,
    loading,
    isFetching,
    error,
    dataInicio,
    dataFim,
    setPeriodo,
    selectedIds,
    toggleSelection,
    selectItemForHistory,
    resumoExibido,
    historicoItem,
    isLoadingHistorico,
    isFetchingHistorico,
    titleHistorico,
    selectedNames,
    incluirProjecaoTabela,
    setIncluirProjecaoTabela,
    tiposFiltro,
    toggleTipoFiltro,
    resetFilters,
    tiposExistentes,
  } = useRelatorios();

  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Garantir que o componente está montado para evitar erros de hidratação com DND
  useEffect(() => {
    setIsReady(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination || destination.index === source.index) return;

    const newOrder = Array.from(sectionsOrder);
    const [reorderedItem] = newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, reorderedItem);

    dispatch(setSectionsOrder(newOrder));
  };

  const historicoConsolidado = useMemo(() => {
    if (!historicoItem || !Array.isArray(historicoItem)) return [];

    return historicoItem
      .filter((h) => {
        // Quando projeções desativadas, remover meses que só existem por causa de projeção
        // (sem pagamentos reais E sem agendamentos reais)
        if (!incluirProjecaoTabela) {
          const temDadosReais = Number(h.totalPago || 0) !== 0 || Number(h.realAgendado || 0) !== 0;
          return temDadosReais;
        }
        return true;
      })
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
      link.download = `Relatorio_Financeiro_${new Date().toLocaleDateString()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
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
        dataFim={dataFim}
        setPeriodo={setPeriodo}
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
                                boxShadow: theme.shadows[9],
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                                bgcolor: sectionId === 'overview' ? alpha(theme.palette.background.paper, 0.9) : 'transparent',
                                borderRadius: 3,
                              }
                            })
                          }}
                        >
                          {sectionId === 'overview' && (
                            <Paper
                              elevation={0}
                              variant="outlined"
                              sx={{
                                overflow: "hidden",
                                borderRadius: 3,
                                borderColor: alpha(theme.palette.primary.main, 0.15),
                                bgcolor: 'background.paper',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                                  borderColor: alpha(theme.palette.primary.main, 0.25),
                                }
                              }}
                            >
                              <Box
                                {...provided.dragHandleProps} onClick={() => dispatch(toggleOverview())}
                                sx={{
                                  p: 2,
                                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  borderBottom: showOverview ? `1px solid ${alpha(theme.palette.divider, 0.08)}` : 'none',
                                  transition: 'background-color 0.2s',
                                  userSelect: 'none',
                                  cursor: 'grab',
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                                    '& .section-icon': { color: 'primary.main' },
                                    '& .section-title': { color: 'primary.main' }
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Tooltip title="Clique e arraste para reordenar esta seção" arrow>
                                    <Box
                                      className="drag-handle"
                                      sx={{
                                        display: 'flex',
                                        color: alpha(theme.palette.text.primary, 0.3),
                                        p: 0.5,
                                        borderRadius: 1,
                                        border: '1px solid transparent',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                          color: 'primary.main',
                                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                                          borderColor: alpha(theme.palette.primary.main, 0.2)
                                        }
                                      }}
                                    >
                                      <IconGripVertical size={20} />
                                    </Box>
                                  </Tooltip>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1.5,
                                      cursor: 'pointer !important'
                                    }}
                                  >
                                    <Box
                                      className="section-icon"
                                      sx={{
                                        display: 'flex',
                                        color: 'text.secondary',
                                        transition: 'color 0.2s'
                                      }}
                                    >
                                      <IconChartBar size={22} />
                                    </Box>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={800}
                                      className="section-title"
                                      sx={{
                                        textTransform: 'uppercase',
                                        letterSpacing: 1.2,
                                        color: theme.palette.text.primary,
                                        transition: 'color 0.2s'
                                      }}
                                    >
                                      Resumo e Análise de Indicadores
                                    </Typography>
                                  </Box>
                                </Box>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: 'primary.main',
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                  }}
                                >
                                  {showOverview ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                                </IconButton>
                              </Box>
                              <Collapse in={showOverview}>
                                <Box sx={{ p: 3 }}>
                                  {resumoExibido && (
                                    <Box sx={{ mb: 4 }}>
                                      <CardsKPI resumo={resumoExibido} />
                                    </Box>
                                  )}

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
                            <Box
                              sx={{
                                borderRadius: 3,
                                border: 0,
                                bgcolor: 'transparent',
                                boxShadow: 'none',
                              }}
                            >
                              <Box
                                {...provided.dragHandleProps} onClick={() => dispatch(toggleTable())}
                                sx={{
                                  p: 2,
                                  position: 'relative',
                                  bgcolor: 'background.paper',
                                  backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.primary.main, 0.02)})`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  border: "1px solid",
                                  borderColor: alpha(theme.palette.primary.main, 0.15),
                                  borderTopLeftRadius: 22,
                                  borderTopRightRadius: 22,
                                  borderBottomLeftRadius: showTable ? 4 : 22,
                                  borderBottomRightRadius: showTable ? 4 : 22,
                                  transition: 'all 0.2s',
                                  userSelect: 'none',
                                  cursor: 'grab',
                                  '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                    borderColor: alpha(theme.palette.primary.main, 0.25),
                                    backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.04)}, ${alpha(theme.palette.primary.main, 0.04)})`,
                                    '& .section-icon': { color: 'primary.main' },
                                    '& .section-title': { color: 'primary.main' }
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Tooltip title="Clique e arraste para reordenar esta seção" arrow>
                                    <Box
                                      className="drag-handle"
                                      sx={{
                                        display: 'flex',
                                        color: alpha(theme.palette.text.primary, 0.3),
                                        p: 0.5,
                                        borderRadius: 1,
                                        border: '1px solid transparent',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                          color: 'primary.main',
                                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                                          borderColor: alpha(theme.palette.primary.main, 0.2)
                                        }
                                      }}
                                    >
                                      <IconGripVertical size={20} />
                                    </Box>
                                  </Tooltip>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1.5,
                                      cursor: 'pointer !important'
                                    }}
                                  >
                                    <Box
                                      className="section-icon"
                                      sx={{
                                        display: 'flex',
                                        color: 'text.secondary',
                                        transition: 'color 0.2s'
                                      }}
                                    >
                                      <IconTable size={22} />
                                    </Box>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={800}
                                      className="section-title"
                                      sx={{
                                        textTransform: 'uppercase',
                                        letterSpacing: 1.2,
                                        color: theme.palette.text.primary,
                                        transition: 'color 0.2s'
                                      }}
                                    >
                                      Detalhamento por Categorias
                                    </Typography>
                                  </Box>
                                </Box>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: 'primary.main',
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                  }}
                                >
                                  {showTable ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                                </IconButton>
                              </Box>
                              <Collapse in={showTable} unmountOnExit>
                                <Box sx={{ pt: 2 }}>
                                  {/* <Box sx={{ p: 3 }}> */}
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} sm={selectedIds.size > 0 ? 8 : 12}>
                                      {data?.categorias && (
                                        <CustomTable
                                          data={data.categorias}
                                          selectedIds={selectedIds}
                                          onToggle={toggleSelection}
                                          onSelectItem={selectItemForHistory}
                                          itemSelecionadoParaHistorico={selectedIds.size === 1 ? Array.from(selectedIds)[0] : null}
                                          tiposFiltro={tiposFiltro}
                                          onToggleTipo={toggleTipoFiltro}
                                          onResetFilters={resetFilters}
                                          tiposExistentes={tiposExistentes}
                                          isLoading={loading}
                                          isFetching={isFetching}
                                          incluirProjecao={incluirProjecaoTabela}
                                          onToggleProjecao={setIncluirProjecaoTabela}
                                        />
                                      )}
                                    </Grid>

                                    {/* Lateral History Panel */}
                                    {selectedIds.size > 0 && (
                                      <Grid item xs={12} sm={4}>
                                        <Paper
                                          elevation={0}
                                          variant="outlined"
                                          sx={{
                                            borderRadius: 3,
                                            height: '100%',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            border: "1px solid",
                                            borderColor: alpha(theme.palette.primary.main, 0.2),
                                            bgcolor: 'background.paper',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                            '&:hover': {
                                              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                                              borderColor: alpha(theme.palette.primary.main, 0.25),
                                            }
                                          }}
                                        >
                                          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ p: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, display: 'flex', width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                              {isFetchingHistorico ? (
                                                <CircularProgress size={16} />
                                              ) : (
                                                <IconHistory size={18} color={theme.palette.primary.main} />
                                              )}
                                            </Box>
                                            <Typography variant="subtitle2" fontWeight={800}>
                                              Histórico: {titleHistorico}
                                            </Typography>
                                          </Box>

                                          {isFetchingHistorico && (
                                            <LinearProgress
                                              sx={{
                                                height: 2,
                                                // bgcolor: 'transparent',
                                                '& .MuiLinearProgress-bar': { borderRadius: 1 }
                                              }}
                                            />
                                          )}

                                          {isLoadingHistorico ? (
                                            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                                              <CircularProgress size={32} />
                                            </Box>
                                          ) : (
                                            <Box sx={{ flex: 1, overflow: 'auto' }}>
                                              <TableContainer>
                                                <Table size="small">
                                                  <TableHead>
                                                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                                      <TableCell sx={{ whiteSpace: "nowrap", py: histPaddingHeader }}><Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ whiteSpace: "nowrap" }}>REFERÊNCIA</Typography></TableCell>
                                                      <TableCell align="center" sx={{ whiteSpace: "nowrap", py: histPaddingHeader }}><Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ whiteSpace: "nowrap" }}>PREVISTO / REALIZADO</Typography></TableCell>
                                                      <TableCell align="right" sx={{ whiteSpace: "nowrap", py: histPaddingHeader }}><Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ whiteSpace: "nowrap" }}>DIFERENÇA</Typography></TableCell>
                                                    </TableRow>
                                                  </TableHead>
                                                  <TableBody>
                                                    {historicoConsolidado.map((h, i) => (
                                                      <TableRow
                                                        key={i}
                                                        sx={{
                                                          "&:last-child td, &:last-child th": { border: 0 },
                                                          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                                                        }}
                                                      >
                                                        <TableCell sx={{ color: "primary.main", fontWeight: 700, whiteSpace: "nowrap", py: histPaddingRow }}>{h.referencia}</TableCell>
                                                        <TableCell align="center" sx={{ py: histPaddingRow }}>
                                                          <Typography variant="caption" sx={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                            <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>{formatCurrency(h.previsto)}</Box>
                                                            <Box component="span" sx={{ fontWeight: 700, opacity: 0.3 }}>/</Box>
                                                            <Box component="span" sx={{ fontWeight: 700 }}>{formatCurrency(h.totalPago)}</Box>
                                                          </Typography>
                                                        </TableCell>
                                                        <TableCell
                                                          align="right"
                                                          sx={{
                                                            color: h.restante > 0 ? "success.main" : h.restante < 0 ? "error.main" : "text.secondary",
                                                            fontWeight: 800,
                                                            whiteSpace: "nowrap",
                                                            py: histPaddingRow
                                                          }}
                                                        >
                                                          {(() => {
                                                            const abs = Math.abs(h.restante);
                                                            const f = formatCurrency(abs);
                                                            if (h.restante > 0) return `+${f}`;
                                                            if (h.restante < 0) return `-${f}`;
                                                            return f;
                                                          })()}
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
                              </Collapse>
                            </Box>
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
