"use client";

import { Box, Container, Typography, Grid } from "@mui/material";
import { IconTrash } from "@tabler/icons-react";

// Desabilitar prerendering estático para páginas dinâmicas protegidas
export const dynamic = "force-dynamic";

// Components
import MiniCardsResumo from "./components/MiniCardsResumo";
import FiltrosAvancados from "./components/FiltrosAvancados";
import { CustomTable } from "./components/customTable";
import ModalVisualizacao from "./components/ModalVisualizacao";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";

// Hooks
import { useResumo } from "./hooks/useResumo";
import { useMemo } from "react";
import { useDispatch } from "@/store/hooks";
import { abrirDrawer } from "@/store/apps/lancamentos/LancamentoSlice";
import { IconChecks } from "@tabler/icons-react";

export default function ResumoPage() {
  const dispatch = useDispatch();
  const {
    resumo,
    isLoading,
    isFetching,
    page,
    pageSize,
    totalRows,
    onUpdatePaginationParams,
    filtros,
    handleSearch,
    modais,
    modalHandlers,
  } = useResumo();


  return (
    <Container maxWidth={false} sx={{ px: { xs: 0, md: 2 } }}>
      <Box sx={{ mb: 0 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Resumo
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Gerencie seus pagamentos e agendamentos financeiros
        </Typography>
      </Box>

      {/* Cards no topo */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <MiniCardsResumo
            dataFim={filtros.dataFim}
            dataInicio={filtros.dataInicio}
          />
        </Grid>
      </Grid>

      {/* Filtros avançados */}
      <FiltrosAvancados
        filtros={filtros}
        handleSearch={handleSearch}
      />

      {/* DataGrid */}
      <CustomTable
        data={resumo}
        actions={[
          {
            title: "Visualizar",
            callback: modalHandlers.visualizar.abrir,
            color: "info",
          },
          {
            title: "Pagar",
            icon: <IconChecks size={18} />,
            callback: (row) => dispatch(abrirDrawer({ modo: "pagar", dados: row })),
            color: "success",
            show: (row) => row.status !== "Pago",
          },
        ]}
        pagination={{
          page,
          rowsPerPage: pageSize,
          count: totalRows,
          onUpdatePaginationParams,
        }}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyMessage="Nenhum lançamento foi encontrado"
      />

      {/* Modal de Visualização */}
      <ModalVisualizacao
        open={Boolean(modais.visualizar)}
        lancamento={modais.visualizar}
        onClose={modalHandlers.visualizar.fechar}
      />
    </Container>


  );
}
