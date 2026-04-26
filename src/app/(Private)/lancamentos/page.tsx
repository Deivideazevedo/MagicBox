"use client";

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Tooltip,
  alpha,
  Stack,
} from "@mui/material";
import { IconTrash, IconHelp, IconSparkles } from "@tabler/icons-react";
import { IconButton } from "@mui/material";

// Desabilitar prerendering estático para páginas dinâmicas protegidas
export const dynamic = "force-dynamic";

// Components
import LancamentoDrawer from "./components/LancamentoDrawer";
import FiltrosAvancados from "./components/FiltrosAvancados";
import { CustomTable } from "./components/customTable";
import ModalVisualizacao from "./components/ModalVisualizacao";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";

// Hooks
import { useLancamentosList } from "./hooks/useLancamentosList";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetReceitasQuery } from "@/services/endpoints/receitasApi";
import { useGetMetasQuery } from "@/services/endpoints/metasApi";
import { useCallback, useMemo } from "react";
import { useDispatch } from "@/store/hooks";
import { abrirDrawer } from "@/store/apps/lancamentos/LancamentoSlice";
import { LancamentoResposta } from "@/core/lancamentos/types";

// Tour
import {
  ProductTour,
  useTour,
  ProductTourButton,
} from "@/app/components/shared/ProductTour";
import {
  LancamentosTourProvider,
  useLancamentosTourRefs,
} from "./components/LancamentosTourContext";
import { criarLancamentosTourSteps } from "./components/lancamentosTourSteps";

function LancamentosPageContent() {
  const dispatch = useDispatch();
  const tourRefs = useLancamentosTourRefs();

  const { data: despesas = [] } = useGetDespesasQuery();
  const { data: receitas = [] } = useGetReceitasQuery();
  const { data: metas = [] } = useGetMetasQuery();

  const {
    lancamentos,
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

  // Configuração do Tour
  const steps = useMemo(() => criarLancamentosTourSteps(tourRefs), [tourRefs]);
  const tour = useTour({
    storageKey: "tour-lancamentos-visto-v1",
    steps,
    autoStart: true,
  });

  // Handler de "Editar" — agora abre o Drawer Único Global
  const handleEditarLancamento = useCallback(
    (lancamento: LancamentoResposta) => {
      dispatch(abrirDrawer({ modo: "editar", dados: lancamento }));
    },
    [dispatch],
  );

  const fullLancamentos = useMemo(() => {
    return lancamentos.map((lancamento) => {
      return {
        ...lancamento,
        origem:
          lancamento.metaId || lancamento.meta_id
            ? "Meta"
            : lancamento.despesa
              ? "Despesa"
              : "Receita",
        nome:
          lancamento.meta?.nome ||
          lancamento.despesa?.nome ||
          lancamento.receita?.nome ||
          "-",
      };
    });
  }, [lancamentos]);

  return (
    <>
      <Container maxWidth={false} sx={{ px: { xs: 0, md: 2 } }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
          ref={tourRefs.tituloRef}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h3" fontWeight={700}>
                Lançamentos
              </Typography>
              <ProductTourButton
                onClick={() => {
                  tour.reset();
                  tour.start();
                }}
                title="Iniciar Tour Premium"
              />
            </Stack>
            <Typography variant="h6" color="textSecondary">
              Gerencie seus pagamentos e agendamentos financeiros
            </Typography>
          </Box>
        </Box>

        {/* Filtros avançados */}
        <FiltrosAvancados
          filtros={filtros}
          despesas={despesas}
          receitas={receitas}
          metas={metas}
          handleSearch={handleSearch}
          refs={tourRefs}
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
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Extrato de Lançamentos
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Visualize, edite ou exclua seus lançamentos
                  </Typography>
                </Box>
              </Box>

              <Box ref={tourRefs.tabelaRef}>
                <CustomTable
                  data={fullLancamentos}
                  actions={[
                    {
                      title: "Visualizar",
                      callback: modalHandlers.visualizar.abrir,
                      color: "info",
                    },
                    {
                      title: "Editar",
                      callback: handleEditarLancamento,
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
                  onSelectionChange={onSelectionChange}
                  onBulkDelete={excluirHandlers.bulk}
                  refs={tourRefs}
                />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* O Drawer agora é global, instanciado no Layout */}

      {/* Modal de Visualização */}
      <ModalVisualizacao
        open={Boolean(modais.visualizar)}
        lancamento={modais.visualizar}
        despesas={despesas}
        receitas={receitas}
        onClose={modalHandlers.visualizar.fechar}
      />

      {/* Dialog de Exclusão */}
      <DeleteConfirmationDialog
        open={Boolean(modais.excluir) || modais.bulkExcluir}
        onClose={modalHandlers.excluir.fechar}
        onConfirm={excluirHandlers.confirmar}
        loading={isDeleting}
        title={
          modais.bulkExcluir
            ? "Excluir Lançamentos Selecionados?"
            : "Excluir Lançamento?"
        }
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
            {modais.bulkExcluir
              ? `${selectedIds.length} lançamentos selecionados`
              : `"${lancamentoParaExcluirNome}"`}
          </Box>
          <br />
          {!modais.bulkExcluir && modais.excluir && (
            <>
              <Typography variant="body2" color="textSecondary" mt={1}>
                Valor: R$ {Number(modais.excluir.valor || 0).toFixed(2)}
              </Typography>
              <br />
            </>
          )}
          {modais.bulkExcluir && (
            <Typography variant="body2" color="textSecondary" mt={1}>
              Esta ação removerá todos os itens marcados na tabela.
            </Typography>
          )}
          <br />
          Essa ação não poderá ser desfeita.
        </Typography>
      </DeleteConfirmationDialog>

      {/* Tour */}
      <ProductTour
        isOpen={tour.isOpen}
        step={tour.step}
        currentStep={tour.currentStep}
        totalSteps={tour.totalSteps}
        isFirstStep={tour.isFirstStep}
        isLastStep={tour.isLastStep}
        onNext={tour.next}
        onPrev={tour.prev}
        onSkip={tour.skip}
      />
    </>
  );
}

export default function LancamentosPage() {
  return (
    <LancamentosTourProvider>
      <LancamentosPageContent />
    </LancamentosTourProvider>
  );
}
