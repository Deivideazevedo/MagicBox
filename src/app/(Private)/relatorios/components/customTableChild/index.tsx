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
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

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
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            size="small"
            icon={chipIcon}
            label={chipLabel}
            color={chipColor}
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: "0.7rem", height: 24 }}
          />
          <Typography variant="body2">{row.nome}</Typography>
          {row.isProjecao && (
            <Chip
              size="small"
              label="Projeção"
              color="warning"
              sx={{ fontWeight: 600, fontSize: "0.65rem", height: 20, opacity: 0.85 }}
            />
          )}
        </Stack>
      );
    },
    filterValue: (row) => `${row.nome} ${row.tipo}`,
  },
  {
    key: "valorPlanejado",
    label: "Vlr. Estimado",
    align: "right",
    sortValue: (row) => row.valorPlanejado,
    render: (row) => (
      <Typography variant="body2" color="textSecondary">{formatCurrency(row.valorPlanejado)}</Typography>
    ),
  },
  {
    key: "valorRealizado",
    label: "Vlr. Pago",
    align: "right",
    sortValue: (row) => row.valorRealizado,
    render: (row) => (
      <Typography variant="body2" fontWeight={600}>{formatCurrency(row.valorRealizado)}</Typography>
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
        color={row.restante < 0 ? "error.main" : row.restante > 0 ? "success.main" : "textSecondary"}
      >
        {formatCurrency(row.restante)}
      </Typography>
    ),
  },
  {
    key: "mediaMensal",
    label: "Média Mensal",
    align: "right",
    sortValue: (row) => row.mediaMensal,
    render: (row) => (
      <Typography variant="body2" color="textSecondary">{formatCurrency(row.mediaMensal)}</Typography>
    ),
  },
];

// ==================== TYPES ====================

type TipoFiltro = "DESPESA" | "RECEITA" | "META";

interface CustomTableChildProps {
  itens: DetalheRelatorio[];
  selectedIds: Set<string>;
  onToggle: (idOrIds: string | string[]) => void;
  onSelectItem: (id: number, tipo: "RECEITA" | "DESPESA" | "META") => void;
  itemSelecionadoParaHistorico: string | null;
}

// ==================== COMPONENTE PRINCIPAL ====================

