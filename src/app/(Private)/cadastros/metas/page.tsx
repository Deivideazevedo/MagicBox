"use client";

import PageContainer from "@/app/components/container/PageContainer";
import Breadcrumb from "@/app/(Private)/layout/shared/breadcrumb/Breadcrumb";
import { Meta } from "@/core/metas/types";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
  alpha,
  Stack,
  Collapse,
  Dialog,
  DialogContent,
} from "@mui/material";
import {
  IconTarget,
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconTrash,
  IconCheck,
  IconRefresh,
} from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import TransactionModal from "../components/Common/TransactionModal";
import { Formulario } from "../components/Meta/Formulario";
import { Listagem } from "../components/Meta/Listagem";
import { MetasDashboard } from "../components/Meta/MetasDashboard";
import { useMetas } from "../hooks/useMetas";
import Slide from "@mui/material/Slide";
import useMediaQuery from "@mui/material/useMediaQuery";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import RetiradaMetaModal from "../components/Meta/RetiradaMetaModal";

export default function MetasPage() {
  const theme = useTheme();
  const {
    metas,
    isLoading,
    isCreating,
    isUpdating,
    isEditing,
    isAporte,
    isRetiradaModalOpen,
    setIsRetiradaModalOpen,
    targetMeta,
    isAportando,
    control,
    handleSubmit,
    handleEdit,
    handleAporte,
    handleRetirada,
    handleDelete,
    handleToggleStatus,
    handleCancelEdit,
    tipoConfirmacao,
    metaParaAcao,
    setTipoConfirmacao,
    executarAcaoConfirmada,
    isDeleting,
  } = useMetas();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isMobileForm = useMediaQuery(theme.breakpoints.down("sm"));
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);
  const [aporteState, setAporteState] = useState<{
    open: boolean;
    target: Meta | null;
  }>({
    open: false,
    target: null,
  });

  const BREADCRUMBS = [
    { title: "Dashboard", to: "/" },
    { title: "Metas", to: "/cadastros/metas" },
  ];

  const handleOpenAporte = (meta: Meta) => {
    handleAporte(meta);
    setExibirFormulario(true);
  };

  const handleNovaMeta = () => {
    handleCancelEdit();
    setExibirFormulario(true);
  };

  const handleEditarMeta = (meta: Meta) => {
    handleEdit(meta);
    setExibirFormulario(true);
  };

  const handleFecharFormulario = () => {
    handleCancelEdit();
    setExibirFormulario(false);
  };

  const metasFiltradas = mostrarConcluidas ? metas : metas.filter(m => m.status === 'A');

  return (
    <PageContainer title="Metas" description="Gerencie seus objetivos financeiros">
      <Breadcrumb title="Metas" items={BREADCRUMBS} />

      {/* Dashboard de Totalizadores */}
      <Box mb={4}>
        <MetasDashboard
          metas={metas}
          onNew={handleNovaMeta}
          mostrarConcluidas={mostrarConcluidas}
          onToggleConcluidas={setMostrarConcluidas}
        >
          <Grid
            container
            spacing={3}
            sx={{
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              // overflow: 'hidden',
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
                    row={null}
                    control={control}
                    handleSubmit={handleSubmit}
                    isCreating={isCreating}
                    isUpdating={isUpdating}
                    handleCancelEdit={handleFecharFormulario}
                    targetMeta={targetMeta}
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
                    row={null}
                    control={control}
                    handleSubmit={handleSubmit}
                    isCreating={isCreating}
                    isUpdating={isUpdating}
                    handleCancelEdit={handleFecharFormulario}
                    targetMeta={targetMeta}
                  />
                </DialogContent>
              </Dialog>
            )}

            {/* Listagem (Expandida ou Lado a Lado com Animação) */}
            <Grid
              item
              xs={12}
              sx={{
                flexGrow: 1,
                minWidth: 0,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100%',
                // Estilização dinâmica para crescimento suave
                ...(!isMobileForm && {
                  flexBasis: (exibirFormulario && !isMobileForm) ? '66.66% !important' : '100% !important',
                  maxWidth: (exibirFormulario && !isMobileForm) ? '66.66% !important' : '100% !important',
                }),
                ...(isMobileForm && {
                  width: '100% !important',
                })
              }}
            >
              <Listagem
                metas={metasFiltradas}
                isLoading={isLoading}
                onEdit={handleEditarMeta}
                onDelete={handleDelete}
                onAporte={handleOpenAporte}
                onRetirada={handleRetirada}
                onToggleStatus={handleToggleStatus}
              />
            </Grid>
          </Grid>
        </MetasDashboard>
      </Box>

      {/* Diálogo de Confirmação Unificado */}
      <DeleteConfirmationDialog
        open={tipoConfirmacao}
        onClose={() => setTipoConfirmacao(null)}
        title={
          tipoConfirmacao === 'delete' 
            ? "Excluir meta permanentemente?" 
            : tipoConfirmacao === 'concluir'
            ? "Concluir esta meta?"
            : "Reativar meta?"
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
            ? "Esta ação não pode ser desfeita e a meta será removida da sua listagem."
            : tipoConfirmacao === 'concluir'
            ? "Parabéns por atingir seu objetivo! A meta será arquivada como concluída."
            : "A meta voltará a ficar disponível para novos aportes."
          }
        </Typography>
      </DeleteConfirmationDialog>

      <RetiradaMetaModal
        open={isRetiradaModalOpen}
        onClose={() => setIsRetiradaModalOpen(false)}
        meta={targetMeta}
      />
    </PageContainer>
  );
}
