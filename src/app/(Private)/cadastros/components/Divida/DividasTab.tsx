"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { ProductTour, useTour } from "@/app/components/shared/ProductTour";
import { Divida, DividaUnica } from "@/core/dividas/types";
import {
  Box,
  Dialog,
  DialogContent,
  Grid,
  Slide,
  useMediaQuery,
  useTheme,
  alpha,
  Stack,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { useDividas } from "../../hooks/useDividas";
import { DividasDashboard } from "./DividasDashboard";
import { DividasTourProvider, useDividasTourRefs } from "./DividasTourContext";
import { criarDividasTourSteps } from "./dividasTourSteps";
import { Formulario } from "./Formulario";
import { Listagem } from "./Listagem";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const DividasTab = () => {
  return (
    <DividasTourProvider>
      <DividasTabContent />
    </DividasTourProvider>
  );
};

const DividasTabContent = () => {
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
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);

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

  // Tour guiado com refs
  const tourRefs = useDividasTourRefs();
  const tourSteps = useMemo(() => criarDividasTourSteps(tourRefs), [tourRefs]);
  const tour = useTour({
    storageKey: "tour-dividas-visto-v2",
    steps: tourSteps,
    autoStart: true,
  });

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

  const { dividasPrazo, despesasFixas } = useMemo(() => {
    const filtradas = mostrarConcluidas
      ? dividas
      : dividas.filter((d: Divida) => d.status === "A");

    return {
      dividasPrazo: filtradas.filter((d) => d.tipo !== "FIXA"),
      despesasFixas: filtradas.filter((d) => d.tipo === "FIXA"),
    };
  }, [dividas, mostrarConcluidas]);

  const temDados = dividasPrazo.length > 0 || despesasFixas.length > 0;

  return (
    <Box px={5} pt={1.5} pb={2.5}>
      <DividasDashboard
        resumo={
          resumo || {
            totalDevidoUnicas: 0,
            totalPagoUnicas: 0,
            totalAgendadoVolateis: 0,
            quantidadeTotalParcelas: 0,
            dividasAtrasadas: 0,
            proximosVencimentos: 0,
          }
        }
        onNew={handleNovaDivida}
        mostrarConcluidas={mostrarConcluidas}
        onToggleConcluidas={setMostrarConcluidas}
        onStartTour={() => {
          tour.reset();
          tour.start();
        }}
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
              in={exibirFormulario}
              mountOnEnter
              unmountOnExit
            >
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
            {!temDados ? (
              <Listagem
                dividas={[]}
                isLoading={isLoading}
                onEdit={handleEditarDivida}
                onDelete={handleDelete}
                onAporte={handleOpenAporte}
                onToggleStatus={handleToggleStatus}
                isFormOpen={exibirFormulario}
              />
            ) : (
              <Stack spacing={4}>
                {dividasPrazo.length > 0 && (
                  <Box>
                    <Listagem
                      dividas={dividasPrazo}
                      isLoading={isLoading}
                      onEdit={handleEditarDivida}
                      onDelete={handleDelete}
                      onAporte={handleOpenAporte}
                      onToggleStatus={handleToggleStatus}
                      isFormOpen={exibirFormulario}
                    />
                  </Box>
                )}

                {despesasFixas.length > 0 && (
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{ mb: 2.5, letterSpacing: "-0.5px", color: "text.primary" }}
                    >
                      Despesas Fixas do Mês
                    </Typography>
                    <Listagem
                      dividas={despesasFixas}
                      isLoading={isLoading}
                      onEdit={handleEditarDivida}
                      onDelete={handleDelete}
                      onAporte={handleOpenAporte}
                      onToggleStatus={handleToggleStatus}
                      isFormOpen={exibirFormulario}
                    />
                  </Box>
                )}
              </Stack>
            )}
          </Grid>
        </Grid>
      </DividasDashboard>

      {/* Tour Guiado */}
      <ProductTour
        isOpen={tour.isOpen}
        step={tour.step}
        currentStep={tour.currentStep}
        totalSteps={tour.totalSteps}
        isFirstStep={tour.isFirstStep}
        isLastStep={tour.isLastStep}
        onNext={tour.next}
        onPrev={tour.prev}
        onSkip={tour.skip}
      />
    </Box>
  );
};

export default DividasTab;
