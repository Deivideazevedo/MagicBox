"use client";

import PageContainer from "@/app/components/container/PageContainer";
import Breadcrumb from "@/app/(Private)/layout/shared/breadcrumb/Breadcrumb";
import { Objetivo } from "@/core/objetivos/types";
import {
  Box,
  Grid,
  Dialog,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useObjetivos } from "../hooks/useObjetivos";
import Slide from "@mui/material/Slide";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useModalUrl } from "@/hooks/useModalUrl";

// Importa os modais e formulários dinamicamente sob demanda
const Formulario = dynamic(() => import("../components/Objetivo/Formulario").then((m) => m.Formulario), {
  loading: () => (
    <Box display="flex" justifyContent="center" alignItems="center" p={3}>
      <CircularProgress />
    </Box>
  ),
  ssr: false,
});

const RetiradaObjetivoModal = dynamic(() => import("../components/Objetivo/RetiradaObjetivoModal"), {
  ssr: false,
});

// Importações dinâmicas dos painéis de objetivos para máxima performance
const Listagem = dynamic(() => import("../components/Objetivo/Listagem").then((m) => m.Listagem), {
  loading: () => (
    <Box display="flex" justifyContent="center" p={4}>
      <CircularProgress />
    </Box>
  ),
  ssr: false,
});

const ObjetivosDashboard = dynamic(() => import("../components/Objetivo/ObjetivosDashboard").then((m) => m.ObjetivosDashboard), {
  ssr: false,
});

export default function ObjetivosPage() {
  const theme = useTheme();
  const {
    objetivos,
    isLoading,
    isCreating,
    isUpdating,
    isEditing,
    isAporte,
    isRetiradaModalOpen,
    setIsRetiradaModalOpen,
    targetObjetivo,
    isAportando,
    control,
    handleSubmit,
    handleEdit,
    handleAporte,
    handleRetirada,
    handleDelete,
    handleToggleStatus,
    handleCancelEdit,
  } = useObjetivos();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isMobileForm = useMediaQuery(theme.breakpoints.down("sm"));
  const modalForm = useModalUrl("objetivoForm");
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);

  const BREADCRUMBS = [
    { title: "Dashboard", to: "/" },
    { title: "Objetivos", to: "/cadastros/objetivos" },
  ];

  const handleOpenAporte = (objetivo: Objetivo) => {
    handleAporte(objetivo);
    modalForm.openModal();
  };

  const handleNovoObjetivo = () => {
    handleCancelEdit();
    modalForm.openModal();
  };

  const handleEditarObjetivo = (objetivo: Objetivo) => {
    handleEdit(objetivo);
    modalForm.openModal();
  };

  const handleFecharFormulario = () => {
    handleCancelEdit();
    modalForm.closeModal();
  };

  const objetivosFiltrados = mostrarConcluidos ? objetivos : objetivos.filter(o => o.status === 'A');

  return (
    <PageContainer title="Objetivos" description="Gerencie seus objetivos financeiros e reservas">
      <Breadcrumb title="Objetivos" items={BREADCRUMBS} />

      {/* Dashboard de Totalizadores */}
      <Box mb={4}>
        <ObjetivosDashboard
          objetivos={objetivos}
          onNew={handleNovoObjetivo}
          mostrarConcluidas={mostrarConcluidos}
          onToggleConcluidas={setMostrarConcluidos}
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
              <Slide direction="right" in={modalForm.isOpen} mountOnEnter unmountOnExit>
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
                    targetObjetivo={targetObjetivo}
                  />
                </Grid>
              </Slide>
            ) : (
              <Dialog
                open={modalForm.isOpen}
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
                    targetObjetivo={targetObjetivo}
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
                ...(!isMobileForm && {
                  flexBasis: (modalForm.isOpen && !isMobile) ? '66.66% !important' : '100% !important',
                  maxWidth: (modalForm.isOpen && !isMobile) ? '66.66% !important' : '100% !important',
                }),
                ...(isMobileForm && {
                  width: '100% !important',
                })
              }}
            >
              <Listagem
                objetivos={objetivosFiltrados}
                isLoading={isLoading}
                onEdit={handleEditarObjetivo}
                onDelete={handleDelete}
                onAporte={handleOpenAporte}
                onRetirada={handleRetirada}
                onToggleStatus={handleToggleStatus}
                isFormOpen={modalForm.isOpen}
              />
            </Grid>
          </Grid>
        </ObjetivosDashboard>
      </Box>

      <RetiradaObjetivoModal
        open={isRetiradaModalOpen}
        onClose={() => setIsRetiradaModalOpen(false)}
        objetivo={targetObjetivo}
      />
    </PageContainer>
  );
}
