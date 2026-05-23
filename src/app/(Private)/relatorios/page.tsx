"use client";

import { fnCompareValues } from "@/utils/functions/fnComparison";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  Collapse,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Switch,
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
import {
  IconBolt,
  IconChartBar,
  IconChevronDown,
  IconChevronUp,
  IconGripVertical,
  IconHistory,
  IconTable,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useRelatorios } from "./hooks/useRelatorios";

// Redux
import {
  setSectionsOrder,
  toggleOverview,
  toggleTable,
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
  const { sectionsOrder, showOverview, showTable } = useSelector(
    (state: RootState) => state.relatorioUi,
  );

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
    evolucaoAnual,
    isLoadingEvolucao,
    anoReferencia,
    isTodoDespesa,
    isTodoReceita,
    isTodoMeta,
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
          const temDadosReais =
            Number(h.totalPago || 0) !== 0 || Number(h.realAgendado || 0) !== 0;
          return temDadosReais;
        }
        return true;
      })
      .map((h) => ({
        ...h,
        previsto: incluirProjecaoTabela
          ? h.totalPrevistoComProjecao
          : h.totalPrevisto,
        restante: incluirProjecaoTabela
          ? h.restanteComProjecao
          : h.restanteReal,
      }))
      .sort((a, b) => fnCompareValues(a.dataRef, b.dataRef));
  }, [historicoItem, incluirProjecaoTabela]);

  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [lastSelectedMonth, setLastSelectedMonth] = useState<string | null>(
    null,
  );

  const handleSelectAllMonths = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.checked) {
      setSelectedMonths(historicoConsolidado.map((h) => h.dataRef));
    } else {
      setSelectedMonths([]);
    }
    setLastSelectedMonth(null);
  };

  const handleSelectMonth = (dataRef: string, event?: React.MouseEvent) => {
    setSelectedMonths((prev) => {
      const targetExists = prev.includes(dataRef);
      const isSelecting = !targetExists;

      if (event?.shiftKey && lastSelectedMonth) {
        const listRefs = historicoConsolidado.map((h) => h.dataRef);
        const lastIdx = listRefs.indexOf(lastSelectedMonth);
        const currentIdx = listRefs.indexOf(dataRef);

        if (lastIdx !== -1 && currentIdx !== -1) {
          const start = Math.min(lastIdx, currentIdx);
          const end = Math.max(lastIdx, currentIdx);
          const intervalRefs = listRefs.slice(start, end + 1);

          let newSelection = [...prev];
          if (isSelecting) {
            intervalRefs.forEach((ref) => {
              if (!newSelection.includes(ref)) {
                newSelection.push(ref);
              }
            });
          } else {
            newSelection = newSelection.filter(
              (ref) => !intervalRefs.includes(ref),
            );
          }
          setLastSelectedMonth(dataRef);
          return newSelection;
        }
      }

      setLastSelectedMonth(dataRef);
      return targetExists
        ? prev.filter((ref) => ref !== dataRef)
        : [...prev, dataRef];
    });
  };

  const totalizadoresHistorico = useMemo(() => {
    const mesesSelecionados = historicoConsolidado.filter((h) =>
      selectedMonths.includes(h.dataRef),
    );

    const sumPrevisto = mesesSelecionados.reduce(
      (acc, h) => acc + h.previsto,
      0,
    );
    const sumRealizado = mesesSelecionados.reduce(
      (acc, h) => acc + h.totalPago,
      0,
    );
    const sumDiferenca = mesesSelecionados.reduce(
      (acc, h) => acc + h.restante,
      0,
    );

    let labelPrevisto = "Previsto";
    let labelRealizado = "Realizado";
    let labelDiferenca = "Líquido";

    let colorDiferenca = "text.secondary";
    if (sumDiferenca > 0) colorDiferenca = "success.main";
    else if (sumDiferenca < 0) colorDiferenca = "error.main";

    if (isTodoDespesa) {
      labelPrevisto = "Previsto";
      labelRealizado = "Pago";
      labelDiferenca = sumDiferenca >= 0 ? "Economia" : "Diferença";
    } else if (isTodoReceita) {
      labelPrevisto = "A Receber";
      labelRealizado = "Recebido";
      labelDiferenca = sumDiferenca >= 0 ? "Excesso" : "Restante";
    } else {
      // Misto
      if (sumDiferenca > 0) {
        labelDiferenca = "Superávit";
      } else if (sumDiferenca < 0) {
        labelDiferenca = "Déficit";
      }
    }

    return {
      sumPrevisto,
      sumRealizado,
      sumDiferenca,
      labelPrevisto,
      labelRealizado,
      labelDiferenca,
      colorDiferenca,
    };
  }, [historicoConsolidado, selectedMonths, isTodoDespesa, isTodoReceita]);

  const handleExportPDF = async () => {
    setGerandoPdf(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { RelatorioPDFTemplate } =
        await import("./components/pdf/RelatorioPDFTemplate");

      const blob = await pdf(
        <RelatorioPDFTemplate
          dataInicio={dataInicio}
          dataFim={dataFim}
          resumo={resumoExibido!}
          categorias={data?.categorias || []}
        />,
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth={"xl"}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Relatório Financeiro 360º
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Análise sistêmica de suas receitas, despesas e metas.
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={incluirProjecaoTabela}
              onChange={(e) => setIncluirProjecaoTabela(e.target.checked)}
              color="warning"
            />
          }
          label={
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconBolt
                size={20}
                color={
                  incluirProjecaoTabela
                    ? theme.palette.warning.main
                    : theme.palette.text.secondary
                }
              />
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  whiteSpace: "nowrap",
                  color: incluirProjecaoTabela
                    ? theme.palette.warning.main
                    : theme.palette.text.secondary,
                }}
              >
                Projeções
              </Typography>
            </Stack>
          }
          labelPlacement="start"
          sx={{
            ml: 0,
            mr: 0,
            gap: 1,
            "& .MuiFormControlLabel-label": {
              display: "flex",
              alignItems: "center",
            },
          }}
        />
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
        onExportPDF={handleExportPDF}
        isExporting={gerandoPdf}
        exportTooltip={
          selectedIds.size > 0
            ? `Exportar PDF (${selectedNames})`
            : "Exportar PDF Geral"
        }
      />

      <Box sx={{ mt: 3 }}>
        {!isReady ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="relatorios-sections">
              {(provided) => (
                <Box {...provided.droppableProps} ref={provided.innerRef}>
                  {sectionsOrder.map((sectionId, index) => (
                    <Draggable
                      key={sectionId}
                      draggableId={sectionId}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            mb: 3,
                            ...provided.draggableProps.style,
                            ...(snapshot.isDragging && {
                              "& > div": {
                                boxShadow: theme.shadows[9],
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                                bgcolor:
                                  sectionId === "overview"
                                    ? alpha(theme.palette.background.paper, 0.9)
                                    : "transparent",
                                borderRadius: 3,
                              },
                            }),
                          }}
                        >
                          {sectionId === "overview" && (
                            <Paper
                              elevation={0}
                              variant="outlined"
                              sx={{
                                overflow: "hidden",
                                borderRadius: 3,
                                borderColor: alpha(
                                  theme.palette.primary.main,
                                  0.15,
                                ),
                                bgcolor: "background.paper",
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                "&:hover": {
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                                  borderColor: alpha(
                                    theme.palette.primary.main,
                                    0.25,
                                  ),
                                },
                              }}
                            >
                              <Box
                                {...provided.dragHandleProps}
                                onClick={() => dispatch(toggleOverview())}
                                sx={{
                                  p: 2,
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.02,
                                  ),
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  borderBottom: showOverview
                                    ? `1px solid ${alpha(theme.palette.divider, 0.08)}`
                                    : "none",
                                  transition: "background-color 0.2s",
                                  userSelect: "none",
                                  cursor: "grab",
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.04,
                                    ),
                                    "& .section-icon": {
                                      color: "primary.main",
                                    },
                                    "& .section-title": {
                                      color: "primary.main",
                                    },
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                  }}
                                >
                                  <Tooltip
                                    title="Clique e arraste para reordenar esta seção"
                                    arrow
                                  >
                                    <Box
                                      className="drag-handle"
                                      sx={{
                                        display: "flex",
                                        color: alpha(
                                          theme.palette.text.primary,
                                          0.3,
                                        ),
                                        p: 0.5,
                                        borderRadius: 1,
                                        border: "1px solid transparent",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                          color: "primary.main",
                                          bgcolor: alpha(
                                            theme.palette.primary.main,
                                            0.08,
                                          ),
                                          borderColor: alpha(
                                            theme.palette.primary.main,
                                            0.2,
                                          ),
                                        },
                                      }}
                                    >
                                      <IconGripVertical size={20} />
                                    </Box>
                                  </Tooltip>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1.5,
                                      cursor: "pointer !important",
                                    }}
                                  >
                                    <Box
                                      className="section-icon"
                                      sx={{
                                        display: "flex",
                                        color: "text.secondary",
                                        transition: "color 0.2s",
                                      }}
                                    >
                                      <IconChartBar size={22} />
                                    </Box>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={800}
                                      className="section-title"
                                      sx={{
                                        textTransform: "uppercase",
                                        letterSpacing: 1.2,
                                        color: theme.palette.text.primary,
                                        transition: "color 0.2s",
                                      }}
                                    >
                                      Resumo e Análise de Indicadores
                                    </Typography>
                                  </Box>
                                </Box>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "primary.main",
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.05,
                                    ),
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.1,
                                      ),
                                    },
                                  }}
                                >
                                  {showOverview ? (
                                    <IconChevronUp size={20} />
                                  ) : (
                                    <IconChevronDown size={20} />
                                  )}
                                </IconButton>
                              </Box>
                              <Collapse in={showOverview}>
                                <Box sx={{ p: 3 }}>
                                  {resumoExibido && (
                                    <Box sx={{ mb: 4 }}>
                                      <CardsKPI
                                        resumo={resumoExibido}
                                        categorias={data?.categorias || []}
                                        exibirProjecoes={incluirProjecaoTabela}
                                      />
                                    </Box>
                                  )}

                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={3.5}>
                                      {data?.categorias && (
                                        <GraficoDistribuicao
                                          categorias={data.categorias}
                                        />
                                      )}
                                    </Grid>
                                    <Grid item xs={12} md={8.5}>
                                      <GraficoEvolucao
                                        evolucao={evolucaoAnual}
                                        incluirProjecao={incluirProjecaoTabela}
                                        isLoading={isLoadingEvolucao}
                                        dataInicio={dataInicio}
                                        dataFim={dataFim}
                                        onMesClick={setPeriodo}
                                      />
                                    </Grid>
                                  </Grid>
                                </Box>
                              </Collapse>
                            </Paper>
                          )}

                          {sectionId === "table" && (
                            <Box
                              sx={{
                                borderRadius: 3,
                                border: 0,
                                bgcolor: "transparent",
                                boxShadow: "none",
                              }}
                            >
                              <Box
                                {...provided.dragHandleProps}
                                onClick={() => dispatch(toggleTable())}
                                sx={{
                                  p: 2,
                                  position: "relative",
                                  bgcolor: "background.paper",
                                  backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.primary.main, 0.02)})`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  border: "1px solid",
                                  borderColor: alpha(
                                    theme.palette.primary.main,
                                    0.15,
                                  ),
                                  borderTopLeftRadius: 22,
                                  borderTopRightRadius: 22,
                                  borderBottomLeftRadius: showTable ? 4 : 22,
                                  borderBottomRightRadius: showTable ? 4 : 22,
                                  transition: "all 0.2s",
                                  userSelect: "none",
                                  cursor: "grab",
                                  "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                                    borderColor: alpha(
                                      theme.palette.primary.main,
                                      0.25,
                                    ),
                                    backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.04)}, ${alpha(theme.palette.primary.main, 0.04)})`,
                                    "& .section-icon": {
                                      color: "primary.main",
                                    },
                                    "& .section-title": {
                                      color: "primary.main",
                                    },
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                  }}
                                >
                                  <Tooltip
                                    title="Clique e arraste para reordenar esta seção"
                                    arrow
                                  >
                                    <Box
                                      className="drag-handle"
                                      sx={{
                                        display: "flex",
                                        color: alpha(
                                          theme.palette.text.primary,
                                          0.3,
                                        ),
                                        p: 0.5,
                                        borderRadius: 1,
                                        border: "1px solid transparent",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                          color: "primary.main",
                                          bgcolor: alpha(
                                            theme.palette.primary.main,
                                            0.08,
                                          ),
                                          borderColor: alpha(
                                            theme.palette.primary.main,
                                            0.2,
                                          ),
                                        },
                                      }}
                                    >
                                      <IconGripVertical size={20} />
                                    </Box>
                                  </Tooltip>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1.5,
                                      cursor: "pointer !important",
                                    }}
                                  >
                                    <Box
                                      className="section-icon"
                                      sx={{
                                        display: "flex",
                                        color: "text.secondary",
                                        transition: "color 0.2s",
                                      }}
                                    >
                                      <IconTable size={22} />
                                    </Box>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={800}
                                      className="section-title"
                                      sx={{
                                        textTransform: "uppercase",
                                        letterSpacing: 1.2,
                                        color: theme.palette.text.primary,
                                        transition: "color 0.2s",
                                      }}
                                    >
                                      Detalhamento por Categorias
                                    </Typography>
                                  </Box>
                                </Box>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "primary.main",
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.05,
                                    ),
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.1,
                                      ),
                                    },
                                  }}
                                >
                                  {showTable ? (
                                    <IconChevronUp size={20} />
                                  ) : (
                                    <IconChevronDown size={20} />
                                  )}
                                </IconButton>
                              </Box>
                              <Collapse in={showTable} unmountOnExit>
                                <Box sx={{ pt: 2 }}>
                                  {/* <Box sx={{ p: 3 }}> */}
                                  <Grid container spacing={3}>
                                    <Grid
                                      item
                                      xs={12}
                                      sm={selectedIds.size > 0 ? 8 : 12}
                                    >
                                      {data?.categorias && (
                                        <CustomTable
                                          data={data.categorias}
                                          selectedIds={selectedIds}
                                          onToggle={toggleSelection}
                                          onSelectItem={selectItemForHistory}
                                          itemSelecionadoParaHistorico={
                                            selectedIds.size === 1
                                              ? Array.from(selectedIds)[0]
                                              : null
                                          }
                                          tiposFiltro={tiposFiltro}
                                          onToggleTipo={toggleTipoFiltro}
                                          onResetFilters={resetFilters}
                                          tiposExistentes={tiposExistentes}
                                          isLoading={loading}
                                          isFetching={isFetching}
                                          incluirProjecao={
                                            incluirProjecaoTabela
                                          }
                                          onToggleProjecao={
                                            setIncluirProjecaoTabela
                                          }
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
                                            height: "100%",
                                            overflow: "hidden",
                                            display: "flex",
                                            flexDirection: "column",
                                            border: "1px solid",
                                            borderColor: alpha(
                                              theme.palette.primary.main,
                                              0.2,
                                            ),
                                            bgcolor: "background.paper",
                                            transition: "all 0.3s ease",
                                            boxShadow:
                                              "0 2px 8px rgba(0,0,0,0.02)",
                                            "&:hover": {
                                              boxShadow:
                                                "0 4px 12px rgba(0,0,0,0.04)",
                                              borderColor: alpha(
                                                theme.palette.primary.main,
                                                0.25,
                                              ),
                                            },
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              p: 2,
                                              bgcolor: alpha(
                                                theme.palette.primary.main,
                                                0.02,
                                              ),
                                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1.5,
                                            }}
                                          >
                                            <Box
                                              sx={{
                                                p: 0.5,
                                                bgcolor: alpha(
                                                  theme.palette.primary.main,
                                                  0.1,
                                                ),
                                                borderRadius: 1,
                                                display: "flex",
                                                width: 28,
                                                height: 28,
                                                alignItems: "center",
                                                justifyContent: "center",
                                              }}
                                            >
                                              {isFetchingHistorico ? (
                                                <CircularProgress size={16} />
                                              ) : (
                                                <IconHistory
                                                  size={18}
                                                  color={
                                                    theme.palette.primary.main
                                                  }
                                                />
                                              )}
                                            </Box>
                                            <Typography
                                              variant="subtitle2"
                                              fontWeight={800}
                                            >
                                              Histórico: {titleHistorico}
                                            </Typography>
                                          </Box>

                                          {isFetchingHistorico && (
                                            <LinearProgress
                                              sx={{
                                                height: 2,
                                                // bgcolor: 'transparent',
                                                "& .MuiLinearProgress-bar": {
                                                  borderRadius: 1,
                                                },
                                              }}
                                            />
                                          )}

                                          {isLoadingHistorico ? (
                                            <Box
                                              sx={{
                                                p: 4,
                                                display: "flex",
                                                justifyContent: "center",
                                              }}
                                            >
                                              <CircularProgress size={32} />
                                            </Box>
                                          ) : (
                                            <Box
                                              sx={{ flex: 1, overflow: "auto" }}
                                            >
                                              <TableContainer
                                                sx={{
                                                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                                }}
                                              >
                                                <Table size="small">
                                                  <TableHead>
                                                    <TableRow
                                                      sx={{
                                                        bgcolor: alpha(
                                                          theme.palette.primary
                                                            .main,
                                                          0.02,
                                                        ),
                                                      }}
                                                    >
                                                      <TableCell
                                                        sx={{
                                                          whiteSpace: "nowrap",
                                                          py: histPaddingHeader,
                                                        }}
                                                      >
                                                        <Box
                                                          sx={{
                                                            display: "flex",
                                                            alignItems:
                                                              "center",
                                                            gap: 1,
                                                          }}
                                                        >
                                                          <Checkbox
                                                            size="small"
                                                            checked={
                                                              selectedMonths.length ===
                                                                historicoConsolidado.length &&
                                                              historicoConsolidado.length >
                                                                0
                                                            }
                                                            indeterminate={
                                                              selectedMonths.length >
                                                                0 &&
                                                              selectedMonths.length <
                                                                historicoConsolidado.length
                                                            }
                                                            onChange={
                                                              handleSelectAllMonths
                                                            }
                                                            sx={{ p: 0 }}
                                                          />
                                                          <Typography
                                                            variant="caption"
                                                            fontWeight={800}
                                                            color="text.secondary"
                                                            sx={{
                                                              whiteSpace:
                                                                "nowrap",
                                                            }}
                                                          >
                                                            REFERÊNCIA
                                                          </Typography>
                                                        </Box>
                                                      </TableCell>
                                                      <TableCell
                                                        align="center"
                                                        sx={{
                                                          whiteSpace: "nowrap",
                                                          py: histPaddingHeader,
                                                        }}
                                                      >
                                                        <Typography
                                                          variant="caption"
                                                          fontWeight={800}
                                                          color="text.secondary"
                                                          sx={{
                                                            whiteSpace:
                                                              "nowrap",
                                                          }}
                                                        >
                                                          PREVISTO / REALIZADO
                                                        </Typography>
                                                      </TableCell>
                                                      <TableCell
                                                        align="right"
                                                        sx={{
                                                          whiteSpace: "nowrap",
                                                          py: histPaddingHeader,
                                                        }}
                                                      >
                                                        <Typography
                                                          variant="caption"
                                                          fontWeight={800}
                                                          color="text.secondary"
                                                          sx={{
                                                            whiteSpace:
                                                              "nowrap",
                                                          }}
                                                        >
                                                          DIFERENÇA
                                                        </Typography>
                                                      </TableCell>
                                                    </TableRow>
                                                  </TableHead>
                                                  <TableBody>
                                                    {historicoConsolidado.map(
                                                      (h, i) => (
                                                        <TableRow
                                                          key={i}
                                                          onClick={(e) =>
                                                            handleSelectMonth(
                                                              h.dataRef,
                                                              e,
                                                            )
                                                          }
                                                          sx={{
                                                            cursor: "pointer",
                                                            "&:hover": {
                                                              bgcolor: alpha(
                                                                theme.palette
                                                                  .primary.main,
                                                                0.04,
                                                              ),
                                                            },
                                                          }}
                                                        >
                                                          <TableCell
                                                            sx={{
                                                              color:
                                                                "primary.main",
                                                              fontWeight: 700,
                                                              whiteSpace:
                                                                "nowrap",
                                                              py: histPaddingRow,
                                                            }}
                                                          >
                                                            <Box
                                                              sx={{
                                                                display: "flex",
                                                                alignItems:
                                                                  "center",
                                                                gap: 1,
                                                              }}
                                                            >
                                                              <Checkbox
                                                                size="small"
                                                                checked={selectedMonths.includes(
                                                                  h.dataRef,
                                                                )}
                                                                onClick={(
                                                                  e,
                                                                ) => {
                                                                  e.stopPropagation();
                                                                  handleSelectMonth(
                                                                    h.dataRef,
                                                                    e,
                                                                  );
                                                                }}
                                                                onChange={() => {}}
                                                                sx={{ p: 0 }}
                                                              />
                                                              <Typography
                                                                variant="body2"
                                                                fontWeight={700}
                                                                sx={{
                                                                  color:
                                                                    "primary.main",
                                                                }}
                                                              >
                                                                {h.referencia}
                                                              </Typography>
                                                            </Box>
                                                          </TableCell>
                                                          <TableCell
                                                            align="center"
                                                            sx={{
                                                              py: histPaddingRow,
                                                            }}
                                                          >
                                                            <Typography
                                                              variant="caption"
                                                              sx={{
                                                                whiteSpace:
                                                                  "nowrap",
                                                                display: "flex",
                                                                alignItems:
                                                                  "center",
                                                                justifyContent:
                                                                  "center",
                                                                gap: 0.5,
                                                              }}
                                                            >
                                                              <Box
                                                                component="span"
                                                                sx={{
                                                                  fontWeight: 500,
                                                                  color:
                                                                    "text.secondary",
                                                                }}
                                                              >
                                                                {formatCurrency(
                                                                  h.previsto,
                                                                )}
                                                              </Box>
                                                              <Box
                                                                component="span"
                                                                sx={{
                                                                  fontWeight: 500,
                                                                  color:
                                                                    "text.secondary",
                                                                }}
                                                              >
                                                                /
                                                              </Box>
                                                              <Box
                                                                component="span"
                                                                sx={{
                                                                  fontWeight: 700,
                                                                }}
                                                              >
                                                                {formatCurrency(
                                                                  h.totalPago,
                                                                )}
                                                              </Box>
                                                            </Typography>
                                                          </TableCell>
                                                          <TableCell
                                                            align="right"
                                                            sx={{
                                                              color:
                                                                h.restante > 0
                                                                  ? "success.main"
                                                                  : h.restante <
                                                                      0
                                                                    ? "error.main"
                                                                    : "text.secondary",
                                                              fontWeight: 800,
                                                              whiteSpace:
                                                                "nowrap",
                                                              py: histPaddingRow,
                                                            }}
                                                          >
                                                            {(() => {
                                                              const abs =
                                                                Math.abs(
                                                                  h.restante,
                                                                );
                                                              const f =
                                                                formatCurrency(
                                                                  abs,
                                                                );
                                                              if (
                                                                h.restante > 0
                                                              )
                                                                return `+${f}`;
                                                              if (
                                                                h.restante < 0
                                                              )
                                                                return `-${f}`;
                                                              return f;
                                                            })()}
                                                          </TableCell>
                                                        </TableRow>
                                                      ),
                                                    )}
                                                  </TableBody>
                                                </Table>
                                              </TableContainer>

                                              {/* Bloco de Totalizadores Premium no Rodapé */}
                                              <Grid
                                                container
                                                spacing={{ xs: 1, sm: 1.5 }}
                                                sx={{
                                                  p: { xs: 1, sm: 2 },
                                                }}
                                              >
                                                {[
                                                  {
                                                    label:
                                                      totalizadoresHistorico.labelPrevisto,
                                                    value:
                                                      totalizadoresHistorico.sumPrevisto,
                                                    color: "text.primary",
                                                    formatValue: (
                                                      val: number,
                                                    ) => formatCurrency(val),
                                                  },
                                                  {
                                                    label:
                                                      totalizadoresHistorico.labelRealizado,
                                                    value:
                                                      totalizadoresHistorico.sumRealizado,
                                                    color: "text.primary",
                                                    formatValue: (
                                                      val: number,
                                                    ) => formatCurrency(val),
                                                  },
                                                  {
                                                    label:
                                                      totalizadoresHistorico.labelDiferenca,
                                                    value:
                                                      totalizadoresHistorico.sumDiferenca,
                                                    color:
                                                      totalizadoresHistorico.colorDiferenca,
                                                    formatValue: (
                                                      val: number,
                                                    ) => {
                                                      const abs = Math.abs(val);
                                                      const f =
                                                        formatCurrency(abs);
                                                      if (val > 0)
                                                        return `+${f}`;
                                                      if (val < 0)
                                                        return `-${f}`;
                                                      return f;
                                                    },
                                                  },
                                                ].map((card, idx) => (
                                                  <Grid
                                                    item
                                                    xs={12}
                                                    sm={12}
                                                    md={12}
                                                    lg={4}
                                                    key={idx}
                                                  >
                                                    <Paper
                                                      variant="outlined"
                                                      sx={{
                                                        p: {
                                                          xs: 1.2,
                                                          lg: 1,
                                                        },
                                                        borderRadius: 2,
                                                        // bgcolor: alpha(
                                                        //   theme.palette.primary
                                                        //     .main,
                                                        //   0.015,
                                                        // ),
                                                        borderColor: alpha(
                                                          theme.palette.primary
                                                            .main,
                                                          0.2,
                                                        ),
                                                        display: "flex",
                                                        flexDirection: {
                                                          xs: "row",
                                                          lg: "column",
                                                        },
                                                        alignItems: "center",
                                                        justifyContent: {
                                                          xs: "space-between",
                                                          lg: "center",
                                                        },
                                                        gap: 0.5,
                                                        transition:
                                                          "all 0.2s ease-in-out",
                                                        "&:hover": {
                                                          transform:
                                                            "translateY(-1px)",
                                                          boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.05)}`,
                                                          borderColor: alpha(
                                                            theme.palette
                                                              .primary.main,
                                                            0.4,
                                                          ),
                                                        },
                                                      }}
                                                    >
                                                      <Typography
                                                        variant="caption"
                                                        fontWeight={800}
                                                        color="info.main"
                                                        sx={{
                                                          textTransform:
                                                            "uppercase",
                                                          letterSpacing: {
                                                            xs: 0.2,
                                                            sm: 0.5,
                                                            lg: 0.75,
                                                          },
                                                          fontSize: {
                                                            xs: "0.72rem",
                                                            sm: "0.65rem",
                                                            lg: "0.68rem",
                                                            xl: "0.75rem",
                                                          },
                                                          whiteSpace: "nowrap",
                                                          overflow: "hidden",
                                                          textOverflow:
                                                            "ellipsis",
                                                          width: {
                                                            xs: "auto",
                                                            lg: "100%",
                                                          },
                                                          textAlign: {
                                                            xs: "left",
                                                            lg: "center",
                                                          },
                                                        }}
                                                      >
                                                        {card.label}
                                                      </Typography>
                                                      <Typography
                                                        variant="subtitle1"
                                                        fontWeight={800}
                                                        color={card.color}
                                                        sx={{
                                                          fontSize: {
                                                            xs: "0.9rem",
                                                            sm: "0.85rem",
                                                            lg: "0.74rem",
                                                            xl: "0.85rem",
                                                          },
                                                          whiteSpace: "nowrap",
                                                          overflow: "hidden",
                                                          textOverflow:
                                                            "ellipsis",
                                                          textAlign: {
                                                            xs: "right",
                                                            lg: "center",
                                                          },
                                                        }}
                                                      >
                                                        {card.formatValue(
                                                          card.value,
                                                        )}
                                                      </Typography>
                                                    </Paper>
                                                  </Grid>
                                                ))}
                                              </Grid>
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
