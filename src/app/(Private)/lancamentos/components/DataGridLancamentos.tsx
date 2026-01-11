"use client";

import { useMemo } from "react";
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { DataGrid, GridColDef, ptBR, GridSelectionModel, GridValueGetterParams } from "@mui/x-data-grid";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconChecks,
  IconArrowDown,
  IconArrowUp,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR as ptBRDate } from "date-fns/locale";
import { Lancamento } from "@/core/lancamentos/types";
import { Categoria } from "@/core/categorias/types";
import { Despesa } from "@/core/despesas/types";
import { FonteRenda } from "@/core/fontesRenda/types";

interface DataGridLancamentosProps {
  lancamentos: Lancamento[];
  categorias: Categoria[];
  despesas: Despesa[];
  fontesRenda: FonteRenda[];
  onVisualizar: (lancamento: Lancamento) => void;
  onEditar: (lancamento: Lancamento) => void;
  onExcluir: (lancamento: Lancamento) => void;
  onSelectionChange: (ids: number[]) => void;
  loading?: boolean;
  totalRows?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
}

export default function DataGridLancamentos({
  lancamentos,
  categorias,
  despesas,
  fontesRenda,
  onVisualizar,
  onEditar,
  onExcluir,
  onSelectionChange,
  loading = false,
  totalRows = 0,
  page = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: DataGridLancamentosProps) {
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

  // Mapear IDs para nomes
  const categoriasMap = useMemo(() => {
    return categorias.reduce((acc, cat) => {
      acc[cat.id] = cat.nome;
      return acc;
    }, {} as Record<number, string>);
  }, [categorias]);

  const despesasMap = useMemo(() => {
    return despesas.reduce((acc, desp) => {
      acc[desp.id] = desp.nome;
      return acc;
    }, {} as Record<number, string>);
  }, [despesas]);

  const fontesRendaMap = useMemo(() => {
    return fontesRenda.reduce((acc, fonte) => {
      acc[fonte.id] = fonte.nome;
      return acc;
    }, {} as Record<number, string>);
  }, [fontesRenda]);

  const columns: GridColDef[] = [
    {
      field: "data",
      headerName: "Data",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">{formatarData(params.value)}</Typography>
      ),
    },
    {
      field: "tipo",
      headerName: "Tipo",
      width: 130,
      renderCell: (params) => {
        const isPagamento = params.value === "pagamento";
        return (
          <Chip
            size="small"
            icon={isPagamento ? <IconChecks size={16} /> : <IconCalendar size={16} />}
            label={isPagamento ? "Pagamento" : "Agendamento"}
            color={isPagamento ? "success" : "warning"}
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        );
      },
    },
    {
      field: "origem",
      headerName: "Origem",
      width: 110,
      renderCell: (params) => {
        const row = params.row as Lancamento;
        if (!row) return null;
        const isDespesa = Boolean(row.despesaId);
        return (
          <Chip
            size="small"
            icon={isDespesa ? <IconArrowDown size={16} /> : <IconArrowUp size={16} />}
            label={isDespesa ? "Despesa" : "Renda"}
            color={isDespesa ? "error" : "success"}
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        );
      },
    },
    {
      field: "categoria",
      headerName: "Categoria",
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        const row = params.row as Lancamento;
        // Fallback seguro para evitar erro quando categoria é undefined
        if (!row || !row.categoria) return "-";
        return row.categoria.nome || "-";
      },
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "item",
      headerName: "Nome",
      width: 200,
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        const row = params.row as Lancamento;
        // Fallback seguro
        if (!row) return "-";
        // Verificar propriedades aninhadas retornadas pelo Prisma
        if (row.despesa?.nome) return row.despesa.nome;
        if (row.fonteRenda?.nome) return row.fonteRenda.nome;
        return "-";
      },
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "descricao",
      headerName: "Descrição",
      width: 250,
      flex: 1,
      renderCell: (params) => (
        <Tooltip title={params.value || "-"} arrow>
          <Typography variant="body2" noWrap color="textSecondary">
            {params.value || "-"}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "valor",
      headerName: "Valor",
      width: 130,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const row = params.row as Lancamento;
        if (!row) return null;
        const isDespesa = Boolean(row.despesaId);
        return (
          <Typography
            variant="body2"
            fontWeight={600}
            color={isDespesa ? "error.main" : "success.main"}
          >
            {formatarValor(params.value)}
          </Typography>
        );
      },
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 130,
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row as Lancamento;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="Visualizar" arrow>
              <IconButton
                size="small"
                color="info"
                onClick={() => onVisualizar(row)}
                sx={{
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                  },
                }}
              >
                <IconEye size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar" arrow>
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEditar(row)}
                sx={{
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <IconEdit size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir" arrow>
              <IconButton
                size="small"
                color="error"
                onClick={() => onExcluir(row)}
                sx={{
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                <IconTrash size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 600,
        width: "100%",
        "& .MuiDataGrid-root": {
          border: "none",
          borderRadius: 3,
        },
        "& .MuiDataGrid-cell": {
          borderBottom: "1px solid",
          borderColor: "divider",
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
          borderBottom: "2px solid",
          borderColor: "divider",
          borderRadius: "12px 12px 0 0",
        },
        "& .MuiDataGrid-columnHeaderTitle": {
          fontWeight: 700,
          fontSize: "0.875rem",
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: "2px solid",
          borderColor: "divider",
          backgroundColor: (theme) => alpha(theme.palette.grey[100], 0.5),
        },
      }}
    >
      <DataGrid
        rows={lancamentos}
        columns={columns}
        loading={loading}
        checkboxSelection
        disableColumnSelector
        onSelectionModelChange={(newSelection: GridSelectionModel) => {
          onSelectionChange(newSelection as number[]);
        }}
        // Paginação client-side (versão gratuita do MUI DataGrid)
        pageSize={pageSize}
        onPageSizeChange={(newSize: number) => {
          if (onPageSizeChange) {
            onPageSizeChange(newSize);
          }
        }}
        rowsPerPageOptions={[10, 20, 50, 100, 500]}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          "& .MuiDataGrid-row:hover": {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
          },
        }}
      />
    </Box>
  );
}
