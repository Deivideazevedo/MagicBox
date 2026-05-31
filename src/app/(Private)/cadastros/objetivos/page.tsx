"use client";

import React, { useState, useRef, useEffect } from "react";
import PageContainer from "@/app/components/container/PageContainer";
import Breadcrumb from "@/app/(Private)/layout/shared/breadcrumb/Breadcrumb";
import { Objetivo } from "@/core/objetivos/types";
import {
  Box,
  Grid,
  Dialog,
  DialogContent,
  CircularProgress,
  useMediaQuery,
  useTheme,
  alpha,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { useObjetivos } from "../hooks/useObjetivos";
import { useModalUrl } from "@/hooks/useModalUrl";
import dynamic from "next/dynamic";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Importa os modais e formulários dinamicamente sob demanda
const Formulario = dynamic(
  () => import("../components/Objetivo/Formulario").then((m) => m.Formulario),
  {
    loading: () => (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    ),
    ssr: false,
  },
);

const RetiradaObjetivoModal = dynamic(
  () => import("../components/Objetivo/RetiradaObjetivoModal"),
  {
    ssr: false,
  },
);

// Importações dinâmicas dos painéis de objetivos para máxima performance
const Listagem = dynamic(
  () => import("../components/Objetivo/Listagem").then((m) => m.Listagem),
  {
    loading: () => (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    ),
    ssr: false,
  },
);

const ObjetivosDashboard = dynamic(
  () =>
    import("../components/Objetivo/ObjetivosDashboard").then(
      (m) => m.ObjetivosDashboard,
    ),
  {
    ssr: false,
  },
);

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
    setValue,
    handleSubmit,
    handleEdit,
    handleAporte,
    handleRetirada,
    handleDelete,
    handleToggleStatus,
    handleCancelEdit,
  } = useObjetivos();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const modalForm = useModalUrl("objetivoForm");
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);

  // Fechar formulário após criação/edição/aporte com sucesso
  const prevLoading = useRef({ isCreating, isUpdating, isAportando });
  useEffect(() => {
    const wasLoading =
      prevLoading.current.isCreating ||
      prevLoading.current.isUpdating ||
      prevLoading.current.isAportando;
    const isNowLoading = isCreating || isUpdating || isAportando;

    if (wasLoading && !isNowLoading) {
      modalForm.closeModal();
    }
    prevLoading.current = { isCreating, isUpdating, isAportando };
  }, [isCreating, isUpdating, isAportando]);

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

  const objetivosFiltrados = mostrarConcluidos
    ? objetivos
    : objetivos.filter((o) => o.status === "A");

  return (
    <PageContainer
      title="Objetivos"
      description="Gerencie seus objetivos financeiros e reservas"
    >
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
              flexWrap: isMobile ? "wrap" : "nowrap",
              alignItems: "flex-start",
            }}
          >
            {/* Formulário: Lateral no Desktop / Modal no Mobile */}
            {!isMobile ? (
              <Slide
                direction="right"
                in={modalForm.isOpen}
                mountOnEnter
                unmountOnExit
              >
                <Grid item xs={12} md={4} sx={{ flexShrink: 0 }}>
                  <Formulario
                    isEditing={isEditing}
                    isAporte={isAporte}
                    isAportando={isAportando}
                    row={null}
                    control={control}
                    setValue={setValue}
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
                TransitionComponent={Transition}
                keepMounted={false}
                fullWidth
                maxWidth="sm"
                sx={{
                  "& .MuiDialog-container": {
                    alignItems: "flex-end", // Alinha no final da tela (Bottom Sheet)
                  },
                  "& .MuiCard-root": {
                    boxShadow: "none",
                    border: "none",
                    borderRadius: 0,
                    bgcolor: "transparent",
                  },
                  "& .MuiCardContent-root": {
                    p: { xs: 2.5, sm: 3 },
                  },
                }}
                PaperProps={{
                  sx: {
                    borderRadius: "24px 24px 0 0",
                    m: 0,
                    width: "100%",
                    maxWidth: "100%",
                    maxHeight: "85vh",
                    bgcolor: "background.paper",
                    border: "none",
                    boxShadow: `0 -10px 40px ${alpha(theme.palette.common.black, 0.25)}`,
                    overflowY: "auto",
                  },
                }}
              >
                <DialogContent sx={{ p: 0 }}>
                  <Formulario
                    isEditing={isEditing}
                    isAporte={isAporte}
                    isAportando={isAportando}
                    row={null}
                    control={control}
                    setValue={setValue}
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
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                width: "100%",
                ...(!isMobile && {
                  flexBasis: modalForm.isOpen
                    ? "66.66% !important"
                    : "100% !important",
                  maxWidth: modalForm.isOpen
                    ? "66.66% !important"
                    : "100% !important",
                }),
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
