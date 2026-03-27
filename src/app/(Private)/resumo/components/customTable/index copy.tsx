"use client";

import {
  Alert,
  alpha,
  Box,
  Collapse,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { memo, ReactNode, useMemo, useState } from "react";

// Hooks e componentes internos
import { MultiSortIcon } from "./components/MultiSortIcon";
// import { SortIcon } from './components/SortIcon';
import { TableTopBar } from "./components/TableTopBar";
import { MultiSortConfig, useMultiSort } from "./hooks/useMultiSort";
// import { useSimpleSort } from './hooks/useSimpleSort';
import { useTableFilter } from "./hooks/useTableFilter";
// import { ActionsListMode } from './components/ActionsListMode';
import { createRenderColumn } from "./utils/renderColumn";

// Types
import { ResumoResposta } from "@/core/lancamentos/resumo/types";
import {
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconChecks,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ActionsIconMode } from "./components/ActionsIconMode";
import { CustomPaginationActions } from "./components/CustomPaginationActions";
import { IActionConfig } from "./types/actions";

// Helpers de formatação
const formatarValor = (valor: number | string) => {
  if (Number(valor) === 0) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));
};

// NOVO CUSTOMTABLE - TEMPLATE PARA SER COPIADO E ADAPTADO
type OrigemType = ResumoResposta; // Exemplo de tipo, adapte conforme necessário

export type IColumnProps<T> = {
  key: keyof T;
  label: string;
  align?: "left" | "right" | "center";
  isSortable?: boolean; // Se a coluna é ordenável
  sortValue?: (row: T) => any;
  render?: (row: T) => ReactNode;
  filterValue?: (row: T) => string | number;
};

const TABLE_COLUMNS: IColumnProps<OrigemType>[] = [
  {
    key: "mes",
    label: "Período",
    sortValue: (row) => new Date(row.ano, row.mes - 1, 1).getTime(),
    render: (row) =>
      format(new Date(row.ano, row.mes - 1, 1), "MM/yyyy", { locale: ptBR }),
    align: "center",
  },
  {
    key: "nome",
    label: "Lançamento",
  },
  {
    key: "valorPrevisto",
    label: "V. Previsto",
    align: "right",
    sortValue: (row) => Number(row.valorPrevisto), // Garante ordenação numérica
    render: (row) => {
      const valorNum = Number(row.valorPrevisto);
      const isDespesa = row.origem === "despesa";

      // 1. Condição para valor zerado ou inexistente
      if (valorNum === 0) {
        return <Typography variant="body2">-</Typography>;
      }

      // 2. Condição para valores presentes
      return (
        <Typography
          variant="body2"
          fontWeight={600}
          color={isDespesa ? "error.main" : "success.main"}
        >
          {isDespesa ? "- " : "+ "}
          {formatarValor(valorNum)}
        </Typography>
      );
    },
  },
  {
    key: "valorPago",
    label: "V. Pago",
    align: "right",
    sortValue: (row) => Number(row.valorPago), // Garante ordenação numérica
    render: (row) => {
      const valorNum = Number(row.valorPago);
      const isDespesa = row.origem === "despesa";

      // 1. Condição para valor zerado ou inexistente
      if (valorNum === 0) {
        return <Typography variant="body2">-</Typography>;
      }

      // 2. Condição para valores presentes
      return (
        <Typography
          variant="body2"
          fontWeight={600}
          color={isDespesa ? "error.main" : "success.main"}
        >
          {isDespesa ? "- " : "+ "}
          {formatarValor(valorNum)}
        </Typography>
      );
    },
  },
  {
    key: "status",
    label: "Status",
    align: "center",
    render: (row) =>
      row.status ? (
        <Chip
          label={row.status}
          size="small"
          color={
            row.status === "Pago"
              ? "success"
              : row.atrasado
                ? "error"
                : "primary"
          }
        />
      ) : (
        "-"
      ), // Exibe um traço neutro se o status for vazio
  },
];

interface CustomTableProps {
  /** Dados a serem exibidos */
  data: OrigemType[];

  /** Lista de ações para cada linha */
  actions: IActionConfig<OrigemType>[];

  /** Paginação */
  pagination: {
    page: number;
    rowsPerPage: number;
    count: number;
    onUpdatePaginationParams: (params: {
      page?: number;
      limit?: number;
    }) => void;
  };

  /** Estado de loading */
  isLoading?: boolean;

  /** Estado de fetching */
  isFetching?: boolean;

  /** Mensagem customizada quando não houver dados */
  emptyMessage?: string;

  /** Ordenação inicial - aplicada ao montar o componente */
  initialSort?: MultiSortConfig<OrigemType>[];

  /** Ordenação externa - sincronizada com o estado do pai */
  externalSort?: MultiSortConfig<OrigemType>[];

