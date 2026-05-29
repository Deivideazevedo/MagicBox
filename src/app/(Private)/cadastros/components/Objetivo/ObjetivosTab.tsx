import { useState, useRef, useEffect } from "react";
import { ObjetivosDashboard } from "./ObjetivosDashboard";
import { Listagem } from "./Listagem";
import { Formulario } from "./Formulario";
import { useObjetivos } from "../../hooks/useObjetivos";
import { Objetivo } from "@/core/objetivos/types";
import { Box, Grid, Slide, useTheme } from "@mui/material";
import RetiradaObjetivoModal from "./RetiradaObjetivoModal";

export const ObjetivosTab = () => {
  const theme = useTheme();
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);

  const {
    objetivos,
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
    targetObjetivo,
  } = useObjetivos();

  const handleOpenNew = () => {
    handleCancelEdit();
    setExibirFormulario(true);
  };

  const handleOpenEdit = (objetivo: Objetivo) => {
    handleEdit(objetivo);
    setExibirFormulario(true);
  };

  const handleFecharFormulario = () => {
    handleCancelEdit();
    setExibirFormulario(false);
  };

  const handleAporteInterno = (objetivo: Objetivo) => {
    handleAporte(objetivo);
    setExibirFormulario(true);
  };

  const handleRetiradaInterno = (objetivo: Objetivo) => {
    handleRetirada(objetivo);
  };

  const objetivosFiltrados = mostrarConcluidas
    ? objetivos
    : objetivos.filter((m) => m.status === "A");

  return (
    <Box px={5} pt={1.5} pb={2.5}>
      <ObjetivosDashboard
        objetivos={objetivos}
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
                targetObjetivo={targetObjetivo}
              />
            </Grid>
          </Slide>

          <Grid item xs={12} md={exibirFormulario ? 8 : 12}>
            <Listagem
              objetivos={objetivosFiltrados}
              isLoading={isLoading}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onAporte={handleAporteInterno}
              onRetirada={handleRetiradaInterno}
              onToggleStatus={handleToggleStatus}
            />
          </Grid>
        </Grid>
      </ObjetivosDashboard>

      <RetiradaObjetivoModal
        open={isRetiradaModalOpen}
        onClose={() => setIsRetiradaModalOpen(false)}
        objetivo={targetObjetivo}
      />
    </Box>
  );
};

export default ObjetivosTab;
