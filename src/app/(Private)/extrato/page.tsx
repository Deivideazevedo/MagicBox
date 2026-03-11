"use client";

import { Box, Container, Typography, Grid, Card, Button } from "@mui/material";
import { IconTrash } from "@tabler/icons-react";

// Desabilitar prerendering estático para páginas dinâmicas protegidas
export const dynamic = "force-dynamic";

// Components
import LancamentoDrawer from "./components/LancamentoDrawer";
import MiniCardsResumo from "./components/MiniCardsResumo";
import FiltrosAvancados from "./components/FiltrosAvancados";
import { CustomTable } from "./components/customTable";
import ModalVisualizacao from "./components/ModalVisualizacao";
import ModalEdicao from "./components/ModalEdicao";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";

// Hooks
import { useLancamentosList } from "./hooks/useLancamentosList";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetFontesRendaQuery } from "@/services/endpoints/fontesRendaApi";
import { useMemo } from "react";
import { ITableColumns } from "./components/customTable/types/columnProps";
import { Lancamento } from "@/core/lancamentos/types";

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

  const fullLancamentos = useMemo(() => {
    return lancamentos.map((lancamento) => {
      return {
        ...lancamento,
        origem: lancamento.despesa ? "Despesa" : "Renda",
        nome: lancamento.despesa?.nome || lancamento.fonteRenda?.nome || "-",
      };
    });
  }, [lancamentos]);


    // 📋 Configuração das colunas
    const columns: ITableColumns<Lancamento> = {
      data: {
        // sortValue: (row) => row.produtos.length,
        // render: (row) => row.produtos.length,
      },
    };

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
              
              <CustomTable
                data={fullLancamentos}
                columns={columns}
                actions={[
                  {
                    title: "Visualizar",                    
                    callback: modalHandlers.visualizar.abrir,
                    color: "info",
                  },
                  {
                    title: "Editar",
                    callback: modalHandlers.editar.abrir,
                    color: "primary",
                  },
                  {
                    title: "Excluir",
                    callback: modalHandlers.excluir.abrir,
                    color: "error",
                  },
                ]}
                pagination={{
                  page,
                  rowsPerPage: pageSize,
                  count: totalRows,
                  onPageChange: (_event, newPage) =>
                    paginacao.mudarPagina(newPage),
                  onRowsPerPageChange: (event) =>
                    paginacao.mudarTamanho(parseInt(event.target.value, 10)),
                }}
                isLoading={isLoading}
                emptyMessage="Nenhum lançamento foi encontrado"
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
          <Box
            component="span"
            fontWeight="bold"
            fontSize={15}
            color="text.primary"
          >
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
