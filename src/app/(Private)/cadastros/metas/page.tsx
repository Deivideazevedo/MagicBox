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
} from "@mui/material";
import {
  IconTarget,
  IconChevronDown,
  IconChevronUp,
  IconPlus,
} from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import TransactionModal from "../components/Common/TransactionModal";
import { Formulario } from "../components/Meta/Formulario";
import { Listagem } from "../components/Meta/Listagem";
import { MetasDashboard } from "../components/Meta/MetasDashboard";
import { useMetas } from "../hooks/useMetas";
import Slide from "@mui/material/Slide";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function MetasPage() {
  const theme = useTheme();
  const {
    metas,
    isLoading,
    isCreating,
    isUpdating,
    isEditing,
    isAporte,
    isRetirada,
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

  const handleOpenRetirada = (meta: Meta) => {
    handleRetirada(meta);
    setExibirFormulario(true);
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
            {/* Formulário lateral deslizante */}
            <Slide direction="right" in={exibirFormulario} mountOnEnter unmountOnExit>
              <Grid item xs={12} md={4} sx={{ flexShrink: 0 }}>
                <Formulario
                  isEditing={isEditing}
                  isAporte={isAporte}
                  isRetirada={isRetirada}
                  isAportando={isAportando}
                  row={null}
                  control={control}
                  handleSubmit={handleSubmit}
                  isCreating={isCreating}
                  isUpdating={isUpdating}
                  handleCancelEdit={handleFecharFormulario}
                />
              </Grid>
            </Slide>

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
                ...(!isMobile && {
                  flexBasis: exibirFormulario ? '66.66% !important' : '100% !important',
                  maxWidth: exibirFormulario ? '66.66% !important' : '100% !important',
                })
              }}
            >
              <Listagem
                metas={metasFiltradas}
                isLoading={isLoading}
                onEdit={handleEditarMeta}
                onDelete={handleDelete}
                onAporte={handleOpenAporte}
                onRetirada={handleOpenRetirada}
                onToggleStatus={handleToggleStatus}
              />
            </Grid>
          </Grid>
        </MetasDashboard>
      </Box>

    </PageContainer>
  );
}
