"use client";

import { Box, Container, Typography, Grid, Card, Button } from "@mui/material";
import { IconTrash } from "@tabler/icons-react";

// Desabilitar prerendering estático para páginas dinâmicas protegidas
export const dynamic = "force-dynamic";

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
    paginacao,
    filtros,
    handleSearch,
    modais,
    modalHandlers,
    isDeleting,
    excluirHandlers,
    lancamentoParaExcluirNome,
    selectedIds,
    onSelectionChange,
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
        {/* <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <MiniCardsResumo
              totalLancamentos={totais.totalLancamentos}
              valorTotal={totais.valorTotal}
              valorPagamentos={totais.valorPagamentos}
              valorAgendamentos={totais.valorAgendamentos}
            />
          </Grid>
        </Grid> */}

        {/* Filtros avançados */}
        <FiltrosAvancados
          filtros={filtros}
          categorias={categorias}
          despesas={despesas}
          fontesRenda={fontesRenda}
          handleSearch={handleSearch}
        />

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
                    onClick={excluirHandlers.bulk}
                    disabled={isDeleting}
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
                onVisualizar={modalHandlers.visualizar.abrir}
                onEditar={modalHandlers.editar.abrir}
                onExcluir={modalHandlers.excluir.abrir}
                onSelectionChange={onSelectionChange}
                loading={isLoading}
                totalRows={totalRows}
                page={page}
                pageSize={pageSize}
                onPageChange={paginacao.mudarPagina}
                onPageSizeChange={paginacao.mudarTamanho}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Drawer para novo lançamento */}
      <LancamentoDrawer />

      {/* Modal de Visualização */}
      <ModalVisualizacao
        open={Boolean(modais.visualizar)}
        lancamento={modais.visualizar}
        categorias={categorias}
        despesas={despesas}
        fontesRenda={fontesRenda}
        onClose={modalHandlers.visualizar.fechar}
      />

      {/* Modal de Edição */}
      <ModalEdicao
        open={Boolean(modais.editar)}
        lancamento={modais.editar}
        categorias={categorias}
        despesas={despesas}
        fontesRenda={fontesRenda}
        onClose={modalHandlers.editar.fechar}
      />

      {/* Dialog de Exclusão */}
      <DeleteConfirmationDialog
        open={Boolean(modais.excluir)}
        onClose={modalHandlers.excluir.fechar}
        onConfirm={excluirHandlers.confirmar}
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
            Valor: R$ {Number(modais.excluir?.valor || 0).toFixed(2)}
          </Typography>
          <br />
          Essa ação não poderá ser desfeita.
        </Typography>
      </DeleteConfirmationDialog>
    </>
  );
}
