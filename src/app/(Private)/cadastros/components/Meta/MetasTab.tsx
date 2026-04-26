import { useState, useRef, useEffect } from "react";
import { MetasDashboard } from "./MetasDashboard";
import { Listagem } from "./Listagem";
import { Formulario } from "./Formulario";
import { useMetas } from "../../hooks/useMetas";
import { Meta } from "@/core/metas/types";
import { Box, Grid, Slide, useTheme } from "@mui/material";
import RetiradaMetaModal from "./RetiradaMetaModal";

export const MetasTab = () => {
  const theme = useTheme();
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);

  const {
    metas,
    isLoading,
    isCreating,
    isUpdating,
    isEditing,
    isAporte,
    isRetiradaModalOpen,
    setIsRetiradaModalOpen,
    isAportando,
    control,
    handleSubmit,
    handleEdit,
    handleAporte,
    handleRetirada,
    handleDelete,
    handleToggleStatus,
    handleCancelEdit,
    targetMeta,
  } = useMetas();

  const handleOpenNew = () => {
    handleCancelEdit();
    setExibirFormulario(true);
  };

  const handleOpenEdit = (meta: Meta) => {
    handleEdit(meta);
    setExibirFormulario(true);
  };

  const handleFecharFormulario = () => {
    handleCancelEdit();
    setExibirFormulario(false);
  };

  const handleAporteInterno = (meta: Meta) => {
    handleAporte(meta);
    setExibirFormulario(true);
  };

  const handleRetiradaInterno = (meta: Meta) => {
    handleRetirada(meta);
  };

  const metasFiltradas = mostrarConcluidas
    ? metas
    : metas.filter((m) => m.status === "A");

  return (
    <Box px={5} pt={1.5} pb={2.5}>
      <MetasDashboard
        metas={metas}
        onNew={handleOpenNew}
        mostrarConcluidas={mostrarConcluidas}
        onToggleConcluidas={setMostrarConcluidas}
      >
        <Grid container spacing={3}>
          <Slide
            direction="right"
            in={exibirFormulario}
            mountOnEnter
            unmountOnExit
          >
            <Grid item xs={12} md={4}>
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

          <Grid item xs={12} md={exibirFormulario ? 8 : 12}>
            <Listagem
              metas={metasFiltradas}
              isLoading={isLoading}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onAporte={handleAporteInterno}
              onRetirada={handleRetiradaInterno}
              onToggleStatus={handleToggleStatus}
            />
          </Grid>
        </Grid>
      </MetasDashboard>

      <RetiradaMetaModal
        open={isRetiradaModalOpen}
        onClose={() => setIsRetiradaModalOpen(false)}
        meta={targetMeta}
      />
    </Box>
  );
};

export default MetasTab;
