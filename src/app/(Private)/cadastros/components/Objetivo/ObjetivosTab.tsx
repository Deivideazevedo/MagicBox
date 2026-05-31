import React, { useState, useRef, useEffect } from "react";
import { ObjetivosDashboard } from "./ObjetivosDashboard";
import { Listagem } from "./Listagem";
import { Formulario } from "./Formulario";
import { useObjetivos } from "../../hooks/useObjetivos";
import { Objetivo } from "@/core/objetivos/types";
import { Box, Grid, Slide, useTheme, useMediaQuery, Dialog, alpha } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import RetiradaObjetivoModal from "./RetiradaObjetivoModal";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const ObjetivosTab = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
    setValue,
    handleSubmit,
    handleEdit,
    handleAporte,
    handleRetirada,
    handleDelete,
    handleToggleStatus,
    handleCancelEdit,
    targetObjetivo,
  } = useObjetivos();

  // Fechar formulário após criação/edição/aporte com sucesso
  const prevLoading = useRef({ isCreating, isUpdating, isAportando });
  useEffect(() => {
    const wasLoading = prevLoading.current.isCreating || prevLoading.current.isUpdating || prevLoading.current.isAportando;
    const isNowLoading = isCreating || isUpdating || isAportando;
    
    if (wasLoading && !isNowLoading) {
      setExibirFormulario(false);
    }
    prevLoading.current = { isCreating, isUpdating, isAportando };
  }, [isCreating, isUpdating, isAportando]);

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
        <Grid
          container
          spacing={3}
          sx={{
            flexWrap: isMobile ? "wrap" : "nowrap",
            alignItems: "flex-start",
          }}
        >
          {/* Formulário: Lateral no Desktop */}
          {!isMobile && (
            <Slide
              direction="right"
              in={exibirFormulario}
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
                  handleSubmit={handleSubmit}
                  isCreating={isCreating}
                  isUpdating={isUpdating}
                  handleCancelEdit={handleFecharFormulario}
                  targetObjetivo={targetObjetivo}
                  setValue={setValue}
                />
              </Grid>
            </Slide>
          )}

          {/* Listagem */}
          <Grid
            item
            xs={12}
            sx={{
              flexGrow: 1,
              minWidth: 0,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              width: "100%",
              ...(!isMobile && {
                flexBasis:
                  exibirFormulario
                    ? "66.66% !important"
                    : "100% !important",
                maxWidth:
                  exibirFormulario
                    ? "66.66% !important"
                    : "100% !important",
              }),
            }}
          >
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

      {/* Formulário responsivo: Dialog BottomSheet no Mobile */}
      {isMobile && (
        <Dialog
          open={exibirFormulario}
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
            }
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
            setValue={setValue}
          />
        </Dialog>
      )}

      <RetiradaObjetivoModal
        open={isRetiradaModalOpen}
        onClose={() => setIsRetiradaModalOpen(false)}
        objetivo={targetObjetivo}
      />
    </Box>
  );
};

export default ObjetivosTab;
