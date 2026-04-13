"use client";

import { Box, Container, Typography, Grid, Stack } from "@mui/material";
import { useState } from "react";

// Desabilitar prerendering estático para páginas dinâmicas protegidas
export const dynamic = "force-dynamic";

// Components
import FiltrosAvancadosUsuarios from "./components/FiltrosAvancadosUsuarios";
import { CustomTableUsuarios } from "./components/customTable";
import ModalVisualizacaoUsuario from "./components/ModalVisualizacaoUsuario";
import StatusToggleDialog from "./components/StatusToggleDialog";

// Hooks
import { useUsuariosList } from "./hooks/useUsuariosList";

import { IconTrash, IconAlertTriangle } from "@tabler/icons-react";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";

export default function UsuariosPage() {
  const {
    usuarios,
    isLoading,
    isUpdating,
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
              onStatusClick={modalHandlers.status.abrir}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onBulkDelete={() => modalHandlers.deleteBulk.abrir(selectedIds)}
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

      {/* Dialog de Confirmação de Status */}
      <StatusToggleDialog
        user={modais.status}
        onClose={modalHandlers.status.fechar}
        onConfirm={handleToggleStatus}
        loading={isUpdating}
      />

      {/* Dialog de Deleção Permanente em Lote */}
      <DeleteConfirmationDialog
        open={modais.deleteBulk}
        onClose={modalHandlers.deleteBulk.fechar}
        onConfirm={handleBulkDelete}
        title="Excluir Permanentemente"
        icon={IconTrash}
        loading={isUpdating}
        confirmButtonText="Excluir Agora"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body1">
            Você está prestes a excluir <strong>{modais.deleteBulk?.length}</strong> usuário(s) permanentemente.
          </Typography>
          <Box sx={{ p: 2, bgcolor: "error.light", color: "error.main", borderRadius: 2, border: "1px solid", borderColor: "error.main", display: "flex", gap: 2 }}>
            <IconAlertTriangle size={48} />
            <Typography variant="caption" fontWeight={600}>
              ESTA AÇÃO É IRREVERSÍVEL. Todos os lançamentos, categorias e dados vinculados a estes usuários serão apagados do servidor.
            </Typography>
          </Box>
        </Stack>
      </DeleteConfirmationDialog>
    </>
  );
}
