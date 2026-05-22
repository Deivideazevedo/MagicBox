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
  LinearProgress,
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
  Chip,
  Badge,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  Divider,
} from "@mui/material";
import React, { useState, useMemo, memo, useEffect } from "react";
import {
  IconCategory,
  IconChevronDown,
  IconChevronUp,
  IconBolt,
  IconArrowDown,
  IconArrowUp,
  IconTarget,
  IconFilter,
  IconAdjustmentsHorizontal,
  IconSearch,
  IconX,
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
    label: "Categoria",
    align: "left",
    sortValue: (row) => row.nome,
    render: (row) => {
      const iconeStr = row.icone;
      const corStr = row.cor;

      return (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: corStr ? alpha(corStr, 0.15) : "primary.light",
              color: corStr || "primary.main",
              "& svg": { width: 16, height: 16 },
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
    filterValue: (row) =>
      `${row.nome} ${row.detalhes.map((d) => d.nome).join(" ")}`,
  },
  {
    key: "valorPlanejado",
    label: "Previsto",
    align: "right",
    sortValue: (row) => row.valorPlanejado,
    render: (row) => (
      <Typography
        variant="body2"
        fontWeight={600}
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
        fontWeight={700}
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
          row.restante < 0
            ? "error.main"
            : row.restante > 0
              ? "success.main"
              : "textSecondary"
        }
      >
        {(() => {
          const abs = Math.abs(row.restante);
          const formatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(abs);
          if (row.restante > 0) return `+${formatted}`;
          if (row.restante < 0) return `-${formatted}`;
          return formatted;
        })()}
      </Typography>
    ),
  },
];

// ==================== TYPES ====================

interface CustomTableProps {
  data: CategoriaRelatorio[];
  selectedIds: Set<string>;
  onToggle: (idOrIds: string | string[], forceState?: boolean) => void;
  onSelectItem: (id: number, tipo: "RECEITA" | "DESPESA" | "META") => void;
  itemSelecionadoParaHistorico: string | null;
  isLoading?: boolean;
  isFetching?: boolean;
  tiposFiltro: string[];
  onToggleTipo: (tipo: string) => void;
  onResetFilters: () => void;
  tiposExistentes: Set<string>;
  incluirProjecao: boolean;
  onToggleProjecao: (value: boolean) => void;
}

// ==================== COMPONENTE PRINCIPAL ====================