export const CustomTableChild = memo(function CustomTableChild({
  itens,
  selectedIds,
  onToggle,
  onSelectItem,
  itemSelecionadoParaHistorico,
}: CustomTableChildProps) {
  const theme = useTheme();
  const [tiposFiltro, setTiposFiltro] = useState<TipoFiltro[]>([]);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);

  // Filtrar por tipo
  const itensFiltradosPorTipo = useMemo(() => {
    if (tiposFiltro.length === 0) return itens;
    return itens.filter(item => tiposFiltro.includes(item.tipo as TipoFiltro));
  }, [itens, tiposFiltro]);

  // Hook de filtro por texto
  const { filteredData, filterText, setFilterText } = useTableFilter({
    data: itensFiltradosPorTipo,
    columns: TABLE_COLUMNS,
  });

  // Ordenação multicoluna
  const { sortedData, requestSort, getSortIcon, resetSort } = useMultiSort(
    filteredData,
    TABLE_COLUMNS,
  );

  const handleReset = useCallback(() => {
    setFilterText("");
    resetSort();
    setTiposFiltro([]);
    setFiltrosVisiveis(false);
  }, [setFilterText, resetSort]);

  const toggleTipo = useCallback((tipo: TipoFiltro) => {
    setTiposFiltro(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    );
  }, []);

  const tiposExistentes = useMemo(() => {
    const tipos = new Set<string>();
    itens.forEach(i => tipos.add(i.tipo));
    return tipos;
  }, [itens]);

  const filtrosAtivos = tiposFiltro.length > 0;

  const filterActions = tiposExistentes.size > 1 ? (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Tooltip title="Filtrar por tipo" arrow>
        <IconButton
          size="small"
          color={filtrosAtivos ? "warning" : "primary"}
          onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
          sx={{
            ...(filtrosAtivos && {
              bgcolor: alpha(theme.palette.warning.main, 0.12),
            }),
          }}
        >
          <IconFilter size={18} />
        </IconButton>
      </Tooltip>

      <Collapse orientation="horizontal" in={filtrosVisiveis}>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 1 }}>
          {tiposExistentes.has("DESPESA") && (
            <Chip
              size="small"
              icon={<IconArrowDown size={12} />}
              label="Despesas"
              color="error"
              variant={tiposFiltro.includes("DESPESA") ? "filled" : "outlined"}
              onClick={() => toggleTipo("DESPESA")}
              sx={{ fontSize: "0.65rem", height: 22, fontWeight: 600, cursor: "pointer" }}
            />
          )}
          {tiposExistentes.has("RECEITA") && (
            <Chip
              size="small"
              icon={<IconArrowUp size={12} />}
              label="Receitas"
              color="success"
              variant={tiposFiltro.includes("RECEITA") ? "filled" : "outlined"}
              onClick={() => toggleTipo("RECEITA")}
              sx={{ fontSize: "0.65rem", height: 22, fontWeight: 600, cursor: "pointer" }}
            />
          )}
          {tiposExistentes.has("META") && (
            <Chip
              size="small"
              icon={<IconTarget size={12} />}
              label="Metas"
              color="info"
              variant={tiposFiltro.includes("META") ? "filled" : "outlined"}
              onClick={() => toggleTipo("META")}
              sx={{ fontSize: "0.65rem", height: 22, fontWeight: 600, cursor: "pointer" }}
            />
          )}
        </Stack>
      </Collapse>
    </Stack>
  ) : null;

  const totalColumns = TABLE_COLUMNS.length + 2;

  return (
    <Box sx={{ mx: 0, mb: 0 }}>
      <TableTopBar
        filterText={filterText}
        onFilterChange={setFilterText}
        onReset={handleReset}
        selectedCount={0}
        leftActions={filterActions}
      />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" width={50} />
            <TableCell padding="checkbox" width={50} />
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
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
                  <Typography variant="caption" fontWeight={700}>{label}</Typography>
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
                <Typography variant="body2" color="textSecondary">Nenhum item encontrado</Typography>
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item) => (
              <ChildRow
                key={`${item.tipo}-${item.id}`}
                item={item}
                isSelected={selectedIds.has(`${item.tipo}-${item.id}`)}
                isHistoricoActive={itemSelecionadoParaHistorico === `${item.tipo}-${item.id}`}
                onToggle={onToggle}
                onSelectItem={onSelectItem}
              />
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
});

// ==================== ROW FILHA MEMOIZADA ====================

interface ChildRowProps {
  item: DetalheRelatorio;
  isSelected: boolean;
  isHistoricoActive: boolean;
  onToggle: (idOrIds: string | string[]) => void;
  onSelectItem: (id: number, tipo: "RECEITA" | "DESPESA" | "META") => void;
}

const ChildRow = memo(function ChildRow({
  item,
  isSelected,
  isHistoricoActive,
  onToggle,
  onSelectItem,
}: ChildRowProps) {
  const theme = useTheme();

  return (
    <TableRow
      hover
      selected={isHistoricoActive}
      onClick={() => {
        onToggle(`${item.tipo}-${item.id}`);
      }}
      sx={{
        cursor: "pointer",
        "& td": { borderBottom: "1px solid", borderColor: "divider" },
        "&:last-child td": { borderBottom: 0 },
        ...(isSelected && { bgcolor: alpha(theme.palette.primary.main, 0.08) }),
        ...(isHistoricoActive && {
          bgcolor: alpha(theme.palette.info.main, 0.08),
          borderLeft: `3px solid ${theme.palette.info.main}`,
        }),
      }}
    >
      <TableCell padding="checkbox" sx={{ width: 50 }} />
      <TableCell
        padding="checkbox"
        sx={{ width: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onChange={() => onToggle(`${item.tipo}-${item.id}`)}
          size="small"
        />
      </TableCell>
      {TABLE_COLUMNS.map((c) => (
        <TableCell key={String(c.key)} align={c.align || "left"}>
          {c.render ? c.render(item) : String(item[c.key as keyof DetalheRelatorio] ?? "-")}
        </TableCell>
      ))}
    </TableRow>
  );
}, (prev, next) => {
  return prev.item.id === next.item.id
    && prev.item.tipo === next.item.tipo
    && prev.isSelected === next.isSelected
    && prev.isHistoricoActive === next.isHistoricoActive;
});
