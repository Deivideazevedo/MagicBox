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
import dynamic from "next/dynamic";
import { CircularProgress } from "@mui/material";

// Importa os modais e formulários dinamicamente sob demanda
const Formulario = dynamic(() => import("../components/Meta/Formulario").then((m) => m.Formulario), {
  loading: () => (
    <Box display="flex" justifyContent="center" alignItems="center" p={3}>
      <CircularProgress />
    </Box>
  ),
  ssr: false,
});

const RetiradaMetaModal = dynamic(() => import("../components/Meta/RetiradaMetaModal"), {
  ssr: false,
});

// Importações dinâmicas dos painéis de metas para máxima performance
const Listagem = dynamic(() => import("../components/Meta/Listagem").then((m) => m.Listagem), {
  loading: () => (
    <Box display="flex" justifyContent="center" p={4}>
      <CircularProgress />
    </Box>
  ),
  ssr: false,
});

const MetasDashboard = dynamic(() => import("../components/Meta/MetasDashboard").then((m) => m.MetasDashboard), {
  ssr: false,
});
import { useMetas } from "../hooks/useMetas";
import Slide from "@mui/material/Slide";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useModalUrl } from "@/hooks/useModalUrl";

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
  } = useMetas();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isMobileForm = useMediaQuery(theme.breakpoints.down("sm"));
  const modalForm = useModalUrl("metaForm");
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
    modalForm.openModal();
  };

  const handleNovaMeta = () => {
    handleCancelEdit();
    modalForm.openModal();
  };

  const handleEditarMeta = (meta: Meta) => {
    handleEdit(meta);
    modalForm.openModal();
  };

  const handleFecharFormulario = () => {
    handleCancelEdit();
    modalForm.closeModal();
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
                    targetMeta={targetMeta}
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
                  flexBasis: (modalForm.isOpen && !isMobileForm) ? '66.66% !important' : '100% !important',
                  maxWidth: (modalForm.isOpen && !isMobileForm) ? '66.66% !important' : '100% !important',
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

      <RetiradaMetaModal
        open={isRetiradaModalOpen}
        onClose={() => setIsRetiradaModalOpen(false)}
        meta={targetMeta}
      />
    </PageContainer>
  );
}
