"use client";

import { Box, Container, Typography, Grid } from "@mui/material";
import { useState } from "react";

// Desabilitar prerendering estático para páginas dinâmicas protegidas
export const dynamic = "force-dynamic";

// Components
import FiltrosAvancadosUsuarios from "./components/FiltrosAvancadosUsuarios";
import { CustomTableUsuarios } from "./components/customTable";
import ModalVisualizacaoUsuario from "./components/ModalVisualizacaoUsuario";

// Hooks
import { useUsuariosList } from "./hooks/useUsuariosList";

export default function UsuariosPage() {
  const {
    usuarios,
    isLoading,
    isFetching,
    page,
    pageSize,
    totalRows,
    paginacao,
    filtros,
    handleSearch,
    modais,
    modalHandlers,
    handleToggleStatus,
    handleUpdateUser,
    handleBulkDelete,
    handleReset,
  } = useUsuariosList();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  return (
    <>
      <Container maxWidth={false} sx={{ px: { xs: 0, md: 2 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom fontWeight={800}>
            Gestão de Usuários
          </Typography>
          <Typography variant="h6" color="textSecondary" fontWeight={400}>
            Gerencie acesso, privilégios e segurança da plataforma
          </Typography>
        </Box>

        {/* Filtros avançados */}
        <FiltrosAvancadosUsuarios
          filtros={filtros}
          handleSearch={handleSearch}
        />

        {/* Tabela de Usuários */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <CustomTableUsuarios
              data={usuarios}
              onStatusClick={handleToggleStatus}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onBulkDelete={() =>
                handleBulkDelete(selectedIds).then((success) => {
                  if (success) setSelectedIds([]);
                })
              }
              onReset={handleReset}
              actions={[
                {
                  title: "Gerenciar",
                  callback: modalHandlers.visualizar.abrir,
                  color: "primary",
                },
              ]}
              pagination={{
                page,
                rowsPerPage: pageSize,
                count: totalRows,
                onPageChange: (_event, newPage) =>
                  paginacao.mudarPagina(newPage),
                rowsPerPageOptions: [10, 20, 50, 100],
                onRowsPerPageChange: (event) =>
                  paginacao.mudarTamanho(parseInt(event.target.value, 10)),
              }}
              isLoading={isLoading}
              isFetching={isFetching}
              emptyMessage="Nenhum usuário foi encontrado"
            />
          </Grid>
        </Grid>
      </Container>

      {/* Modal de Detalhes e Edição */}
      <ModalVisualizacaoUsuario
        user={modais.visualizar}
        onClose={modalHandlers.visualizar.fechar}
        onUpdateUser={handleUpdateUser}
      />
    </>
  );
}
