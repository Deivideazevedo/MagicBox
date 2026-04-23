"use client";

import PageContainer from "@/app/components/container/PageContainer";
import Breadcrumb from "@/app/(Private)/layout/shared/breadcrumb/Breadcrumb";
import { Divida, DividaUnica } from "@/core/dividas/types";
import {
  Box,
  Grid,
  Typography,
  useTheme,
  Slide,
  Dialog,
  DialogContent,
  useMediaQuery,
} from "@mui/material";
import {
  IconTrash,
  IconCheck,
  IconRefresh,
} from "@tabler/icons-react";
import { useState } from "react";
import { Formulario } from "../components/Divida/Formulario";
import { Listagem } from "../components/Divida/Listagem";
import { DividasDashboard } from "../components/Divida/DividasDashboard";
import { useDividas } from "../hooks/useDividas";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";

export default function DividasPage() {
  const theme = useTheme();
  const {
    resumo,
    dividas,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isAportando,
    isEditing,
    isAporte,
    targetDivida,
    tipoConfirmacao,
    dividaParaAcao,
    setTipoConfirmacao,
    executarAcaoConfirmada,
    control,
    handleSubmit,
    handleEdit,
    handleAporte,
    handleDelete,
    handleToggleStatus,
    handleCancelEdit,
    valorParcelaCalculado,
  } = useDividas();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isMobileForm = useMediaQuery(theme.breakpoints.down("sm"));
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);

  const BREADCRUMBS = [
    { title: "Dashboard", to: "/" },
    { title: "Dívidas", to: "/cadastros/dividas" },
  ];

  const handleOpenAporte = (divida: Divida) => {
    handleAporte(divida);
    setExibirFormulario(true);
  };

  const handleNovaDivida = () => {
    handleCancelEdit();
    setExibirFormulario(true);
  };

  const handleEditarDivida = (divida: DividaUnica) => {
    handleEdit(divida);
    setExibirFormulario(true);
  };

  const handleFecharFormulario = () => {
    handleCancelEdit();
    setExibirFormulario(false);
  };

  const dividasFiltradas = mostrarConcluidas ? dividas : dividas.filter((d: Divida) => d.status === 'A');

  return (
    <PageContainer title="Dívidas com Prazo" description="Gerencie a evolução e o encerramento de suas dívidas">
      <Breadcrumb title="Dívidas" items={BREADCRUMBS} />

      <Box mb={4}>
        <DividasDashboard
          resumo={resumo || { totalDevidoUnicas: 0, totalPagoUnicas: 0, totalAgendadoVolateis: 0, quantidadeTotalParcelas: 0, dividasAtrasadas: 0, proximosVencimentos: 0 }}
          onNew={handleNovaDivida}
          mostrarConcluidas={mostrarConcluidas}
          onToggleConcluidas={setMostrarConcluidas}
        >
          <Grid
            container
            spacing={3}
            sx={{
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              alignItems: 'flex-start'
            }}
          >
            {/* Formulário: Lateral no Desktop / Modal no Mobile */}
            {!isMobileForm ? (
              <Slide direction="right" in={exibirFormulario} mountOnEnter unmountOnExit>
                <Grid item xs={12} md={4} sx={{ flexShrink: 0 }}>
                  <Formulario
                    isEditing={isEditing}
                    isAporte={isAporte}
                    isAportando={isAportando}
                    control={control}
                    handleSubmit={handleSubmit}
                    isCreating={isCreating}
                    isUpdating={isUpdating}
                    handleCancelEdit={handleFecharFormulario}
                    targetDivida={targetDivida}
                    valorParcelaCalculado={valorParcelaCalculado}
                  />
                </Grid>
              </Slide>
            ) : (
              <Dialog
                open={exibirFormulario}
                onClose={handleFecharFormulario}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                  sx: { borderRadius: 4, bgcolor: 'background.paper' }
                }}
              >
                <DialogContent sx={{ p: 0 }}>
                  <Formulario
                    isEditing={isEditing}
                    isAporte={isAporte}
                    isAportando={isAportando}
                    control={control}
                    handleSubmit={handleSubmit}
                    isCreating={isCreating}
                    isUpdating={isUpdating}
                    handleCancelEdit={handleFecharFormulario}
                    targetDivida={targetDivida}
                    valorParcelaCalculado={valorParcelaCalculado}
                  />
                </DialogContent>
              </Dialog>
            )}

            {/* Listagem */}
            <Grid
              item
              xs={12}
              sx={{
                flexGrow: 1,
                minWidth: 0,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100%',
                ...(!isMobileForm && {
                  flexBasis: (exibirFormulario && !isMobile) ? '66.66% !important' : '100% !important',
                  maxWidth: (exibirFormulario && !isMobile) ? '66.66% !important' : '100% !important',
                }),
              }}
            >
              <Listagem
                dividas={dividasFiltradas}
                isLoading={isLoading}
                onEdit={handleEditarDivida}
                onDelete={handleDelete}
                onAporte={handleOpenAporte}
                onToggleStatus={handleToggleStatus}
              />
            </Grid>
          </Grid>
        </DividasDashboard>
      </Box>

      {/* Confirmação */}
      <DeleteConfirmationDialog
        open={!!tipoConfirmacao}
        onClose={() => setTipoConfirmacao(null)}
        title={
          tipoConfirmacao === 'delete' 
            ? "Excluir dívida permanentemente?" 
            : tipoConfirmacao === 'concluir'
            ? "Marcar como concluída?"
            : "Reativar dívida?"
        }
        confirmButtonText={
          tipoConfirmacao === 'delete' 
            ? "Sim, excluir" 
            : tipoConfirmacao === 'concluir'
            ? "Sim, concluir"
            : "Sim, reativar"
        }
        onConfirm={executarAcaoConfirmada}
        loading={isDeleting || isUpdating}
        color={
          tipoConfirmacao === 'delete' 
            ? "error" 
            : tipoConfirmacao === 'concluir'
            ? "success"
            : "info"
        }
        icon={
          tipoConfirmacao === 'delete' 
            ? IconTrash 
            : tipoConfirmacao === 'concluir'
            ? IconCheck 
            : IconRefresh
        }
      >
        <Typography variant="body1" color="text.secondary">
          {tipoConfirmacao === 'delete' 
            ? "Esta ação removerá a despesa e seus agendamentos vinculados."
            : tipoConfirmacao === 'concluir'
            ? "A dívida será arquivada como concluída."
            : "A dívida voltará a ficar disponível para novos pagamentos."
          }
        </Typography>
      </DeleteConfirmationDialog>
    </PageContainer>
  );
}
