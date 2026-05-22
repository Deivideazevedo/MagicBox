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

// Hooks
import { useLancamentosList } from "./hooks/useLancamentosList";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetReceitasQuery } from "@/services/endpoints/receitasApi";
import { useGetMetasQuery } from "@/services/endpoints/metasApi";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useLancamentoDrawer } from "@/hooks/useLancamentoDrawer";
import { LancamentoResposta } from "@/core/lancamentos/types";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { useModalUrl } from "@/hooks/useModalUrl";
import { useBulkDeleteLancamentosMutation } from "@/services/endpoints/lancamentosApi";
import { toast } from "react-hot-toast";

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
  const { abrirDrawer: openLancamentoDrawer } = useLancamentoDrawer();
  const tourRefs = useLancamentosTourRefs();
  const confirm = useConfirm();
  const modalVisualizar = useModalUrl("visualizar");
  const [selectedVisualizar, setSelectedVisualizar] = useState<LancamentoResposta | null>(null);
  const [bulkDelete] = useBulkDeleteLancamentosMutation();

  useEffect(() => {
    if (!modalVisualizar.isOpen) {
      setSelectedVisualizar(null);
    }
  }, [modalVisualizar.isOpen]);

  const handleVisualizar = (lancamento: LancamentoResposta) => {
    setSelectedVisualizar(lancamento);
    modalVisualizar.openModal();
  };

  const { data: despesas = [] } = useGetDespesasQuery();
  const { data: receitas = [] } = useGetReceitasQuery();
  const { data: metas = [] } = useGetMetasQuery();

  const {
    lancamentos,
    isLoading,
    isFetching,
    page,
    pageSize,
    totalRows,
    paginacao,
    filtros,
    handleSearch,
    selectedIds,
    onSelectionChange,
  } = useLancamentosList();

  // Configuração do Tour
  const steps = useMemo(() => criarLancamentosTourSteps(tourRefs), [tourRefs]);
  const tour = useTour({
    storageKey: "tour-lancamentos-visto-v1",
    steps,
    autoStart: totalRows > 0,
  });

  // Handler de "Editar" — agora abre o Drawer Único Global
  const handleEditarLancamento = useCallback(
    (lancamento: LancamentoResposta) => {
      openLancamentoDrawer("editar", lancamento);
    },
    [openLancamentoDrawer],
  );

  const handleExcluirLancamento = useCallback((lancamento: LancamentoResposta) => {
    confirm.delete({
      title: "Excluir Lançamento?",
      description: (
        <Typography variant="body1" color="text.secondary">
          Você está prestes a remover{" "}
          <Box component="span" fontWeight="bold" fontSize={15} color="text.primary">
            "{lancamento.observacao || `Lançamento #${lancamento.id}`}"
          </Box>
          <br />
          <Typography variant="body2" color="textSecondary" mt={1}>
            Valor: R$ {Number(lancamento.valor || 0).toFixed(2)}
          </Typography>
          <br />
          Essa ação não poderá ser desfeita.
        </Typography>
      ),
      onConfirm: async () => {
        try {
          await bulkDelete({ ids: [lancamento.id] }).unwrap();
          toast.success("Lançamento excluído com sucesso");
        } catch (error) {
          toast.error("Erro ao excluir lançamento");
        }
      }
    });
  }, [confirm, bulkDelete]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    confirm.delete({
      title: "Excluir Lançamentos Selecionados?",
      description: (
        <Typography variant="body1" color="text.secondary">
          Você está prestes a remover{" "}
          <Box component="span" fontWeight="bold" fontSize={15} color="text.primary">
            {selectedIds.length} lançamentos selecionados
          </Box>
          <br />
          <Typography variant="body2" color="textSecondary" mt={1}>
            Esta ação removerá todos os itens marcados na tabela.
          </Typography>
          <br />
          Essa ação não poderá ser desfeita.
        </Typography>
      ),
      onConfirm: async () => {
        try {
          await bulkDelete({ ids: selectedIds }).unwrap();
          toast.success(`${selectedIds.length} lançamento(s) excluído(s) com sucesso`);
          onSelectionChange([]);
        } catch (error) {
          toast.error("Erro ao excluir lançamento(s)");
        }
      }
    });
  }, [confirm, bulkDelete, selectedIds, onSelectionChange]);

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
              {totalRows > 0 && (
                <ProductTourButton
                  onClick={() => {
                    tour.reset();
                    tour.start();
                  }}
                  title="Iniciar Tour Premium"
                />
              )}
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
                      callback: handleVisualizar,
                      color: "info",
                    },
                    {
                      title: "Editar",
                      callback: handleEditarLancamento,
                      color: "primary",
                    },
                    {
                      title: "Excluir",
                      callback: handleExcluirLancamento,
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
                  isFetching={isFetching}
                  emptyMessage="Nenhum lançamento foi encontrado"
                  onSelectionChange={onSelectionChange}
                  onBulkDelete={handleBulkDelete}
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
        open={modalVisualizar.isOpen && !!selectedVisualizar}
        lancamento={selectedVisualizar}
        despesas={despesas}
        receitas={receitas}
        onClose={modalVisualizar.closeModal}
      />

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
