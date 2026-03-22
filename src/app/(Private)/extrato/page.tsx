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
import { useExtratoList } from "./hooks/useExtratoList";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetFontesRendaQuery } from "@/services/endpoints/fontesRendaApi";
import { useMemo } from "react";

export default function ExtratosPage() {
  const {
    extrato,
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
  } = useExtratoList();


  return (
    <>
      <Container maxWidth="xl">
        <Box sx={{ mb: 0 }}>
          <Typography variant="h3" gutterBottom fontWeight={700}>
            Extrato
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
          data={extrato}
          actions={[
            {
              title: "Visualizar",
              callback: modalHandlers.visualizar.abrir,
              color: "info",
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
     
      </Container>

      {/* Modal de Visualização */}
      <ModalVisualizacao
        open={Boolean(modais.visualizar)}
        lancamento={modais.visualizar}
        onClose={modalHandlers.visualizar.fechar}
      />

    </>
  );
}