  /** Callback quando a ordenação muda - para sincronização externa */
  onExternalSort?: (sort: MultiSortConfig<OrigemType>[]) => void;
}

/**
 * 📋 CustomTable - Componente template para tabelas customizáveis
 *
 * Este componente é um TEMPLATE para ser copiado e adaptado conforme necessário.
 * Ele encapsula: filtro, ordenação, paginação e layout básico.
 */
export function CustomTable({
  data,
  actions,
  pagination,
  isLoading = false,
  isFetching = false,
  emptyMessage = "Nenhum dado foi encontrado",
  initialSort,
  externalSort,
  onExternalSort,
}: CustomTableProps) {
  // 🔍 Hook de filtro (interno)
  const { filteredData, filterText, setFilterText } = useTableFilter({
    data,
    columns: TABLE_COLUMNS,
  });

  // 🎯 Hook de ordenação multi-coluna (interno)
  const { sortedData, requestSort, getSortIcon, resetSort } = useMultiSort(
    filteredData,
    TABLE_COLUMNS,
    externalSort ?? initialSort, // Prioriza externalSort, senão usa initialSort
    onExternalSort,
    initialSort, // Passa initialSort para resetar corretamente
  );

  // 🔄 Reset de filtros, ordenação Paginação
  const handleReset = () => {
    setFilterText("");
    resetSort(); // Para multi-sort

    // Evita disparar updates/fetches quando já está na configuração padrão.
    if (pagination.rowsPerPage !== 10 || pagination.page !== 0) {
      pagination.onUpdatePaginationParams({ page: 0, limit: 10 });
    }
  };

  // 📏 Calcular total de colunas para colSpan
  // 7 colunas: expansão + nome + email + cidade + produtos + total + ações
  const totalColumns = TABLE_COLUMNS.length + 1;

  return (
    <Paper
      sx={{
        borderRadius: 3,
        mt: 3,
        boxShadow: 2,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
      }}
      variant="outlined"
    >
      {/* TopBar com busca e reset */}
      <TableTopBar
        filterText={filterText}
        onFilterChange={setFilterText}
        onReset={handleReset}
      />

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 0 }} />{" "}
              {/* Célula para ícone de expansão, se necessário */}
              {TABLE_COLUMNS.map(({ key, label, align = "left" }) => (
                <TableCell
                  key={String(key)}
                  align={align}
                  onClick={() => requestSort(key)}
                  sx={{
                    cursor: "pointer",
                    userSelect: "none",
                    "&:hover .sort-icon": {
                      opacity: getSortIcon(key) ? 1 : 0.4,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        align === "right"
                          ? "flex-end"
                          : align === "left"
                            ? "flex-start"
                            : "center",
                    }}
                  >
                    <Typography fontWeight={700}>{label}</Typography>
                    <MultiSortIcon sortInfo={getSortIcon(key)} />
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell colSpan={totalColumns} align="center">
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColumns} align="center">
                  <Alert
                    severity="info"
                    sx={{ alignItems: "center", justifyContent: "center" }}
                  >
                    {emptyMessage}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.length > 0 &&
              (!isLoading || !isFetching) &&
              sortedData.map((row) => (
                <CustomRow
                  key={row.id}
                  row={row}
                  columns={TABLE_COLUMNS}
                  actions={actions}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: 13,
          // color: theme.palette.text.primary,
        }}
      >
        {`Total: ${
          filteredData.length !== data.length
            ? `${filteredData.length} / ${data.length}`
            : data.length
        }`}
      </Box>
    </Paper>
  );
}

// Componente interno de linha
interface CustomRowProps {
  row: OrigemType;
  columns: IColumnProps<OrigemType>[];
  actions: IActionConfig<OrigemType>[];
}

/**
 * 🚀 CustomRow memoizado para evitar re-renders desnecessários
 * Quando a tabela re-renderiza (ordenação, filtro), as linhas não são recalculadas
 * se row.id e isSelected forem iguais (comparador customizado otimizado)
 */
const CustomRow = memo(
  function CustomRow({ row, columns, actions }: CustomRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const rowTotalColumns = columns.length + 2;

    // Helper para renderizar colunas usando a função utilitária
    const renderColumn = useMemo(
      () => createRenderColumn(row, columns),
      [row, columns],
    );

    return (
      <>
        <TableRow
          onClick={() => setIsExpanded((prev) => !prev)}
          sx={{
            "& td": {
              borderBottom: (theme) =>
                isExpanded ? "0" : `1px solid ${theme.palette.divider}`,
            },
            "&:hover": {
              bgcolor: (theme) => theme.palette.action.hover,
            },
            cursor: "pointer",
          }}
        >
          <TableCell sx={{ width: 0 }}>
            <IconButton
              size="small"
              aria-label={
                isExpanded ? "Recolher detalhes" : "Expandir detalhes"
              }
              // onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded ? (
                <IconChevronUp size={18} />
              ) : (
                <IconChevronDown size={18} />
              )}
            </IconButton>
          </TableCell>
          {TABLE_COLUMNS.map(({ key, align = "left" }) => {
            return (
              <TableCell key={String(key)} align={align}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      align === "right"
                        ? "flex-end"
                        : align === "left"
                          ? "flex-start"
                          : "center",
                  }}
                >
                  {renderColumn(key)}

                  <MultiSortIcon />
                </Box>
              </TableCell>
            );
          })}
        </TableRow>

        <TableRow>
          <TableCell
            colSpan={rowTotalColumns}
            sx={{
              py: 0,
              borderBottom: (theme) =>
                isExpanded ? `1px solid ${theme.palette.divider}` : "0",
              backgroundColor: (theme) => theme.palette.grey[100],
            }}
          >
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box
                sx={{
                  py: 2,
                  pl: 8,
                  pr: 5,
                  position: "relative",
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{
                    mb: 1,
                    ml: -2.8,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "primary.main",
                  }}
                >
                  <Box sx={{ color: "primary.main", display: "inline-flex" }}>
                    <IconCalendar size={18} stroke={2.5} color="currentColor" />
                  </Box>
                  Histórico de Movimentações
                </Typography>

                <Box sx={{ position: "relative" }}>
                  {/* Linha Vertical - Centralizada com o Dot */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: -14,
                      width: "2px",
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.3),
                      zIndex: 0,
                    }}
                  />

                  <Stack spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
                    {row.detalhes?.map((detalhe: any) => {
                      const isPagamento = detalhe.tipo === "pagamento";
                      const temObservacao = !!detalhe.observacao;

                      return (
                        <Box
                          key={detalhe.id}
                          sx={{
                            display: "flex",
                            alignItems: "center", // Alinha o Card, Dot e Data no mesmo eixo horizontal
                            position: "relative",
                            "&:hover": {
                              "& .timeline-dot": {
                                transform: "scale(1.3)",
                                bgcolor: "primary.main",
                              },
                              "& .timeline-text": {
                                fontSize: "0.9rem",
                                color: "primary.main",
                                // transform: "translateX(-1px)",
                              },
                            },
                          }}
                        >
                          {/* Indicador Lateral (Data + Dot) */}
                          <Box
                            sx={{
                              position: "absolute",
                              left: -28, // Recua para alinhar o dot com a linha
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 30,
                              height: 30,
                            }}
                          >
                            {/* Data à esquerda do Dot */}
                            <Typography
                              variant="caption"
                              className="timeline-text"
                              fontWeight={800}
                              sx={{
                                position: "absolute",
                                right: 28, // Distância à esquerda do dot
                                color: "text.secondary",
                                whiteSpace: "nowrap",
                                fontSize: "0.75rem",
                                transition: "0.1s",
                              }}
                            >
                              {format(new Date(detalhe.data), "dd/MM")}
                            </Typography>

                            {/* Dot - O centro deste componente é o eixo da linha */}
                            <Box
                              className="timeline-dot"
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                                border: "2px solid white",
                                boxShadow: 1,
                                transition: "0.2s",
                                zIndex: 2,
                              }}
                            />
                          </Box>

                          {/* Card Slim */}
                          <Paper
                            variant="outlined"
                            sx={{
                              flex: 1,
                              ml: { xs: 1, md: 0 },
                              p: "10px 16px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              transition: "all 0.2s ease",
                              borderRadius: "12px",
                              bgcolor: "background.paper",
                              "&:hover": {
                                transform: "translateX(8px)",
                                borderColor: "primary.main",
                                boxShadow: (theme) =>
                                  `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                              },
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={temObservacao ? 600 : 700}
                                color={"text.primary"}
                              >
                                {detalhe.observacao || "Sem descrição"}
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{
                                  color: isPagamento
                                    ? "success.main"
                                    : "warning.main",
                                  fontWeight: 700,
                                }}
                              >
                                {isPagamento ? "Pagamento" : "Agendamento"}
                              </Typography>
                            </Box>

                            <Stack
                              direction="row"
                              spacing={3}
                              alignItems="center"
                            >
                              <Typography variant="subtitle2" fontWeight={800}>
                                {formatarValor(detalhe.valor)}
                              </Typography>
                              <ActionsIconMode
                                row={detalhe}
                                actions={actions}
                              />
                            </Stack>
                          </Paper>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  },
  (prev, next) => {
    // Comparador customizado otimizado: re-renderiza apenas se row.id ou isSelected mudarem
    // false = re-renderiza, true = mantém memoizado
    return prev.row.id === next.row.id;
  },
);
