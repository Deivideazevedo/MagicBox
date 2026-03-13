"use client";

import {
  Alert,
  Box,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from "@mui/material";
import { ReactNode, useMemo, useState } from "react";

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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ActionsListMode } from "./components/ActionsListMode";
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
  align?: "left" | "right";
  sortValue?: (row: T) => any;
  render?: (row: T) => ReactNode;
  filterValue?: (row: T) => string | number;
};

const TABLE_COLUMNS: IColumnProps<OrigemType>[] = [
  { key: "data", label: "Data", render: (row) => formatarData(row.data) },
  { key: "origem", label: "Origem" },
  { key: "tipo", label: "Tipo" },
  { key: "nome", label: "Nome", align: "right" },
  {
    key: "valor",
    label: "Valor",
    align: "right",
    render: (row) => formatarValor(row.valor),
  },
  { key: "observacao", label: "Observação", align: "right" },
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
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
    // setSortConfig(null); // Para simple-sort
    pagination.onRowsPerPageChange({
      target: { value: String(10) },
    } as React.ChangeEvent<HTMLInputElement>);
    pagination.onPageChange(null, 0);
  };

  // 📏 Calcular total de colunas para colSpan
  // 7 colunas: expansão + nome + email + cidade + produtos + total + ações
  const totalColumns = TABLE_COLUMNS.length + 2;

  return (
    <Paper sx={{ boxShadow: 4 }} variant="outlined">
      {/* TopBar com busca e reset */}
      <TableTopBar
        filterText={filterText}
        onFilterChange={setFilterText}
        onReset={handleReset}
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
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
                        align === "right" ? "flex-end" : "flex-start",
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
                    severity="warning"
                    sx={{ alignItems: "center", justifyContent: "center" }}
                  >
                    {emptyMessage}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <CustomRow
                  key={index}
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
        onPageChange={pagination.onPageChange}
        onRowsPerPageChange={pagination.onRowsPerPageChange}
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
  columns:  IColumnProps<OrigemType>[];
  actions: IActionConfig<OrigemType>[];
}

function CustomRow({ row, columns, actions }: CustomRowProps) {
  const [open, setOpen] = useState(false);

  // Helper para renderizar colunas usando a função utilitária
  const renderColumn = useMemo(
    () => createRenderColumn(row, columns),
    [row, columns],
  );

  return (
    <>
      <TableRow sx={{ "& td": { border: 0 } }}>
        {TABLE_COLUMNS.map(({ key, align = "left" }) => (
          <TableCell key={String(key)} align={align}>
            {renderColumn(key)}
          </TableCell>
        ))}

        {/* Célula de ações - usando modo icon */}
        <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 0 }}>
          {/* <ActionsIconMode row={row} actions={actions} /> */}
          {/* Para usar modo menu dropdown, substitua por: */}
          <ActionsListMode row={row} actions={actions} />
        </TableCell>
      </TableRow>
    </>
  );
}
