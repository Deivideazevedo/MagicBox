"use client";

import {
  Alert,
  alpha,
  Avatar,
  Badge,
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CustomAvatar from "@/components/shared/CustomAvatar";
import { IconMail, IconTrash, IconUser, IconCopy } from "@tabler/icons-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR as ptBRDate } from "date-fns/locale";
import { memo, ReactNode, useMemo, useState } from "react";

// Types
import { User } from "next-auth";

// Hooks e componentes internos (reutilizando os que foram copiados)
import { ActionsListMode } from "./components/ActionsListMode";
import { CustomPaginationActions } from "./components/CustomPaginationActions";
import { MultiSortIcon } from "./components/MultiSortIcon";
import { TableTopBar } from "./components/TableTopBar";
import { useMultiSort } from "./hooks/useMultiSort";
import { useTableFilter } from "./hooks/useTableFilter";
import { createRenderColumn, IColumnProps } from "./utils/renderColumn";

function CopyEmailAction({ email }: { email?: string | null }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (email) {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  if (!email) return null;
  return (
    <Tooltip title={copied ? "E-mail copiado!" : "Copiar e-mail"} arrow placement="top">
      <Box
        onClick={handleCopy}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "6px",
          backgroundColor: "action.hover",
          border: "1px solid",
          borderColor: "divider",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            backgroundColor: "action.selected",
            transform: "translateY(-1px)",
          },
          color: "primary.main",
        }}
      >
        <IconCopy size={14} />
      </Box>
    </Tooltip>
  );
}

// Extensão do tipo User para incluir campos virtuais se necessário
type UserRow = User & { 
  hasPassword?: boolean;
  isOnline?: boolean;
  lastActive?: string | Date | null;
};

interface IActionConfig {
  icon?: ReactNode;
  title: string;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  callback: (row: UserRow) => void;
}

interface CustomTableUsuariosProps {
  data: UserRow[];
  actions: IActionConfig[];
  pagination: {
    page: number;
    rowsPerPage: number;
    count: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    rowsPerPageOptions?: number[];
  };
  isLoading?: boolean;
  isFetching?: boolean;
  emptyMessage?: string;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onBulkDelete: () => void;
  onStatusClick: (user: UserRow) => void;
  onReset: () => void;
}

