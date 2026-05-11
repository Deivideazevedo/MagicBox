"use client";

import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  alpha,
  Avatar,
  Stack,
  IconButton,
  Collapse,
  useTheme,
  Switch,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import React, { useState, useMemo, memo } from "react";
import {
  IconCategory,
  IconChevronDown,
  IconChevronUp,
  IconBolt,
} from "@tabler/icons-react";

// Types
import { CategoriaRelatorio } from "@/core/relatorios/relatorio.dto";

// Hooks e componentes internos
import { MultiSortIcon } from "./components/MultiSortIcon";
import { TableTopBar } from "./components/TableTopBar";
import { useMultiSort } from "./hooks/useMultiSort";
import { useTableFilter } from "./hooks/useTableFilter";
import { CustomPaginationActions } from "./components/CustomPaginationActions";
import { createRenderColumn, IColumnProps } from "./utils/renderColumn";
import { AVAILABLE_ICONS } from "@/app/components/forms/hooksForm/HookIconPicker";

// Tabela Filha
import { CustomTableChild } from "../customTableChild";

// ==================== COLUNAS DINÂMICAS ====================

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

const TABLE_COLUMNS: IColumnProps<CategoriaRelatorio>[] = [
  {
    key: "nome",
    label: "Categoria / Conta",
    align: "left",
    sortValue: (row) => row.nome,
    render: (row) => {
      const iconeStr = row.icone;
      const corStr = row.cor;

      return (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: corStr ? alpha(corStr, 0.15) : "primary.light",
              color: corStr || "primary.main",
              "& svg": { width: 18, height: 18 },
            }}
          >
            {iconeStr &&
            AVAILABLE_ICONS[iconeStr as keyof typeof AVAILABLE_ICONS] ? (
              AVAILABLE_ICONS[iconeStr as keyof typeof AVAILABLE_ICONS]
            ) : (
              <IconCategory />
            )}
          </Avatar>
          <Typography variant="subtitle2" fontWeight={700}>
            {row.nome}
          </Typography>
        </Stack>
      );
    },
    filterValue: (row) => row.nome,
  },
  {
    key: "valorPlanejado",
    label: "Vlr. Estimado",
    align: "right",
    sortValue: (row) => row.valorPlanejado,
    render: (row) => (
      <Typography variant="body2" fontWeight={600} color="textSecondary">
        {formatCurrency(row.valorPlanejado)}
      </Typography>
    ),
  },
  {
    key: "valorRealizado",
    label: "Vlr. Pago",
    align: "right",
    sortValue: (row) => row.valorRealizado,
    render: (row) => (
      <Typography variant="body2" fontWeight={700}>
        {formatCurrency(row.valorRealizado)}
      </Typography>
    ),
  },
  {
    key: "restante",
    label: "Restante",
    align: "right",
    sortValue: (row) => row.restante,
    render: (row) => (
      <Typography
        variant="body2"
        fontWeight={700}
        color={
          row.restante < 0
            ? "error.main"
            : row.restante > 0
              ? "success.main"
              : "textSecondary"
        }
      >
        {formatCurrency(row.restante)}
      </Typography>
    ),
  },
];

// ==================== TYPES ====================

interface CustomTableProps {
  data: CategoriaRelatorio[];
  selectedIds: Set<string>;
  onToggle: (idOrIds: string | string[]) => void;
  onSelectItem: (id: number, tipo: "RECEITA" | "DESPESA" | "META") => void;
  itemSelecionadoParaHistorico: string | null;
  pagination: {
    page: number;
    rowsPerPage: number;
    count: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  isLoading?: boolean;
  incluirProjecao: boolean;
  onToggleProjecao: (val: boolean) => void;
}

// ==================== COMPONENTE PRINCIPAL ====================

export function CustomTable({
  data,
  selectedIds,
  onToggle,
  onSelectItem,
  itemSelecionadoParaHistorico,
  pagination,
  isLoading = false,
  incluirProjecao,
  onToggleProjecao,
}: CustomTableProps) {
  // Filtro de projeção client-side
  const dataFiltrada = useMemo(() => {
    if (incluirProjecao) return data;
    return data
      .map((cat) => {
        const detalhesFiltrados = cat.detalhes.filter((d) => !d.isProjecao);
        return {
          ...cat,
          detalhes: detalhesFiltrados,
          valorPlanejado: detalhesFiltrados.reduce(
            (acc, d) => acc + d.valorPlanejado,
            0,
          ),
          valorRealizado: detalhesFiltrados.reduce(
            (acc, d) => acc + d.valorRealizado,
            0,
          ),
          restante: detalhesFiltrados.reduce((acc, d) => acc + d.restante, 0),
        };
      })
      .filter((cat) => cat.detalhes.length > 0); // Remove categorias vazias
  }, [data, incluirProjecao]);

  const { filteredData, filterText, setFilterText } = useTableFilter({
    data: dataFiltrada,
    columns: TABLE_COLUMNS,
  });

  const { sortedData, requestSort, getSortIcon, resetSort } = useMultiSort(
    filteredData,
    TABLE_COLUMNS,
  );

  const handleReset = () => {
    setFilterText("");
    resetSort();
    pagination.onPageChange(null, 0);
  };

  const totalColumns = TABLE_COLUMNS.length + 2;

  const projecaoSwitch = (
    <Tooltip
      title={incluirProjecao ? "Projeções ativadas" : "Ativar projeções"}
      arrow
    >
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={incluirProjecao}
            onChange={(e) => onToggleProjecao(e.target.checked)}
            color="warning"
          />
        }
        label={
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconBolt size={16} />
            <Typography
              variant="caption"
              fontWeight={600}
              color={incluirProjecao ? "warning.main" : "textSecondary"}
            >
              Projeções
            </Typography>
          </Stack>
        }
        sx={{ ml: 0, mr: 0 }}
      />
    </Tooltip>
  );

