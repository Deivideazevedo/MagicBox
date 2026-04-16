"use client";

import {
  Alert,
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  Avatar,
  Stack,
} from "@mui/material";
import { ReactNode, useState, useEffect, useMemo, memo } from "react";
import {
  IconCalendar,
  IconChecks,
  IconArrowDown,
  IconArrowUp,
  IconCategory,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR as ptBRDate } from "date-fns/locale";

// Types
import { Lancamento } from "@/core/lancamentos/types";
import { Despesa } from "@/core/despesas/types";
import { Receita } from "@/core/receitas/types";

// Hooks e componentes internos
import { MultiSortIcon } from "./components/MultiSortIcon";
import { TableTopBar } from "./components/TableTopBar";
import { ActionsIconMode } from "./components/ActionsIconMode";
import { useMultiSort } from "./hooks/useMultiSort";
import { useTableFilter } from "./hooks/useTableFilter";
import { CustomPaginationActions } from "./components/CustomPaginationActions";
import { createRenderColumn, IColumnProps } from "./utils/renderColumn";
import { AVAILABLE_ICONS } from "@/app/components/forms/hooksForm/HookIconPicker";

// ==================== TYPES ====================

type OrigemType = Lancamento & { origem: string; nome: string };

/**
 * Configuração de uma ação individual para uma linha
 */
interface IActionConfig {
  icon?: ReactNode;
  title: string;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  callback: (row: OrigemType) => void;
}

// ==================== COLUNAS DINÂMICAS ====================

