"use client";

import {
  Alert,
  Box,
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
  LinearProgress,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { ReactNode, useState, useEffect, useMemo, memo, useCallback } from "react";
import {
  IconClock,
  IconUser,
  IconBolt,
} from "@tabler/icons-react";

import { IActionConfig } from "@/app/components/tables/customTable/types/actions";

// Hooks e componentes internos locais (copiados e isolados para notificações)
import { MultiSortIcon } from "./components/MultiSortIcon";
import { TableTopBar } from "./components/TableTopBar";
import { ActionsIconMode } from "./components/ActionsIconMode";
import { useMultiSort } from "./hooks/useMultiSort";
import { useTableFilter } from "./hooks/useTableFilter";
import { CustomPaginationActions } from "./components/CustomPaginationActions";
import { createRenderColumn, IColumnProps } from "./utils/renderColumn";

// ==================== TYPES ====================

export interface NotificationUserLog {
  id: number;
  logId: number;
  userId: number;
  canal: "EMAIL" | "SMS" | "WHATSAPP";
  status: "ENVIADO" | "FALHOU" | "BARRADO";
  mensagemErro: string | null;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
  };
}

export interface NotificationLog {
  id: number;
  origem: string;
  status: string;
  previstos: number;
  enviados: number;
  mensagemErro: string | null;
  createdAt: string;
  updatedAt: string;
  detalhes?: NotificationUserLog[];
}

interface CustomTableProps {
  data: NotificationLog[];
  actions: IActionConfig<NotificationLog>[];
  pagination: {
    page: number;
    rowsPerPage: number;
    count: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  isLoading?: boolean;
  isFetching?: boolean;
  emptyMessage?: string;
}

// ==================== COLUNAS DINÂMICAS ====================

const TABLE_COLUMNS: IColumnProps<NotificationLog>[] = [
  {
    key: "createdAt",
    label: "Início / Fim",
    align: "left",
    sortValue: (row) => new Date(row.createdAt).getTime(),
    render: (row) => {
      const dataInicio = new Date(row.createdAt).toLocaleString("pt-BR");
      const dataFim = row.status !== "PENDENTE" && row.updatedAt
        ? new Date(row.updatedAt).toLocaleTimeString("pt-BR")
        : "";
      return (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ color: "text.primary" }}>
            {dataInicio}
          </Typography>
          {dataFim && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.2 }}>
              Até: {dataFim}
            </Typography>
          )}
          {row.status === "PENDENTE" && (
            <Typography variant="caption" color="warning.main" sx={{ display: "block", mt: 0.2, fontWeight: 600 }}>
              Processando...
            </Typography>
          )}
        </Box>
      );
    },
    filterValue: (row) => new Date(row.createdAt).toLocaleString("pt-BR"),
  },
  {
    key: "origem",
    label: "Origem",
    align: "left",
    sortValue: (row) => row.origem,
    render: (row) => (
      <Chip
        label={row.origem === "CRON" ? "Automático" : "Manual"}
        size="small"
        variant="outlined"
        color={row.origem === "CRON" ? "info" : "default"}
        icon={
          row.origem === "CRON" ? (
            <IconBolt size={13} />
          ) : (
            <IconUser size={13} />
          )
        }
        sx={{ fontWeight: 600, height: 22, fontSize: "11px" }}
      />
    ),
    filterValue: (row) => (row.origem === "CRON" ? "Automático" : "Manual"),
  },
  {
    key: "envios",
    label: "Envios (Sucesso / Total)",
    align: "center",
    sortValue: (row) => row.enviados,
    render: (row) => (
      <Typography variant="body2" fontWeight={700}>
        <Typography
          component="span"
          variant="body2"
          fontWeight={700}
          color={row.enviados > 0 ? "success.main" : "text.primary"}
        >
          {row.enviados}
        </Typography>
        {" / "}
        <Typography component="span" variant="body2" fontWeight={700} color="text.secondary">
          {row.previstos}
        </Typography>
      </Typography>
    ),
    filterValue: (row) => `${row.enviados} / ${row.previstos}`,
  },
  {
    key: "status",
    label: "Status",
    align: "left",
    sortValue: (row) => row.status,
    render: (row) => (
      <Chip
        label={row.status}
        size="small"
        color={
          row.status === "ENVIADO"
            ? "success"
            : row.status === "FALHOU"
            ? "error"
            : "warning"
        }
        sx={{ fontWeight: 700, height: 20, fontSize: "10px" }}
      />
    ),
    filterValue: (row) => row.status,
  },
  {
    key: "duracao",
    label: "Duração",
    align: "center",
    sortValue: (row) => {
      if (row.status === "PENDENTE") return 999999;
      const diffMs = new Date(row.updatedAt).getTime() - new Date(row.createdAt).getTime();
      return diffMs;
    },
    render: (row) => {
      if (row.status === "PENDENTE") {
        return (
          <Typography variant="caption" color="text.secondary">
            -
          </Typography>
        );
      }
      const diffMs = new Date(row.updatedAt).getTime() - new Date(row.createdAt).getTime();
      const diffSec = Math.max(0, Math.round(diffMs / 1000));
      return (
        <Box display="inline-flex" alignItems="center" gap={0.5} sx={{ color: "text.secondary" }}>
          <IconClock size={14} />
          <Typography variant="body2">{diffSec}s</Typography>
        </Box>
      );
    },
    filterValue: (row) => {
      if (row.status === "PENDENTE") return "";
      const diffMs = new Date(row.updatedAt).getTime() - new Date(row.createdAt).getTime();
      const diffSec = Math.max(0, Math.round(diffMs / 1000));
      return `${diffSec}s`;
    },
  },
];