  return (
    <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
      <TableTopBar
        filterText={filterText}
        onFilterChange={setFilterText}
        onReset={handleReset}
        selectedCount={selectedIds.size}
        leftActions={projecaoSwitch}
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
              <TableCell width={50} />
              <TableCell width={50} />
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
                    <Typography fontWeight={700} variant="subtitle2">
                      {label}
                    </Typography>
                    <MultiSortIcon sortInfo={getSortIcon(key)} />
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={totalColumns} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColumns} align="center" sx={{ py: 3 }}>
                  <Alert severity="info" sx={{ justifyContent: "center" }}>
                    Nenhum dado encontrado para o filtro.
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => (
                <CustomRow
                  key={row.id}
                  row={row}
                  columns={TABLE_COLUMNS}
                  selectedIds={selectedIds}
                  onToggle={onToggle}
                  onSelectItem={onSelectItem}
                  itemSelecionadoParaHistorico={itemSelecionadoParaHistorico}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        sx={{ borderTop: "1px solid", borderColor: "divider" }}
        labelRowsPerPage="Itens por pág."
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count}`
        }
        count={pagination.count}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={pagination.onPageChange}
        onRowsPerPageChange={pagination.onRowsPerPageChange}
        ActionsComponent={CustomPaginationActions}
        rowsPerPage={pagination.rowsPerPage}
        page={pagination.page}
      />
    </Paper>
  );
}

// ==================== ROW DA CATEGORIA ====================

interface CustomRowProps {
  row: CategoriaRelatorio;
  columns: IColumnProps<CategoriaRelatorio>[];
  selectedIds: Set<string>;
  onToggle: (idOrIds: string | string[]) => void;
  onSelectItem: (id: number, tipo: "RECEITA" | "DESPESA" | "META") => void;
  itemSelecionadoParaHistorico: string | null;
}

const CustomRow = memo(function CustomRow({
  row,
  columns,
  selectedIds,
  onToggle,
  onSelectItem,
  itemSelecionadoParaHistorico,
}: CustomRowProps) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const isAllSelected =
    row.detalhes.length > 0 &&
    row.detalhes.every((item) => selectedIds.has(`${item.tipo}-${item.id}`));
  const isIndeterminate =
    !isAllSelected &&
    row.detalhes.some((item) => selectedIds.has(`${item.tipo}-${item.id}`));

  const renderColumn = useMemo(
    () => createRenderColumn(row, columns),
    [row, columns],
  );

  return (
    <>
      <TableRow
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          "& td": { borderBottom: "1px solid", borderColor: "divider" },
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
        }}
      >
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          </IconButton>
        </TableCell>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={isIndeterminate}
            checked={isAllSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggle(row.detalhes.map((i) => `${i.tipo}-${i.id}`));
            }}
          />
        </TableCell>
        {columns.map((col) => {
          const align = col.align || "left";
          return (
            <TableCell key={String(col.key)} align={align}>
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
                {renderColumn(col.key)}
                <MultiSortIcon />
              </Box>
            </TableCell>
          );
        })}
      </TableRow>

      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0, border: 0 }}
          colSpan={columns.length + 2}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <CustomTableChild
              itens={row.detalhes}
              selectedIds={selectedIds}
              onToggle={onToggle}
              onSelectItem={onSelectItem}
              itemSelecionadoParaHistorico={itemSelecionadoParaHistorico}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});