export function CustomTableUsuarios({
  data,
  actions,
  pagination,
  isLoading = false,
  isFetching = false,
  emptyMessage = "Nenhum usuário encontrado",
  selectedIds,
  onSelectionChange,
  onBulkDelete,
  onStatusClick,
  onReset,
}: CustomTableUsuariosProps) {
  const formatLastActive = (lastActive: string | Date | null | undefined) => {
    if (!lastActive) return "Nunca acessou";
    try {
      const data = new Date(lastActive);
      if (data.getTime() < 10000000000) return "Offline";
      
      const distancia = formatDistanceToNow(data, {
        locale: ptBRDate,
        addSuffix: true,
      });
      return `Visto por último ${distancia}`;
    } catch {
      return "-";
    }
  };

  const TABLE_COLUMNS: IColumnProps<UserRow>[] = [
    {
      key: "name",
      label: "Usuário",
      align: "left",
      sortValue: (row) => row.name || "",
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: row.isOnline ? '#4caf50' : '#9e9e9e',
                color: row.isOnline ? '#4caf50' : '#9e9e9e',
                boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
                width: 10,
                height: 10,
                borderRadius: '50%',
                ...(row.isOnline && {
                  '&::after': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    animation: 'ripple 1.2s infinite ease-in-out',
                    border: '1px solid currentColor',
                    content: '""',
                  },
                }),
              },
              '@keyframes ripple': {
                '0%': { transform: 'scale(.8)', opacity: 1 },
                '100%': { transform: 'scale(2.4)', opacity: 0 },
              },
            }}
          >
            <CustomAvatar
              src={row.image || undefined}
              sx={{ width: 38, height: 38 }}
            />
          </Badge>
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap>
              {row.name || "Sem nome"}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
              <CopyEmailAction email={row.email} />
              <Typography variant="caption" color="textSecondary">
                {row.isOnline ? (
                  <Box component="span" sx={{ color: "success.main", fontWeight: 700 }}>Online</Box>
                ) : (
                  formatLastActive(row.lastActive)
                )}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      ),
      filterValue: (row) => `${row.name || ""} ${row.email || ""} ${row.username || ""}`,
    },
    {
      key: "role",
      label: "Perfil",
      align: "center",
      hideOnMobile: true,
      sortValue: (row) => row.role || "",
      render: (row) => (
        <Chip
          label={row.role === "admin" ? "Administrador" : "Usuário"}
          size="small"
          color={row.role === "admin" ? "primary" : "default"}
          variant="outlined"
          sx={{
            fontWeight: 700,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            borderRadius: 2,
          }}
        />
      ),
      filterValue: (row) => row.role || "",
    },
    {
      key: "status" as any,
      label: "Status",
      align: "center",
      sortValue: (row) => row.status || "",
      render: (row) => (
        <Tooltip title="Clique para alterar o status" arrow>
          <Chip
            label={row.status === "A" ? "Ativo" : "Inativo"}
            size="small"
            color={row.status === "A" ? "success" : "error"}
            onClick={() => onStatusClick(row)}
            sx={{ fontWeight: 700, px: 1, cursor: "pointer", borderRadius: 2 }}
          />
        </Tooltip>
      ),
      filterValue: (row) => (row.status === "A" ? "Ativo" : "Inativo"),
    },
  ];

  const { filteredData, filterText, setFilterText } = useTableFilter({
    data,
    columns: TABLE_COLUMNS,
  });

  const { sortedData, requestSort, getSortIcon, resetSort } = useMultiSort(
    filteredData,
    TABLE_COLUMNS,
  );

  const handleReset = () => {
    setFilterText("");
    resetSort();
    onSelectionChange([]);
    onReset();
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = sortedData.map((row) => row.id);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelectedIds);
  };

  const totalColumns = TABLE_COLUMNS.length + 2;

  // Render do botão de deleção em lote
  const bulkActions = useMemo(() => {
    if (selectedIds.length === 0) return null;
    return (
      <Tooltip title="Excluir usuários selecionados" arrow>
        <IconButton color="error" size="small" onClick={onBulkDelete}>
          <IconTrash size={22} />
        </IconButton>
      </Tooltip>
    );
  }, [selectedIds, onBulkDelete]);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, border: "none" }}>
      <TableTopBar
        filterText={filterText}
        onFilterChange={setFilterText}
        onReset={handleReset}
        bulkActions={bulkActions}
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

              {TABLE_COLUMNS.map(({ key, label, align = "left", hideOnMobile }) => (
                <TableCell
                  key={String(key)}
                  align={align}
                  onClick={() => requestSort(key)}
                  sx={{
                    cursor: "pointer",
                    userSelect: "none",
                    minWidth: 100,
                    ...(hideOnMobile && { display: { xs: 'none', sm: 'table-cell' } }),
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
                        align === "center"
                          ? "center"
                          : align === "right"
                            ? "flex-end"
                            : "flex-start",
                    }}
                  >
                    <Typography fontWeight={700} variant="body2">
                      {label}
                    </Typography>
                    <MultiSortIcon sortInfo={getSortIcon(key)} />
                  </Box>
                </TableCell>
              ))}

              <TableCell align="center">
                <Typography fontWeight={700} variant="body2">
                  Ações
                </Typography>
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

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={totalColumns} align="center" sx={{ py: 3 }}>
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

      <TablePagination
        component="div"
        sx={{ borderTop: "1px solid", borderColor: "divider" }}
        labelRowsPerPage="Linhas por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count}`
        }
        count={pagination.count}
        rowsPerPageOptions={pagination.rowsPerPageOptions || [10, 20, 50, 100]}
        onPageChange={pagination.onPageChange}
        onRowsPerPageChange={pagination.onRowsPerPageChange}
        ActionsComponent={CustomPaginationActions}
        rowsPerPage={pagination.rowsPerPage}
        page={pagination.page}
      />
    </Paper>
  );
}

interface CustomRowProps {
  row: UserRow;
  columns: IColumnProps<UserRow>[];
  actions: IActionConfig[];
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const CustomRow = memo(
  function CustomRow({
    row,
    columns,
    actions,
    isSelected,
    onSelect,
  }: CustomRowProps) {
    const renderColumn = useMemo(
      () => createRenderColumn(row, columns),
      [row, columns],
    );
    const alignsMap = useMemo(() => {
      const map = new Map<string | keyof UserRow, string>();
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
          ...(isSelected && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          }),
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox checked={isSelected} onChange={() => onSelect(row.id)} />
        </TableCell>

        {columns.map(({ key, hideOnMobile }) => (
          <TableCell
            key={String(key)}
            align={(alignsMap.get(key) as any) || "left"}
            sx={{ ...(hideOnMobile && { display: { xs: 'none', sm: 'table-cell' } }) }}
          >
            {renderColumn(key)}
          </TableCell>
        ))}

        <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 0 }}>
          <ActionsListMode row={row as any} actions={actions as any} />
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) =>
    prev.row.id === next.row.id &&
    prev.isSelected === next.isSelected &&
    prev.row.isOnline === next.row.isOnline &&
    prev.row.lastActive === next.row.lastActive,
);
