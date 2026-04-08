"use client";

import {
  Alert,
  Box,
  Checkbox,
  Chip,
  IconButton,
  LinearProgress,
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
import { ReactNode, useState, useEffect, useMemo } from "react";
import {
  IconEye,
  IconEdit,
  IconTrash,
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
import { Categoria } from "@/core/categorias/types";
import { Despesa } from "@/core/despesas/types";
import { FonteRenda } from "@/core/fontesRenda/types";

// Hooks e componentes internos
import { SortIcon } from "./components/SortIcon";
import { TableTopBar } from "./components/TableTopBar";
import { useSimpleSort } from "./hooks/useSimpleSort";
import { useTableFilter } from "./hooks/useTableFilter";
import { CustomPaginationActions } from "./components/CustomPaginationActions";
import { createRenderColumn } from "./utils/renderColumn";
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

/**
 * Propriedades de configuração de uma coluna
 */
type IColumnProps = {
  sortValue?: (row: OrigemType) => any;
  render?: (row: OrigemType) => ReactNode;
  filterValue?: (row: OrigemType) => string | number;
};

/**
 * Tipo para configuração de colunas baseado nas keys do tipo T
 * Permite definir configurações opcionais para cada propriedade do objeto
 * Inclui 'origem' como coluna adicional personalizada
 */
type ITableColumns = Partial<Record<keyof OrigemType | "origem", IColumnProps>>;

interface CustomTableProps {
  /** Dados a serem exibidos */
  data: OrigemType[];

  /** Configuração das colunas */
  columns: ITableColumns;

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
  columns,
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
    columns,
  });

  // 🎯 Hook de ordenação (interno)
  const { sortedData, requestSort, getSortIcon, setSortConfig } = useSimpleSort(
    filteredData,
    columns,
  );

  // 🔄 Reset de filtros, ordenação, paginação e seleção
  const handleReset = () => {
    setFilterText("");
    setSortConfig(null);
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

  // Helpers de formatação
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), "dd/MM/yyyy", { locale: ptBRDate });
    } catch {
      return data;
    }
  };

  // 📏 Calcular total de colunas para colSpan
  // 9 colunas: checkbox + data + origem + tipo + categoria + nome + observacao + valor + ações
  const totalColumns = 9;

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

              {/* Data */}
              <TableCell
                onClick={() => requestSort("data")}
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  minWidth: 100,
                  maxWidth: 120,
                  "&:hover .sort-icon": {
                    opacity: getSortIcon("data") ? 1 : 0.4,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography fontWeight={700}>Data</Typography>
                  <SortIcon order={getSortIcon("data")} />
                </Box>
              </TableCell>

              {/* Origem */}
              <TableCell
                onClick={() => requestSort("origem")}
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  minWidth: 120,
                  maxWidth: 150,
                  "&:hover .sort-icon": {
                    opacity: getSortIcon("origem") ? 1 : 0.4,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography fontWeight={700}>Origem</Typography>
                  <SortIcon order={getSortIcon("origem")} />
                </Box>
              </TableCell>

              {/* Tipo */}
              <TableCell
                onClick={() => requestSort("tipo")}
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  minWidth: 130,
                  maxWidth: 160,
                  "&:hover .sort-icon": {
                    opacity: getSortIcon("tipo") ? 1 : 0.4,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography fontWeight={700}>Tipo</Typography>
                  <SortIcon order={getSortIcon("tipo")} />
                </Box>
              </TableCell>

              {/* Categoria */}
              <TableCell
                onClick={() => requestSort("categoria")}
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  minWidth: 130,
                  maxWidth: 200,
                  "&:hover .sort-icon": {
                    opacity: getSortIcon("categoria") ? 1 : 0.4,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography fontWeight={700}>Categoria</Typography>
                  <SortIcon order={getSortIcon("categoria")} />
                </Box>
              </TableCell>

              {/* Nome (Despesa/Fonte) */}
              <TableCell
                onClick={() => requestSort("nome")}
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  minWidth: 150,
                  maxWidth: 300,
                  "&:hover .sort-icon": {
                    opacity: getSortIcon("nome") ? 1 : 0.4,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography fontWeight={700}>Nome</Typography>
                  <SortIcon order={getSortIcon("nome")} />
                </Box>
              </TableCell>

              {/* Observação */}
              <TableCell
                onClick={() => requestSort("observacao")}
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  minWidth: 120,
                  maxWidth: 200,
                  "&:hover .sort-icon": {
                    opacity: getSortIcon("observacao") ? 1 : 0.4,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography fontWeight={700}>Observação</Typography>
                  <SortIcon order={getSortIcon("observacao")} />
                </Box>
              </TableCell>

              {/* Valor */}
              <TableCell
                align="right"
                onClick={() => requestSort("valor")}
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  minWidth: 110,
                  maxWidth: 150,
                  "&:hover .sort-icon": {
                    opacity: getSortIcon("valor") ? 1 : 0.4,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography fontWeight={700}>Valor</Typography>
                  <SortIcon order={getSortIcon("valor")} />
                </Box>
              </TableCell>

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
              sortedData.map((row) => (
                <CustomRow
                  key={row.id}
                  row={row}
                  columns={columns}
                  actions={actions}
                  isSelected={selectedIds.includes(row.id)}
                  onSelect={handleSelectOne}
                  formatarData={formatarData}
                  formatarValor={formatarValor}
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
  columns: ITableColumns;
  actions: IActionConfig[];
  isSelected: boolean;
  onSelect: (id: number) => void;
  formatarData: (data: string) => string;
  formatarValor: (valor: number) => string;
}

function CustomRow({
  row,
  columns,
  actions,
  isSelected,
  onSelect,
  formatarData,
  formatarValor,
}: CustomRowProps) {
  // Helper para renderizar colunas usando a função utilitária
  const renderColumn = useMemo(
    () => createRenderColumn(row, columns),
    [row, columns],
  );

  const isDespesa = Boolean(row.despesa);
  const isPagamento = row.tipo === "pagamento";

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

      {/* Data */}
      <TableCell>
        <Typography variant="body2">{formatarData(row.data)}</Typography>
      </TableCell>

      {/* Origem */}
      <TableCell>
        <Chip
          size="small"
          icon={
            isDespesa ? <IconArrowDown size={16} /> : <IconArrowUp size={16} />
          }
          label={renderColumn("origem")}
          color={isDespesa ? "error" : "success"}
          variant="outlined"
          sx={{
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      </TableCell>

      {/* Tipo */}
      <TableCell>
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
      </TableCell>

      {/* Categoria */}
      <TableCell>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: row.categoria?.cor ? alpha(row.categoria.cor, 0.15) : "primary.light",
              color: row.categoria?.cor || "primary.main",
              "& svg": { width: 16, height: 16 },
            }}
          >
            {row.categoria?.icone && AVAILABLE_ICONS[row.categoria.icone as keyof typeof AVAILABLE_ICONS]
              ? AVAILABLE_ICONS[row.categoria.icone as keyof typeof AVAILABLE_ICONS]
              : <IconCategory />}
          </Avatar>
          <Typography variant="body2" fontWeight={500} noWrap>
            {row.categoria?.nome || "-"}
          </Typography>
        </Stack>
      </TableCell>

      {/* Nome (Despesa/Fonte) */}
      <TableCell>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: (row.despesa?.cor || row.fonteRenda?.cor) ? alpha((row.despesa?.cor || row.fonteRenda?.cor)!, 0.15) : "primary.light",
              color: (row.despesa?.cor || row.fonteRenda?.cor) || "primary.main",
              "& svg": { width: 16, height: 16 },
            }}
          >
            {(row.despesa?.icone || row.fonteRenda?.icone) && AVAILABLE_ICONS[(row.despesa?.icone || row.fonteRenda?.icone) as keyof typeof AVAILABLE_ICONS]
              ? AVAILABLE_ICONS[(row.despesa?.icone || row.fonteRenda?.icone) as keyof typeof AVAILABLE_ICONS]
              : <IconCategory />}
          </Avatar>
          <Typography variant="body2" noWrap>
            {row.nome}
          </Typography>
        </Stack>
      </TableCell>

      {/* Observação */}
      <TableCell>
        <Tooltip title={row.observacao || "-"} arrow>
          <Typography variant="body2" noWrap color="textSecondary">
            {row.observacao || "-"}
          </Typography>
        </Tooltip>
      </TableCell>

      {/* Valor */}
      <TableCell align="right">
        <Typography
          variant="body2"
          fontWeight={600}
          color={isDespesa ? "error.main" : "success.main"}
        >
          {formatarValor(row.valor)}
        </Typography>
      </TableCell>

      {/* Ações */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 0 }}>
        <Box display="flex" gap={0.5} justifyContent="center">
          {actions.map((action, index) => {
            let icon = <IconEye size={18} />;
            if (action.title.toLowerCase().includes("editar")) {
              icon = <IconEdit size={18} />;
            } else if (
              action.title.toLowerCase().includes("remover") ||
              action.title.toLowerCase().includes("excluir")
            ) {
              icon = <IconTrash size={18} />;
            }

            return (
              <Tooltip key={index} title={action.title} arrow>
                <IconButton
                  size="small"
                  color={action.color || "default"}
                  onClick={() => action.callback(row)}
                  sx={{
                    "&:hover": {
                      bgcolor: (theme) =>
                        alpha(
                          theme.palette[action.color || "primary"].main,
                          0.1,
                        ),
                    },
                  }}
                >
                  {icon}
                </IconButton>
              </Tooltip>
            );
          })}
        </Box>
      </TableCell>
    </TableRow>
  );
}
