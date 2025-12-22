"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { 
  DataGrid, 
  GridColDef, 
  GridActionsCellItem,
  GridSelectionModel,
  GridToolbar,
  GridValueFormatterParams,
  GridValueGetterParams,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import { 
  IconTrash, 
  IconEdit, 
  IconCheck, 
  IconClock, 
  IconAlertTriangle 
} from "@tabler/icons-react";
import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

// Hooks RTK Query
import { 
  useGetLancamentosQuery,
  useDeleteLancamentoMutation,
  // useDeleteLancamentosMutation,
  useUpdateLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import { useGetContasQuery } from "@/services/endpoints/contasApi";

interface TabelaExtratoProps {
  filtros?: any;
}

export default function TabelaExtrato({ filtros }: TabelaExtratoProps) {
  const [selectedRows, setSelectedRows] = useState<GridSelectionModel>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ 
    open: boolean; 
    type: "single" | "multiple";
    lancamento?: any;
  }>({
    open: false,
    type: "single",
  });

  // RTK Query hooks
  const { data: lancamentos = [], isLoading, error } = useGetLancamentosQuery(filtros);
  const { data: categorias = [] } = useGetCategoriasQuery();
  const { data: contas = [] } = useGetContasQuery();
  const [deleteLancamento, { isLoading: isDeletingSingle }] = useDeleteLancamentoMutation();
  // const [deleteLancamentos, { isLoading: isDeletingMultiple }] = useDeleteLancamentosMutation();
  const [updateLancamento, { isLoading: isUpdating }] = useUpdateLancamentoMutation();
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  // Função para obter status com base na data
  const getStatus = useCallback((lancamento: any) => {
    if (lancamento.status === "pago") return "pago";
    
    const hoje = new Date();
    const dataLancamento = new Date(lancamento.data);
    
    if (isAfter(hoje, dataLancamento)) {
      return "atrasado";
    }
    
    return "pendente";
  }, []);

  // Função para renderizar chip de status
  const renderStatusChip = useCallback((status: string) => {
    const configs = {
      pago: { 
        label: "Pago", 
        color: "success" as const, 
        icon: <IconCheck size={14} /> 
      },
      pendente: { 
        label: "Pendente", 
        color: "warning" as const, 
        icon: <IconClock size={14} /> 
      },
      atrasado: { 
        label: "Atrasado", 
        color: "error" as const, 
        icon: <IconAlertTriangle size={14} /> 
      },
    };

    const config = configs[status as keyof typeof configs];
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
        sx={{ fontWeight: 600 }}
      />
    );
  }, []);

  // Marcar como pago
  const handleMarcarComoPago = useCallback(async (lancamento: any) => {
    try {
      const { id, createdAt, updatedAt, ...rest } = lancamento;
      const payload = {
        ...rest,
        status: "pago",
        valorPago: lancamento.valor,
      };

      await updateLancamento({
        id: lancamento.id,
        data: payload,
      }).unwrap();
    } catch (error) {
      console.error("Erro ao marcar como pago:", error);
    }
  }, [updateLancamento]);

  // Excluir um lançamento
  const handleDeleteSingle = async () => {
    if (deleteDialog.lancamento) {
      try {
        await deleteLancamento(deleteDialog.lancamento.id).unwrap();
        setDeleteDialog({ open: false, type: "single" });
      } catch (error) {
        console.error("Erro ao excluir lançamento:", error);
      }
    }
  };

  // Excluir múltiplos lançamentos
  const handleDeleteMultiple = async () => {
    setIsDeletingMultiple(true);
    try {
      const ids = selectedRows as string[];
      await Promise.all(ids.map(id => deleteLancamento(id).unwrap()));
      setSelectedRows([]);
      setDeleteDialog({ open: false, type: "multiple" });
    } catch (error) {
      console.error("Erro ao excluir lançamentos:", error);
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  // Configuração das colunas
  const columns: GridColDef[] = [
    {
      field: "data",
      headerName: "Data",
      width: 120,
      valueFormatter: (params: GridValueFormatterParams) => {
        return format(new Date(params.value), "dd/MM/yyyy", { locale: ptBR });
      },
    },
    {
      field: "despesa",
      headerName: "Despesa",
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        const despesa = categorias.find((d: any) => d.id === params.row.despesaId);
        return despesa?.nome || "N/A";
      },
    },
    {
      field: "conta",
      headerName: "Conta",
      width: 180,
      valueGetter: (params: GridValueGetterParams) => {
        const conta = contas.find((c: any) => c.id === params.row.contaId);
        return conta?.nome || "N/A";
      },
    },
    {
      field: "descricao",
      headerName: "Descrição",
      width: 200,
      valueGetter: (params: GridValueGetterParams) => params.row.descricao || "-",
    },
    {
      field: "valor",
      headerName: "Valor Previsto",
      width: 130,
      type: "number",
      valueFormatter: (params: GridValueFormatterParams) => {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(params.value);
      },
    },
    {
      field: "valorPago",
      headerName: "Valor Pago",
      width: 130,
      type: "number",
      valueFormatter: (params: GridValueFormatterParams) => {
        if (params.value == null) return "-";
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(params.value);
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const status = getStatus(params.row);
        return renderStatusChip(status);
      },
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const status = getStatus(params.row);
        
        return (
          <Box display="flex" gap={0.5}>
            {status !== "pago" && (
              <IconButton
                size="small"
                onClick={() => handleMarcarComoPago(params.row)}
                disabled={isUpdating}
              >
                <Tooltip title="Marcar como pago">
                  <IconCheck size={18} />
                </Tooltip>
              </IconButton>
            )}
            
            <IconButton
              size="small"
              onClick={() => setDeleteDialog({ 
                open: true, 
                type: "single", 
                lancamento: params.row 
              })}
            >
              <Tooltip title="Excluir">
                <IconTrash size={18} />
              </Tooltip>
            </IconButton>
          </Box>
        );
      },
    },
  ];

  // Dados processados com status calculado
  const dadosProcessados = lancamentos.map((lancamento: any) => ({
    ...lancamento,
    statusCalculado: getStatus(lancamento),
  }));

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Erro ao carregar lançamentos. Tente novamente.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Lançamentos ({dadosProcessados.length})
        </Typography>
        
        {selectedRows.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<IconTrash size={18} />}
            onClick={() => setDeleteDialog({ open: true, type: "multiple" })}
            disabled={isDeletingMultiple}
          >
            Excluir Selecionados ({selectedRows.length})
          </Button>
        )}
      </Box>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={dadosProcessados}
          columns={columns}
          loading={isLoading}
          checkboxSelection
          disableSelectionOnClick
          onSelectionModelChange={setSelectedRows}
          selectionModel={selectedRows}
          pageSize={25}
          rowsPerPageOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              pageSize: 25,
            },
          }}
          components={{
            Toolbar: GridToolbar,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "action.hover",
            },
          }}
        />
      </Box>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: "single" })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteDialog.type === "single" 
              ? `Tem certeza que deseja excluir este lançamento?`
              : `Tem certeza que deseja excluir ${selectedRows.length} lançamentos selecionados?`
            }
            <br />
            <strong>Esta ação não pode ser desfeita.</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, type: "single" })}
          >
            Cancelar
          </Button>
          <Button
            onClick={deleteDialog.type === "single" ? handleDeleteSingle : handleDeleteMultiple}
            color="error"
            variant="contained"
            disabled={isDeletingSingle || isDeletingMultiple}
          >
            {(isDeletingSingle || isDeletingMultiple) ? (
              <CircularProgress size={20} />
            ) : (
              "Excluir"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}