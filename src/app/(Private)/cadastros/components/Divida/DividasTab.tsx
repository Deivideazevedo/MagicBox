"use client";

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
} from "@mui/material";
import { useMemo, useState } from "react";
import { useDividas } from "../../hooks/useDividas";
import { DividasDashboard } from "./DividasDashboard";
import { DividasTourProvider, useDividasTourRefs } from "./DividasTourContext";
import { criarDividasTourSteps } from "./dividasTourSteps";
import { Formulario } from "./Formulario";
import { Listagem } from "./Listagem";

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
  const isMobileForm = useMediaQuery(theme.breakpoints.down("sm"));
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);

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

  const dividasFiltradas = mostrarConcluidas
    ? dividas
    : dividas.filter((d: Divida) => d.status === "A");

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
          {!isMobileForm ? (
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
              fullWidth
              maxWidth="xs"
              PaperProps={{
                sx: { borderRadius: 4, bgcolor: "background.paper" },
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
              ...(!isMobileForm && {
                flexBasis:
                  exibirFormulario && !isMobileForm
                    ? "66.66% !important"
                    : "100% !important",
                maxWidth:
                  exibirFormulario && !isMobileForm
                    ? "66.66% !important"
                    : "100% !important",
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
