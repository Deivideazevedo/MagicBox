"use client";

import {
  Alert,
  alpha,
  Box,
  Chip,
  LinearProgress,
  Paper,
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
import { Lancamento } from "@/core/lancamentos/types";
import { IconCalendar, IconChecks } from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ActionsIconMode } from "./components/ActionsIconMode";
import { CustomPaginationActions } from "./components/CustomPaginationActions";
import { IActionConfig } from "./types/actions";

// Helpers de formatação
const formatarValor = (valor: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
};

const formatarData = (data: string) => {
  try {
    return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return data;
  }
};

// NOVO CUSTOMTABLE - TEMPLATE PARA SER COPIADO E ADAPTADO
type OrigemType = Lancamento & { origem: string; nome: string };

export type IColumnProps<T> = {
  key: keyof T;
  label: string;
  align?: "left" | "right" | "center";
  sortValue?: (row: T) => any;
  render?: (row: T) => ReactNode;
  filterValue?: (row: T) => string | number;
};

const TABLE_COLUMNS: IColumnProps<OrigemType>[] = [
  {
    key: "data",
    label: "Data",
    sortValue: (row) => new Date(row.data).getTime(),
    render: (row) => formatarData(row.data),
    align: "center",
  },
  { key: "nome", label: "Nome", align: "right" },
  {
    key: "valor",
    label: "Valor",
    align: "right",
    sortValue: (row) => row.valor,
    render: (row) => (
      <Typography
        variant="body2"
        fontWeight={600}
        color={Boolean(row.despesa) ? "error.main" : "success.main"}
      >
        {formatarValor(row.valor)}
      </Typography>
    ),
  },
  // {
  //   key: "origem",
  //   label: "Origem",
  //   render: (row) => {
  //     const isDespesa = Boolean(row.despesa);
  //     return (
  //       <Chip
  //         size="small"
  //         icon={
  //           isDespesa ? <IconArrowDown size={16} /> : <IconArrowUp size={16} />
  //         }
  //         label={row.origem}
  //         color={isDespesa ? "error" : "success"}
  //         variant="outlined"
  //         sx={{
  //           fontWeight: 600,
  //           fontSize: "0.75rem",
  //         }}
  //       />
  //     );
  //   },
  // },
  {
    key: "tipo",
    label: "Tipo",
    render: (row) => {
      const isPagamento = row.tipo === "pagamento";
      const isDespesa = Boolean(row.despesa);
      return (
        <Chip
          size="small"
          icon={
            isPagamento ? <IconChecks size={16} /> : <IconCalendar size={16} />
          }
          label={isPagamento ? "Pagamento" : "Agendamento"}
          color={
            isPagamento && !isDespesa
              ? "success"
              : isPagamento && isDespesa
                ? "error"
                : "warning"
          }
          sx={{
            fontWeight: 600,
            fontSize: "0.75rem",
            // color: "common.white",
            // "& .MuiChip-icon": { color: "common.white" },
          }}
        />
      );
    },
  },
  { key: "observacao", label: "Observação", align: "left" },
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

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={
                {
                  // backgroundColor: (theme) =>
                  //   alpha(theme.palette.primary.light, 0.5),
                }
              }
            >
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
          {isLoading && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={totalColumns} sx={{ p: 0, border: 0 }}>
                  <LinearProgress />
                </TableCell>
              </TableRow>
            </TableBody>
          )}

          <TableBody>
            {sortedData.length === 0 && !isLoading ? (
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
              sortedData.map((row, index) => (
                <CustomRow
                  key={row?.id || index}
                  row={row}
                  columns={TABLE_COLUMNS}
                  actions={actions}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <TablePagination
        component="div"
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          "& .MuiTablePagination-select": {
            borderRadius: "6px",
          },
        }}
        labelRowsPerPage="Linhas por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count}`
        }
        count={pagination.count}
        rowsPerPageOptions={[2, 5, 10, 25, 50]}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        ActionsComponent={CustomPaginationActions}
        rowsPerPage={pagination.rowsPerPage}
        page={pagination.page}
      />
      {/* <CustomTablePagination pagination={pagination} /> */}
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
    // Helper para renderizar colunas usando a função utilitária
    const renderColumn = useMemo(
      () => createRenderColumn(row, columns),
      [row, columns],
    );

    return (
      <>
        <TableRow
          sx={{
            "& td": { border: 0 },
            "&:hover": {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            },
            ...(isSelected && {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            }),
          }}
        >
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
      </>
    );
  },
  (prev, next) => {
    // Comparador customizado otimizado: re-renderiza apenas se row.id ou isSelected mudarem
    // false = re-renderiza, true = mantém memoizado
    return prev.row.id === next.row.id && prev.isSelected === next.isSelected;
  },
);
