"use client";

import { Box, Container, Typography, Grid, Card, Button } from "@mui/material";
import { IconTrash } from "@tabler/icons-react";

// Components
import LancamentoDrawer from "./components/LancamentoDrawer";
import MiniCardsResumo from "./components/MiniCardsResumo";
import FiltrosAvancados from "./components/FiltrosAvancados";
import DataGridLancamentos from "./components/DataGridLancamentos";
import ModalVisualizacao from "./components/ModalVisualizacao";
import ModalEdicao from "./components/ModalEdicao";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";

// Hooks
import { useLancamentosList } from "./hooks/useLancamentosList";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetFontesRendaQuery } from "@/services/endpoints/fontesRendaApi";

export default function LancamentosPage() {
  const { data: categorias = [] } = useGetCategoriasQuery();
  const { data: despesas = [] } = useGetDespesasQuery();
  const { data: fontesRenda = [] } = useGetFontesRendaQuery();

  const {
    lancamentos,
    totais,
    isLoading,
    page,
    pageSize,
    totalRows,
    handlePageChange,
    handlePageSizeChange,
    filtros,
    handleAplicarFiltros,
    handleLimparFiltros,
    lancamentoParaVisualizar,
    handleVisualizarLancamento,
    handleFecharVisualizacao,
    lancamentoParaEditar,
    handleEditarLancamento,
    handleFecharEdicao,
    lancamentoParaExcluir,
    lancamentoParaExcluirNome,
    handleAbrirDialogExclusao,
    handleFecharDialogExclusao,
    handleConfirmarExclusao,
    isDeleting,
    selectedIds,
    handleSelectionChange,
    handleBulkDelete,
    isBulkDeleting,
  } = useLancamentosList();

  return (
    <>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom fontWeight={700}>
            Lançamentos
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Gerencie seus pagamentos e agendamentos financeiros
          </Typography>
        </Box>

        {/* Cards no topo */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <MiniCardsResumo
              totalLancamentos={totais.totalLancamentos}
              valorTotal={totais.valorTotal}
              valorPagamentos={totais.valorPagamentos}
              valorAgendamentos={totais.valorAgendamentos}
            />
          </Grid>
        </Grid>

        {/* Filtros abaixo */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <FiltrosAvancados
              filtros={filtros}
              categorias={categorias}
              despesas={despesas}
              fontesRenda={fontesRenda}
              onAplicarFiltros={handleAplicarFiltros}
              onLimparFiltros={handleLimparFiltros}
            />
          </Grid>
        </Grid>

        {/* DataGrid */}
        <Grid container spacing={3}>
          <Grid item xs={12}>

            <Card
              sx={{
                borderRadius: 3,
                p: 3,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Extrato de Lançamentos
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Visualize, edite ou exclua seus lançamentos
                  </Typography>
                </Box>
                
                {selectedIds.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<IconTrash size={18} />}
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                  >
                    Excluir {selectedIds.length} selecionado(s)
                  </Button>
                )}
              </Box>
              
              <DataGridLancamentos
                lancamentos={lancamentos}
                categorias={categorias}
                despesas={despesas}
                fontesRenda={fontesRenda}
                onVisualizar={handleVisualizarLancamento}
                onEditar={handleEditarLancamento}
                onExcluir={handleAbrirDialogExclusao}
                onSelectionChange={handleSelectionChange}
                loading={isLoading}
                totalRows={totalRows}
                page={page}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Drawer para novo lançamento */}
      <LancamentoDrawer />

      {/* Modal de Visualização */}
      <ModalVisualizacao
        open={Boolean(lancamentoParaVisualizar)}
        lancamento={lancamentoParaVisualizar}
        categorias={categorias}
        despesas={despesas}
        fontesRenda={fontesRenda}
        onClose={handleFecharVisualizacao}
      />

      {/* Modal de Edição */}
      <ModalEdicao
        open={Boolean(lancamentoParaEditar)}
        lancamento={lancamentoParaEditar}
        categorias={categorias}
        despesas={despesas}
        fontesRenda={fontesRenda}
        onClose={handleFecharEdicao}
      />

      {/* Dialog de Exclusão */}
      <DeleteConfirmationDialog
        open={lancamentoParaExcluir}
        onClose={handleFecharDialogExclusao}
        onConfirm={handleConfirmarExclusao}
        loading={isDeleting}
        title="Excluir Lançamento?"
        icon={IconTrash}
        color="error"
      >
        <Typography variant="body1" color="text.secondary">
          Você está prestes a remover{" "}
          <Box component="span" fontWeight="bold" fontSize={15} color="text.primary">
            "{lancamentoParaExcluirNome}"
          </Box>
          <br />
          <Typography variant="body2" color="textSecondary" mt={1}>
            Valor: R$ {Number(lancamentoParaExcluir?.valor || 0).toFixed(2)}
          </Typography>
          <br />
          Essa ação não poderá ser desfeita.
        </Typography>
      </DeleteConfirmationDialog>
    </>
  );
}
