"use client";

import React, { useState, useMemo, memo, useCallback } from "react";
import {
  Box,
  Checkbox,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  alpha,
  Stack,
  useTheme,
  IconButton,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  IconArrowDown,
  IconArrowUp,
  IconTarget,
  IconFilter,
} from "@tabler/icons-react";

// Types
import { DetalheRelatorio } from "@/core/relatorios/relatorio.dto";

// Hooks internos (herdados)
import { MultiSortIcon } from "./components/MultiSortIcon";
import { TableTopBar } from "./components/TableTopBar";
import { useMultiSort } from "./hooks/useMultiSort";
import { useTableFilter } from "./hooks/useTableFilter";
import { IColumnProps } from "./utils/renderColumn";

// ==================== COLUNAS DINÂMICAS ====================

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

const formatDelta = (value: number) => {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
};

const TABLE_COLUMNS: IColumnProps<DetalheRelatorio>[] = [
  {
    key: "nome",
    label: "Item",
    align: "left",
    sortValue: (row) => row.nome,
    render: (row) => {
      const isDespesa = row.tipo === "DESPESA";
      const isMeta = row.tipo === "META";

      let chipIcon = <IconArrowUp size={14} />;
      let chipColor: any = "success";
      let chipLabel = "Receita";

      if (isDespesa) {
        chipIcon = <IconArrowDown size={14} />;
        chipColor = "error";
        chipLabel = "Despesa";
      } else if (isMeta) {
        chipIcon = <IconTarget size={14} />;
        chipColor = "info";
        chipLabel = "Meta";
      }

      return (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Chip
            icon={chipIcon}
            label={chipLabel}
            color={chipColor}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: 11, height: 22 }}
          />
          <Typography variant="body2" fontWeight={500}>
            {row.nome}
          </Typography>
        </Stack>
      );
    },
    filterValue: (row) => `${row.nome} ${row.tipo}`,
  },
  {
    key: "valorPlanejado",
    label: "Previsto",
    align: "right",
    sortValue: (row) => row.valorPlanejado,
    render: (row) => (
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ whiteSpace: "nowrap" }}
      >
        {formatCurrency(row.valorPlanejado)}
      </Typography>
    ),
  },
  {
    key: "valorRealizado",
    label: "Realizado",
    align: "right",
    sortValue: (row) => row.valorRealizado,
    render: (row) => (
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ whiteSpace: "nowrap" }}
      >
        {formatCurrency(row.valorRealizado)}
      </Typography>
    ),
  },
  {
    key: "restante",
    label: "Diferença",
    align: "right",
    sortValue: (row) => row.restante,
    render: (row) => (
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ whiteSpace: "nowrap" }}
        color={
          row.restante > 0
            ? "success.main"
            : row.restante < 0
              ? "error.main"
              : "textSecondary"
        }
      >
        {formatDelta(row.restante)}
      </Typography>
    ),
  },
  {
    key: "mediaMensal",
    label: "Média Mensal",
    align: "right",
    sortValue: (row) => row.mediaMensal,
    render: (row) => (
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ whiteSpace: "nowrap" }}
      >
        {formatCurrency(row.mediaMensal)}
      </Typography>
    ),
  },
];

// ==================== TYPES ====================

type TipoFiltro = "DESPESA" | "RECEITA" | "META";

interface CustomTableChildProps {
  itens: DetalheRelatorio[];
  selectedIds: Set<string>;
  onToggle: (idOrIds: string | string[], forceState?: boolean) => void;
  onSelectItem: (id: number, tipo: "RECEITA" | "DESPESA" | "META") => void;
  itemSelecionadoParaHistorico: string | null;
  filterText?: string;
  resetToggle?: number;
}

// ==================== COMPONENTE PRINCIPAL ====================

export const CustomTableChild = memo(function CustomTableChild({
  itens,
  selectedIds,
  onToggle,
  onSelectItem,
  itemSelecionadoParaHistorico,
  filterText: parentFilterText = "",
  resetToggle = 0,
}: CustomTableChildProps) {
  const theme = useTheme();
  // Hook de filtro por texto
  const { filteredData, setFilterText } = useTableFilter({
    data: itens,
    columns: TABLE_COLUMNS,
  });

  // Sincroniza busca com o pai
  React.useEffect(() => {
    setFilterText(parentFilterText);
  }, [parentFilterText, setFilterText]);

  // Ordenação multicoluna
  const { sortedData, requestSort, getSortIcon, resetSort } = useMultiSort(
    filteredData,
    TABLE_COLUMNS,
  );

  // Reseta ordenação quando o pai disparar reset
  React.useEffect(() => {
    if (resetToggle > 0) {
      resetSort();
    }
  }, [resetToggle, resetSort]);

  const totalColumns = TABLE_COLUMNS.length + 2;

  return (
    <Box sx={{ mx: 0, mb: 0 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" sx={{ width: 48 }} />
            {TABLE_COLUMNS.map(({ key, label, align = "left" }) => (
              <TableCell
                key={String(key)}
                align={align}
                onClick={() => requestSort(key)}
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  "&:hover .sort-icon": { opacity: getSortIcon(key) ? 1 : 0.4 },
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
                  <Typography variant="caption" fontWeight={700}>
                    {label}
                  </Typography>
                  <MultiSortIcon sortInfo={getSortIcon(key)} />
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumns} align="center" sx={{ py: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Nenhum item encontrado
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item) => {
              const id = `${item.tipo}-${item.id}`;
              const isSelected = selectedIds.has(id);
              const isHistoricoActive = itemSelecionadoParaHistorico === id;

              return (
                <TableRow
                  key={id}
                  hover
                  selected={isHistoricoActive}
                  onClick={() => {
                    onToggle(id);
                  }}
                  sx={{
                    cursor: "pointer",
                    "& td": {
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    },
                    "&:last-child td": { borderBottom: 0 },
                    ...(isSelected && {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    }),
                    ...(isHistoricoActive && {
                      bgcolor: alpha(theme.palette.info.main, 0.08),
                      borderLeft: `3px solid ${theme.palette.info.main}`,
                    }),
                  }}
                >
                  <TableCell
                    padding="checkbox"
                    sx={{ width: 48 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onToggle(id)}
                      size="small"
                      sx={{ "& .MuiSvgIcon-root": { fontSize: 18 } }}
                    />
                  </TableCell>
                  {TABLE_COLUMNS.map((c) => {
                    const align = c.align || "left";
                    return (
                      <TableCell key={String(c.key)} align={align}>
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
                          {c.render
                            ? c.render(item)
                            : String(
                                item[c.key as keyof DetalheRelatorio] ?? "-",
                              )}
                          <MultiSortIcon />
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Box>
  );
});

CustomTableChild.displayName = "CustomTableChild";