export function CustomTable({
  data,
  actions,
  pagination,
  isLoading = false,
  isFetching = false,
  emptyMessage = "Nenhum histórico de disparo encontrado.",
}: CustomTableProps) {
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

  // 🔄 Reset de filtros, ordenação e paginação
  const handleReset = () => {
    setFilterText("");
    resetSort();
    pagination.onPageChange(null, 0);
  };

  // Calcular total de colunas para colSpan (colunas de dados + 1 para ações)
  const totalColumns = TABLE_COLUMNS.length + 1;

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: "hidden",
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
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
              }}
            >
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
                    py: 1.5,
                    "&:hover .sort-icon": {
                      opacity: getSortIcon(key) ? 1 : 0.4,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: align === "center" ? "center" : "flex-start" }}>
                    <Typography fontWeight={700} variant="subtitle2">{label}</Typography>
                    <MultiSortIcon sortInfo={getSortIcon(key)} />
                  </Box>
                </TableCell>
              ))}

              {/* Ações */}
              <TableCell align="center">
                <Typography fontWeight={700} variant="subtitle2">Ações</Typography>
              </TableCell>
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

          {/* Loading indicator */}
          {isLoading && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={totalColumns} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            </TableBody>
          )}

          <TableBody>
            {sortedData.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={totalColumns} align="center" sx={{ py: 3 }}>
                  <Alert
                    severity="info"
                    sx={{ alignItems: "center", justifyContent: "center" }}
                  >
                    {emptyMessage}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : sortedData.length > 0 && !isLoading && (
              sortedData.map((row, index) => (
                <CustomRow
                  key={row.id}
                  row={row}
                  columns={TABLE_COLUMNS}
                  actions={actions}
                  rowIndex={index}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação nativa */}
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
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        onPageChange={pagination.onPageChange}
        onRowsPerPageChange={pagination.onRowsPerPageChange}
        ActionsComponent={CustomPaginationActions}
        rowsPerPage={pagination.rowsPerPage}
        page={pagination.page}
      />
    </Paper>
  );
}

// Componente interno de linha
interface CustomRowProps {
  row: NotificationLog;
  columns: IColumnProps<NotificationLog>[];
  actions: IActionConfig<NotificationLog>[];
  rowIndex?: number;
}

const CustomRow = memo(
  function CustomRow({
    row,
    columns,
    actions,
  }: CustomRowProps) {
    // Helper para renderizar colunas usando a função utilitária
    const renderColumn = useMemo(
      () => createRenderColumn(row, columns),
      [row, columns]
    );

    // Mapa de alinhamentos
    const alignsMap = useMemo(() => {
      const map = new Map<string | keyof NotificationLog, string>();
      columns.forEach(({ key, align }) => map.set(key, align || "left"));
      return map;
    }, [columns]);

    return (
      <TableRow
        sx={{
          "& td": { border: 0 },
          "&:hover": {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
          },
        }}
      >
        {/* Colunas dinâmicas */}
        {columns.map(({ key }) => (
          <TableCell
            key={String(key)}
            align={(alignsMap.get(key) as any) || "left"}
            sx={{ py: 1.2 }}
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
  }
);