export function CustomTable({
  data,
  selectedIds,
  onToggle,
  onSelectItem,
  itemSelecionadoParaHistorico,
  isLoading = false,
  isFetching = false,
  tiposFiltro,
  onToggleTipo,
  onResetFilters,
  tiposExistentes,
  incluirProjecao,
  onToggleProjecao,
}: CustomTableProps) {
  const theme = useTheme();
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);
  const [resetToggle, setResetToggle] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Filtro de projeção e tipo client-side
  const dataFiltrada = useMemo(() => {
    return data
      .map((cat) => {
        const detalhesFiltrados = cat.detalhes
          .map((d) => {
            if (!incluirProjecao && d.tipo !== "META") {
              const novoPlanejado = d.valorAgendado;
              return {
                ...d,
                valorPlanejado: novoPlanejado,
                restante: d.valorRealizado - novoPlanejado,
              };
            }
            return d;
          })
          .filter((d) => {
            const matchesProjecao = incluirProjecao ? true : !d.isProjecao;
            const matchesTipo =
              tiposFiltro.length === 0 || tiposFiltro.includes(d.tipo);
            return matchesProjecao && matchesTipo;
          });

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
  }, [data, incluirProjecao, tiposFiltro]);

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
    onToggleProjecao(true);
    onResetFilters();
    setResetToggle((prev) => prev + 1);
    setDrawerOpen(false);
  };

  const allVisibleIds = useMemo(() => {
    return sortedData.flatMap((cat) =>
      cat.detalhes.map((d) => `${d.tipo}-${d.id}`),
    );
  }, [sortedData]);

  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.has(id));
  const isSomeSelected = allVisibleIds.some((id) => selectedIds.has(id));
  const isIndeterminate = isSomeSelected && !isAllSelected;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(allVisibleIds, e.target.checked);
  };

  const totalColumns = TABLE_COLUMNS.length + 2;
  const badgeCount = isMobile
    ? tiposFiltro.length + (incluirProjecao ? 1 : 0)
    : tiposFiltro.length;

  const projecaoSwitch = (
    <Tooltip
      title={incluirProjecao ? "Projeções ativadas" : "Ativar projeções"}
      arrow
    >
      <FormControlLabel
        labelPlacement="start"
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
            <IconBolt
              size={20}
              color={
                incluirProjecao
                  ? theme.palette.warning.main
                  : theme.palette.text.secondary
              }
            />
            {!isMobile && (
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  whiteSpace: "nowrap",
                  color: incluirProjecao
                    ? theme.palette.warning.main
                    : theme.palette.text.secondary,
                }}
              >
                Projeções
              </Typography>
            )}
          </Stack>
        }
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
    </Tooltip>
  );

  const selectedTotals = useMemo(() => {
    const isAnySelected = selectedIds.size > 0;

    // Se nada selecionado, usamos o total do que está visível (com filtros)
    if (!isAnySelected) {
      return {
        categorias: sortedData.length,
        itens: sortedData.reduce((acc, curr) => acc + curr.detalhes.length, 0),
        previsto: sortedData.reduce((acc, c) => acc + c.valorPlanejado, 0),
        pago: sortedData.reduce((acc, c) => acc + c.valorRealizado, 0),
      };
    }

    // Se houver seleção, calculamos apenas sobre os selecionados
    // Pegamos todos os detalhes de todas as categorias filtradas e verificamos se estão selecionados
    const allItems = dataFiltrada.flatMap((cat) => cat.detalhes);
    const filteredSelected = allItems.filter((item) =>
      selectedIds.has(`${item.tipo}-${item.id}`),
    );

    // Categorias únicas entre os itens selecionados
    // Percorremos dataFiltrada e vemos quais categorias têm pelo menos um detalhe selecionado
    const categoriesWithSelected = dataFiltrada.filter((cat) =>
      cat.detalhes.some((d) => selectedIds.has(`${d.tipo}-${d.id}`)),
    );

    return {
      categorias: categoriesWithSelected.length,
      itens: filteredSelected.length,
      previsto: filteredSelected.reduce(
        (acc, item) => acc + item.valorPlanejado,
        0,
      ),
      pago: filteredSelected.reduce(
        (acc, item) => acc + item.valorRealizado,
        0,
      ),
    };
  }, [sortedData, selectedIds, dataFiltrada]);

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.2),
        overflow: "hidden",
        bgcolor: "background.paper",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          borderColor: alpha(theme.palette.primary.main, 0.25),
        },
      }}
    >
      <TableTopBar
        filterText={filterText}
        onFilterChange={setFilterText}
        onReset={handleReset}
        selectedCount={selectedIds.size}
        leftActions={
          <Stack
            direction="row"
            spacing={isMobile ? 0.5 : 1}
            alignItems="center"
          >
            {isMobile ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Tooltip title="Filtrar por tipo" arrow>
                  <IconButton
                    size="small"
                    color={tiposFiltro.length > 0 ? "warning" : "primary"}
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                      ...(tiposFiltro.length > 0 && {
                        bgcolor: alpha(theme.palette.warning.main, 0.12),
                      }),
                    }}
                  >
                    <Badge
                      badgeContent={badgeCount}
                      color="warning"
                      invisible={badgeCount === 0}
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.6rem",
                          height: 16,
                          minWidth: 16,
                          width: 16,
                          borderRadius: "50%",
                          top: -4,
                          right: -4,
                          padding: 0,
                          fontWeight: 800,
                          border: `1px solid ${theme.palette.background.paper}`,
                        },
                      }}
                    >
                      <IconAdjustmentsHorizontal size={20} />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Stack>
            ) : (
              <Stack direction="row" spacing={0.75} alignItems="center">
                {tiposExistentes.has("DESPESA") && (
                  <Chip
                    size="small"
                    icon={<IconArrowDown size={14} />}
                    label="Despesas"
                    color="error"
                    variant={
                      tiposFiltro.includes("DESPESA")
                        ? "filled"
                        : "outlined"
                    }
                    onClick={() => onToggleTipo("DESPESA")}
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 24,
                      cursor: "pointer",
                      "& .MuiChip-icon": {
                        color: "inherit",
                      },
                    }}
                  />
                )}
                {tiposExistentes.has("RECEITA") && (
                  <Chip
                    size="small"
                    icon={<IconArrowUp size={14} />}
                    label="Receitas"
                    color="success"
                    variant={
                      tiposFiltro.includes("RECEITA")
                        ? "filled"
                        : "outlined"
                    }
                    onClick={() => onToggleTipo("RECEITA")}
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 24,
                      cursor: "pointer",
                      "& .MuiChip-icon": {
                        color: "inherit",
                      },
                    }}
                  />
                )}
                {tiposExistentes.has("META") && (
                  <Chip
                    size="small"
                    icon={<IconTarget size={14} />}
                    label="Metas"
                    color="info"
                    variant={
                      tiposFiltro.includes("META") ? "filled" : "outlined"
                    }
                    onClick={() => onToggleTipo("META")}
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 24,
                      cursor: "pointer",
                      "& .MuiChip-icon": {
                        color: "inherit",
                      },
                    }}
                  />
                )}
              </Stack>
            )}
          </Stack>
        }
      />

      {/* Drawer de Filtros Mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            p: 0,
            backgroundImage: "none",
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        {drawerOpen && (
          <>
            <Box
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Filtros e Opções
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Ajuste a visualização dos dados.
                </Typography>
              </Box>
              <IconButton
                onClick={() => setDrawerOpen(false)}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                  borderRadius: "50%",
                }}
              >
                <IconX size={20} color={theme.palette.primary.main} />
              </IconButton>
            </Box>

            <Divider />

            <List sx={{ p: 2 }}>
              <ListItem disablePadding sx={{ mb: 4, display: "block" }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="primary"
                  gutterBottom
                  sx={{
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: 1,
                  }}
                >
                  Exibir
                </Typography>
                <Box
                  onClick={() => onToggleProjecao(!incluirProjecao)}
                  sx={{
                    mt: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    cursor: "pointer",
                    p: 1,
                    mx: -1,
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: incluirProjecao
                        ? alpha(theme.palette.warning.main, 0.05)
                        : alpha(theme.palette.text.secondary, 0.05),
                    },
                    border: `1px solid ${incluirProjecao ? theme.palette.warning.main : theme.palette.text.secondary}`,
                  }}
                >
                  <IconBolt
                    size={20}
                    color={
                      incluirProjecao
                        ? theme.palette.warning.main
                        : theme.palette.text.secondary
                    }
                  />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      flexGrow: 1,
                      color: incluirProjecao
                        ? theme.palette.warning.main
                        : theme.palette.text.secondary,
                    }}
                  >
                    Projeções
                  </Typography>
                  <Switch
                    size="small"
                    checked={incluirProjecao}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleProjecao(e.target.checked);
                    }}
                    color="warning"
                  />
                </Box>
              </ListItem>

              <ListItem disablePadding sx={{ display: "block" }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="primary"
                  gutterBottom
                  sx={{
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: 1,
                  }}
                >
                  Filtrar:
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  {tiposExistentes.has("DESPESA") && (
                    <Chip
                      icon={<IconArrowDown size={14} />}
                      label="Despesas"
                      color="error"
                      variant={
                        tiposFiltro.includes("DESPESA") ? "filled" : "outlined"
                      }
                      onClick={() => onToggleTipo("DESPESA")}
                      sx={{
                        fontWeight: 600,
                        justifyContent: "flex-start",
                        px: 1,
                        height: 36,
                      }}
                    />
                  )}
                  {tiposExistentes.has("RECEITA") && (
                    <Chip
                      icon={<IconArrowUp size={14} />}
                      label="Receitas"
                      color="success"
                      variant={
                        tiposFiltro.includes("RECEITA") ? "filled" : "outlined"
                      }
                      onClick={() => onToggleTipo("RECEITA")}
                      sx={{
                        fontWeight: 600,
                        justifyContent: "flex-start",
                        px: 1,
                        height: 36,
                      }}
                    />
                  )}
                  {tiposExistentes.has("META") && (
                    <Chip
                      icon={<IconTarget size={14} />}
                      label="Metas"
                      color="info"
                      variant={tiposFiltro.includes("META") ? "filled" : "outlined"}
                      onClick={() => onToggleTipo("META")}
                      sx={{
                        fontWeight: 600,
                        justifyContent: "flex-start",
                        px: 1,
                        height: 36,
                      }}
                    />
                  )}
                </Stack>
              </ListItem>
            </List>

            <Box
              sx={{
                mt: "auto",
                p: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Chip
                label="Resetar"
                variant="outlined"
                onClick={handleReset}
                sx={{
                  width: "100%",
                  py: 2.5,
                  fontWeight: 800,
                  borderRadius: 2,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: theme.palette.primary.main,
                  },
                }}
              />
            </Box>
          </>
        )}
      </Drawer>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: (theme) =>
                  alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <TableCell
                colSpan={2}
                align="center"
                sx={{ width: 100, py: 1.5 }}
              >
                <Tooltip title="Selecionar todos" arrow>
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    size="medium"
                    sx={{ p: 0.5 }}
                  />
                </Tooltip>
              </TableCell>
              {TABLE_COLUMNS.map(({ key, label, align = "left" }) => (
                <TableCell
                  key={String(key)}
                  align={align}
                  onClick={() => requestSort(key)}
                  sx={{
                    cursor: "pointer",
                    userSelect: "none",
                    py: 1.5,
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

            {isFetching && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  sx={{
                    p: 0,
                    border: 0,
                    position: "relative",
                  }}
                >
                  <LinearProgress
                    sx={{
                      height: 5,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                    }}
                  />
                </TableCell>
              </TableRow>
            )}
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
                  filterText={filterText}
                  resetToggle={resetToggle}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          p: 1.5,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.background.paper, 0.4),
        }}
      >
        <Typography
          variant="caption"
          fontWeight={800}
          color="textSecondary"
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          {selectedIds.size > 0 ? "Selecionado: " : "Total: "}
          {selectedTotals.categorias} categorias | {selectedTotals.itens} itens
        </Typography>
        <Stack direction="row" spacing={2}>
          <Typography variant="caption" fontWeight={800} color="textSecondary">
            Previsto: {formatCurrency(selectedTotals.previsto)}
          </Typography>
          <Typography variant="caption" fontWeight={800} color="primary.main">
            Realizado: {formatCurrency(selectedTotals.pago)}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}

// ==================== ROW DA CATEGORIA ====================

interface CustomRowProps {
  row: CategoriaRelatorio;
  columns: IColumnProps<CategoriaRelatorio>[];
  selectedIds: Set<string>;
  onToggle: (idOrIds: string | string[], forceState?: boolean) => void;
  onSelectItem: (id: number, tipo: "RECEITA" | "DESPESA" | "META") => void;
  itemSelecionadoParaHistorico: string | null;
  filterText: string;
  resetToggle: number;
}

const CustomRow = memo(function CustomRow({
  row,
  columns,
  selectedIds,
  onToggle,
  onSelectItem,
  itemSelecionadoParaHistorico,
  filterText,
  resetToggle,
}: CustomRowProps) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  // Expansão automática ao pesquisar se houver itens filhos que batem com o filtro
  useEffect(() => {
    const query = filterText.trim().toLowerCase();
    if (query.length > 0) {
      const hasMatchingChild = row.detalhes.some((d) =>
        d.nome.toLowerCase().includes(query),
      );
      if (hasMatchingChild) {
        setOpen(true);
      }
    }
  }, [filterText, row.detalhes]);

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
        <TableCell sx={{ width: 60, py: 0.5, px: 1 }}>
          <Tooltip
            title={open ? "Recolher Categoria" : "Expandir Categoria"}
            placement="left"
            arrow
            disableInteractive
            TransitionProps={{ timeout: 0 }}
            PopperProps={{
              popperOptions: {
                strategy: "fixed",
                modifiers: [
                  {
                    name: "computeStyles",
                    options: {
                      adaptive: false,
                      gpuAcceleration: false,
                    },
                  },
                  {
                    name: "flip",
                    enabled: false,
                  },
                  {
                    name: "preventOverflow",
                    options: {
                      boundary: "window",
                    },
                  },
                ],
              },
            }}
          >
            <Box
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.main,
                borderRadius: 1.5,
                px: 1,
                pr: 0.5,
                py: 0,
                cursor: "pointer",
                width: 50,
                height: 26,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                },
              }}
            >
              <Typography variant="caption" fontWeight="bold" sx={{ mr: 0.5 }}>
                {row.detalhes.length}
              </Typography>
              <IconChevronDown
                size={16}
                stroke={3}
                style={{
                  transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.3s ease",
                }}
              />
            </Box>
          </Tooltip>
        </TableCell>
        <TableCell padding="checkbox" sx={{ width: 38, py: 0.5 }}>
          <Checkbox
            indeterminate={isIndeterminate}
            checked={isAllSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggle(row.detalhes.map((i) => `${i.tipo}-${i.id}`));
            }}
            size="small"
          />
        </TableCell>
        {columns.map((col) => {
          const align = col.align || "left";
          return (
            <TableCell key={String(col.key)} align={align} sx={{ py: 0.5 }}>
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
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            sx={{ border: "none", bgcolor: "transparent" }}
          >
            <Box sx={{ pt: 1, pb: 2 }}>
              <CustomTableChild
                itens={row.detalhes}
                selectedIds={selectedIds}
                onToggle={onToggle}
                onSelectItem={onSelectItem}
                itemSelecionadoParaHistorico={itemSelecionadoParaHistorico}
                filterText={filterText}
                resetToggle={resetToggle}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});
