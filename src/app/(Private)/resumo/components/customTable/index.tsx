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
  const totalColumns = TABLE_COLUMNS.length + 2;

  // Função para lidar com a mudança de página
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    pagination.onUpdatePaginationParams?.({ page: newPage }); // newPage é passada nativamente pela tablePagination
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newLimit = parseInt(event.target.value, 10);
    pagination.onUpdatePaginationParams?.({ limit: newLimit, page: 0 }); // Resetar para página 0
  };

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

      <TableContainer sx={{ maxHeight: 350 }}>
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
              {/* Ações */}
              <TableCell align="center">
                <Typography fontWeight={700}>Ações</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Loading bar */}
          {/* {isFetching && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={totalColumns} sx={{ p: 0, border: 0 }}>
                  <LinearProgress />
                </TableCell>
              </TableRow>
            </TableBody>
          )} */}

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
  isSelected?: boolean;
}

/**
 * 🚀 CustomRow memoizado para evitar re-renders desnecessários
 * Quando a tabela re-renderiza (ordenação, filtro), as linhas não são recalculadas
 * se row.id e isSelected forem iguais (comparador customizado otimizado)
 */
const CustomRow = memo(
  function CustomRow({ row, columns, actions, isSelected }: CustomRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const rowTotalColumns = columns.length + 2;

    // Helper para renderizar colunas usando a função utilitária
    const renderColumn = useMemo(
      () => createRenderColumn(row, columns),
      [row, columns],
    );

    const periodo = format(new Date(row.ano, row.mes - 1, 1), "MM/yyyy", {
      locale: ptBR,
    });

    const diferenca = Number(row.valorPago) - Number(row.valorPrevisto);

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

          {/* Célula de ações - usando modo icon */}
          <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 0 }}>
            <ActionsIconMode row={row} actions={actions} />
            {/* Para usar modo menu dropdown, substitua por: */}
            {/* <ActionsListMode row={row} actions={actions} /> */}
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell
            colSpan={rowTotalColumns}
            sx={{
              py: 0,
              borderBottom: (theme) =>
                isExpanded ? `1px solid ${theme.palette.divider}` : "0",
              backgroundColor: (theme) =>
                isExpanded ? alpha(theme.palette.primary.main, 0.03) : "transparent",
            }}
          >
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ px: 2.5, py: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                  Detalhes do lançamento
                </Typography>

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.5}
                  divider={<Divider flexItem orientation="vertical" />}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Origem
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {row.origem === "despesa" ? "Despesa" : "Renda"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Período
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <IconCalendar size={14} />
                      <Typography variant="body2" fontWeight={600}>
                        {periodo}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Vencimento/Recebimento
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {row.diaVencido
                        ? `Dia ${row.diaVencido}`
                        : "Sem dia definido"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Diferença (Pago - Previsto)
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={diferenca >= 0 ? "success.main" : "error.main"}
                    >
                      {diferenca >= 0 ? "+ " : "- "}
                      {formatarValor(Math.abs(diferenca))}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Situação
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <IconChecks size={14} />
                      <Typography variant="body2" fontWeight={600}>
                        {row.status || "Sem status"}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
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
    return prev.row.id === next.row.id && prev.isSelected === next.isSelected;
  },
);
