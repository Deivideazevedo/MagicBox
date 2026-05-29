"use client";

import PageContainer from "@/app/components/container/PageContainer";
import { Divida, DividaUnica } from "@/core/dividas/types";
import {
  Box,
  Grid,
  useTheme,
  Slide,
  Dialog,
  DialogContent,
  useMediaQuery,
} from "@mui/material";
import {
  IconHelp,
} from "@tabler/icons-react";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { CircularProgress } from "@mui/material";
import { Formulario } from "../components/Divida/Formulario";

// Importações dinâmicas de componentes pesados para reduzir bundle size
const Listagem = dynamic(() => import("../components/Divida/Listagem").then((m) => m.Listagem), {
  loading: () => (
    <Box display="flex" justifyContent="center" p={4}>
      <CircularProgress />
    </Box>
  ),
  ssr: false,
});

const DividasDashboard = dynamic(() => import("../components/Divida/DividasDashboard").then((m) => m.DividasDashboard), {
  ssr: false,
});

const ProductTour = dynamic(() => import("@/app/components/shared/ProductTour").then((m) => m.ProductTour), {
  ssr: false,
});

import { useDividas } from "../hooks/useDividas";
import { useTour } from "@/app/components/shared/ProductTour";
import {
  DividasTourProvider,
  useDividasTourRefs,
} from "../components/Divida/DividasTourContext";
import { criarDividasTourSteps } from "../components/Divida/dividasTourSteps";

function DividasPageContent() {
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
    autoStart: dividas.length > 0,
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
    <PageContainer
      title="Dívidas com Prazo"
      description="Gerencie a evolução e o encerramento de suas dívidas"
    >

      <Box mb={4}>
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
          showTourButton={dividas.length > 0}
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
                    exibirFormulario && !isMobile
                      ? "66.66% !important"
                      : "100% !important",
                  maxWidth:
                    exibirFormulario && !isMobile
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
                isFormOpen={exibirFormulario}
              />
            </Grid>
          </Grid>
        </DividasDashboard>
      </Box>

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
    </PageContainer>
  );
}

// Exportação principal: Provider envolve o conteúdo para que os refs estejam disponíveis em todos os filhos
export default function DividasPage() {
  return (
    <DividasTourProvider>
      <DividasPageContent />
    </DividasTourProvider>
  );
}