const TABLE_COLUMNS: IColumnProps<OrigemType>[] = [
  {
    key: "data",
    label: "Data",
    align: "left",
    sortValue: (row) => new Date(row.data).getTime(),
    render: (row) => {
      try {
        return format(new Date(row.data), "dd/MM/yyyy", { locale: ptBRDate });
      } catch {
        return row.data;
      }
    },
    filterValue: (row) => row.data,
  },
  {
    key: "origem",
    label: "Origem",
    align: "left",
    sortValue: (row) => row.origem,
    render: (row) => {
      const isDespesa = Boolean(row.despesa);
      return (
        <Chip
          size="small"
          icon={
            isDespesa ? <IconArrowDown size={16} /> : <IconArrowUp size={16} />
          }
          label={row.origem}
          color={isDespesa ? "error" : "success"}
          variant="outlined"
          sx={{
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      );
    },
    filterValue: (row) => row.origem,
  },
  {
    key: "tipo",
    label: "Tipo",
    align: "left",
    sortValue: (row) => row.tipo,
    render: (row) => {
      const isPagamento = row.tipo === "pagamento";
      return (
        <Chip
          size="small"
          icon={
            isPagamento ? <IconChecks size={16} /> : <IconCalendar size={16} />
          }
          label={isPagamento ? "Pagamento" : "Agendamento"}
          color={isPagamento ? "success" : "warning"}
          sx={{
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      );
    },
    filterValue: (row) =>
      row.tipo === "pagamento" ? "Pagamento" : "Agendamento",
  },
  {
    key: "nome",
    label: "Nome",
    align: "left",
    sortValue: (row) => row.nome,
    render: (row) => (
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Avatar
          sx={{
            width: 28,
            height: 28,
            bgcolor:
              row.despesa?.cor || row.receita?.cor
                ? alpha((row.despesa?.cor || row.receita?.cor)!, 0.15)
                : "primary.light",
            color: row.despesa?.cor || row.receita?.cor || "primary.main",
            "& svg": { width: 16, height: 16 },
          }}
        >
          {(row.despesa?.icone || row.receita?.icone) &&
            AVAILABLE_ICONS[
            (row.despesa?.icone ||
              row.receita?.icone) as keyof typeof AVAILABLE_ICONS
            ] ? (
            AVAILABLE_ICONS[
            (row.despesa?.icone ||
              row.receita?.icone) as keyof typeof AVAILABLE_ICONS
            ]
          ) : (
            <IconCategory />
          )}
        </Avatar>
        <Typography variant="body2" noWrap>
          {row.nome}
        </Typography>
      </Stack>
    ),
    filterValue: (row) => row.nome,
  },
  {
    key: "observacao",
    label: "Observação",
    align: "left",
    sortValue: (row) => row.observacao || "-",
    render: (row) => (
      <Tooltip title={row.observacao || "-"} arrow>
        <Typography variant="body2" noWrap color="textSecondary">
          {row.observacao || "-"}
        </Typography>
      </Tooltip>
    ),
    filterValue: (row) => row.observacao || "-",
  },
  {
    key: "valor",
    label: "Valor",
    align: "right",
    sortValue: (row) => row.valor,
    render: (row) => {
      const isDespesa = Boolean(row.despesa);
      const formatarValor = (valor: number) => {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valor);
      };
      return (
        <Typography
          variant="body2"
          fontWeight={600}
          color={isDespesa ? "error.main" : "success.main"}
        >
          {formatarValor(row.valor)}
        </Typography>
      );
    },
    filterValue: (row) => String(row.valor),
  },
];

interface CustomTableProps {
  /** Dados a serem exibidos */
  data: OrigemType[];

  /** Lista de ações para cada linha */
  actions: IActionConfig[];

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

  /** Seleção de linhas */
  onSelectionChange?: (ids: number[]) => void;
}

/**
 * 📋 CustomTable - Tabela de Lançamentos
 *
 * Componente especializado para exibir e gerenciar lançamentos financeiros.
 * Encapsula: filtro, ordenação, paginação, seleção e ações.
 */
export function CustomTable({
  data,
  actions,
  pagination,
  isLoading = false,
  emptyMessage = "Nenhum dado foi encontrado",
  onSelectionChange,
}: CustomTableProps) {
  // Estado de seleção
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Limpar seleção ao mudar de página
  useEffect(() => {
    setSelectedIds([]);
    if (onSelectionChange) onSelectionChange([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  // 🔍 Hook de filtro (interno)
  const { filteredData, filterText, setFilterText } = useTableFilter({
    data,
    columns: TABLE_COLUMNS,
  });

  // 🎯 Hook de ordenação múltipla (interno)
  const { sortedData, requestSort, getSortIcon, resetSort } = useMultiSort(
    filteredData,
    TABLE_COLUMNS,
  );

  // 🔄 Reset de filtros, ordenação, paginação e seleção
  const handleReset = () => {
    setFilterText("");
    resetSort();
    setSelectedIds([]);
    if (onSelectionChange) onSelectionChange([]);
    pagination.onRowsPerPageChange({
      target: { value: String(10) },
    } as React.ChangeEvent<HTMLInputElement>);
    pagination.onPageChange(null, 0);
  };

  // Handlers de seleção
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = sortedData.map((row) => row.id);
      setSelectedIds(allIds);
      if (onSelectionChange) onSelectionChange(allIds);
    } else {
      setSelectedIds([]);
      if (onSelectionChange) onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    setSelectedIds(newSelectedIds);
    if (onSelectionChange) onSelectionChange(newSelectedIds);
  };

  // 📏 Calcular total de colunas para colSpan (8 colunas + 1 checkbox + 1 ações)
  const totalColumns = TABLE_COLUMNS.length + 2;

  return (
    <Paper
      sx={{
        // boxShadow: "none",
        // border: "none",
        borderRadius: 2,
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
              sx={{
                backgroundColor: (theme) =>
                  alpha(theme.palette.primary.main, 0.08),
              }}
            >
              {/* Checkbox Select All */}
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedIds.length > 0 &&
                    selectedIds.length < sortedData.length
                  }
                  checked={
                    sortedData.length > 0 &&
                    selectedIds.length === sortedData.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>

              {/* Headers dinâmicos */}
              {TABLE_COLUMNS.map(({ key, label, align = "left" }) => (
                <TableCell
                  key={String(key)}
                  align={align}
                  onClick={() => requestSort(key)}
                  sx={{
                    cursor: "pointer",
                    userSelect: "none",
                    minWidth: 100,
                    "&:hover .sort-icon": {
                      opacity: getSortIcon(key) ? 1 : 0.4,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
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

          {/* Loading indicator */}
          {isLoading && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={totalColumns} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={40} />
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
            ) : sortedData.length > 0 && !isLoading && (
              sortedData.map((row) => (
                <CustomRow
                  key={row.id}
                  row={row}
                  columns={TABLE_COLUMNS}
                  actions={actions}
                  isSelected={selectedIds.includes(row.id)}
                  onSelect={handleSelectOne}
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
        rowsPerPageOptions={[10, 20, 50, 100]}
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
  columns: IColumnProps<OrigemType>[];
  actions: IActionConfig[];
  isSelected: boolean;
  onSelect: (id: number) => void;
}

/**
 * 🚀 CustomRow memoizado para evitar re-renders desnecessários
 * Quando a tabela re-renderiza (ordenação, filtro), as linhas não são recalculadas
 * se row.id for igual (comparador customizado otimizado)
 */
const CustomRow = memo(
  function CustomRow({
    row,
    columns,
    actions,
    isSelected,
    onSelect,
  }: CustomRowProps) {
    // Helper para renderizar colunas usando a função utilitária
    const renderColumn = useMemo(
      () => createRenderColumn(row, columns),
      [row, columns],
    );

    // Mapa de alinhamentos para O(1) lookup
    const alignsMap = useMemo(() => {
      const map = new Map<string | keyof OrigemType, string>();
      columns.forEach(({ key, align }) => map.set(key, align || "left"));
      return map;
    }, [columns]);

    const isDespesa = Boolean(row.despesa);

    return (
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
        {/* Checkbox */}
        <TableCell padding="checkbox">
          <Checkbox checked={isSelected} onChange={() => onSelect(row.id)} />
        </TableCell>

        {/* Colunas dinâmicas */}
        {columns.map(({ key }) => (
          <TableCell
            key={String(key)}
            align={(alignsMap.get(key) as any) || "left"}
          >
            {renderColumn(key)}
          </TableCell>
        ))}

        {/* Ações */}
        <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 0 }}>
          <ActionsIconMode row={row} actions={actions} />
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => {
    // Comparador customizado: re-renderiza apenas se row.id ou isSelected mudarem
    // false = re-renderiza, true = mantém memoizado
    return prev.row.id === next.row.id && prev.isSelected === next.isSelected;
  },
);
