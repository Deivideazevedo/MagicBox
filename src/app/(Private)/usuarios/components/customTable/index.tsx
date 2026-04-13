"use client";

import {
  Alert,
  alpha,
  Avatar,
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
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
import {
  IconMail,
  IconTrash,
  IconUser
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR as ptBRDate } from "date-fns/locale";
import { memo, ReactNode, useMemo } from "react";

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

// Extensão do tipo User para incluir campos virtuais se necessário
type UserRow = User & { hasPassword?: boolean };

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
  emptyMessage = "Nenhum usuário encontrado",
  selectedIds,
  onSelectionChange,
  onBulkDelete,
  onStatusClick,
  onReset,
}: CustomTableUsuariosProps) {

  const TABLE_COLUMNS: IColumnProps<UserRow>[] = [
    {
      key: "name",
      label: "Usuário",
      align: "left",
      sortValue: (row) => row.name || "",
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CustomAvatar
            src={row.image || undefined}
            sx={{ width: 32, height: 32 }}
          />
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap>
              {row.name || "Sem nome"}
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              ID: {row.id}
            </Typography>
          </Box>
        </Stack>
      ),
      filterValue: (row) => row.name || "",
    },
    {
      key: "email",
      label: "Email",
      align: "left",
      sortValue: (row) => row.email || "",
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <IconMail size={16} color="#777" />
          <Typography variant="body2" noWrap>
            {row.email || "-"}
          </Typography>
        </Stack>
      ),
      filterValue: (row) => row.email || "",
    },
    {
      key: "username",
      label: "Username",
      align: "left",
      sortValue: (row) => row.username || "",
      render: (row) => (
        <Typography variant="body2" color="textSecondary">
          @{row.username || "-"}
        </Typography>
      ),
      filterValue: (row) => row.username || "",
    },
    {
      key: "role",
      label: "Role",
      align: "center",
      sortValue: (row) => row.role || "",
      render: (row) => (
        <Chip
          label={row.role || "usuario"}
          size="small"
          color={row.role === "admin" ? "primary" : "default"}
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase" }}
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
            sx={{ fontWeight: 700, px: 1, cursor: "pointer" }}
          />
        </Tooltip>
      ),
      filterValue: (row) => row.status === "A" ? "Ativo" : "Inativo",
    },
    {
      key: "createdAt",
      label: "Criado em",
      align: "right",
      sortValue: (row) => new Date(row.createdAt).getTime(),
      render: (row) => {
        try {
          return format(new Date(row.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBRDate });
        } catch {
          return "-";
        }
      },
      filterValue: (row) => row.createdAt.toString(),
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
            <TableRow sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length}
                  checked={sortedData.length > 0 && selectedIds.length === sortedData.length}
                  onChange={handleSelectAll}
                />
              </TableCell>

              {TABLE_COLUMNS.map(({ key, label, align = "left" }) => (
                <TableCell
                  key={String(key)}
                  align={align}
                  onClick={() => requestSort(key)}
                  sx={{
                    cursor: "pointer",
                    userSelect: "none",
                    minWidth: 100,
                    "&:hover .sort-icon": { opacity: getSortIcon(key) ? 1 : 0.4 },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start" }}>
                    <Typography fontWeight={700} variant="body2">{label}</Typography>
                    <MultiSortIcon sortInfo={getSortIcon(key)} />
                  </Box>
                </TableCell>
              ))}

              <TableCell align="center">
                <Typography fontWeight={700} variant="body2">Ações</Typography>
              </TableCell>
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
                <TableCell colSpan={totalColumns} align="center">
                  <Alert severity="info" sx={{ alignItems: "center", justifyContent: "center" }}>
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
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
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
  function CustomRow({ row, columns, actions, isSelected, onSelect }: CustomRowProps) {
    const renderColumn = useMemo(() => createRenderColumn(row, columns), [row, columns]);
    const alignsMap = useMemo(() => {
      const map = new Map<string | keyof UserRow, string>();
      columns.forEach(({ key, align }) => map.set(key, align || "left"));
      return map;
    }, [columns]);

    return (
      <TableRow
        sx={{
          "& td": { border: 0 },
          "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) },
          ...(isSelected && { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) }),
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox checked={isSelected} onChange={() => onSelect(row.id)} />
        </TableCell>

        {columns.map(({ key }) => (
          <TableCell key={String(key)} align={(alignsMap.get(key) as any) || "left"}>
            {renderColumn(key)}
          </TableCell>
        ))}

        <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 0 }}>
          <ActionsListMode row={row as any} actions={actions as any} />
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => prev.row.id === next.row.id && prev.isSelected === next.isSelected
);
