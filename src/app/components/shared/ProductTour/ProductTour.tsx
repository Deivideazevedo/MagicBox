"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
  IconButton,
  Portal,
  Fade,
} from "@mui/material";
import { IconX, IconChevronLeft, IconChevronRight, IconPlayerSkipForward } from "@tabler/icons-react";
import { TourStep } from "./useTour";

interface ProductTourProps {
  isOpen: boolean;
  step: TourStep | null;
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const SPOTLIGHT_PADDING = 10;
const TOOLTIP_GAP = 14;

export const ProductTour = ({
  isOpen,
  step,
  currentStep,
  totalSteps,
  isFirstStep,
  isLastStep,
  onNext,
  onPrev,
  onSkip,
}: ProductTourProps) => {
  const theme = useTheme();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [visible, setVisible] = useState(false);

  // Conteúdo "atrasado": só atualiza APÓS o fade-out terminar
  const [displayedStep, setDisplayedStep] = useState(step);
  const [displayedCurrentStep, setDisplayedCurrentStep] = useState(currentStep);
  const fadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const FADE_DURATION = 180;

  /**
   * Posiciona o tooltip em relação ao target.
   * 
   * Lógica de placement:
   * - Se o step define um placement (top/bottom/left/right), tenta usar.
   * - Em telas < 768px, left/right fazem fallback para top/bottom (evita overflow em mobile).
   * - Se o placement desejado não cabe, usa o fallback automático (abaixo > acima).
   */
  const positionTooltip = useCallback((rect: DOMRect | null, placement?: TourStep["placement"]) => {
    if (!tooltipRef.current) return;

    const tooltipEl = tooltipRef.current;
    const tooltipHeight = tooltipEl.offsetHeight || 300;
    const tooltipWidth = Math.min(400, window.innerWidth - 32);
    const isMobile = window.innerWidth < 768;

    // Sem target: centralizar na tela
    if (!rect) {
      setTooltipStyle({
        top: `${window.innerHeight / 2 - tooltipHeight / 2}px`,
        left: `${window.innerWidth / 2 - tooltipWidth / 2}px`,
        width: `${tooltipWidth}px`,
      });
      return;
    }

    // Espaços disponíveis em cada direção
    const spaceAbove = rect.top - SPOTLIGHT_PADDING;
    const spaceBelow = window.innerHeight - rect.bottom - SPOTLIGHT_PADDING;
    const spaceRight = window.innerWidth - rect.right - SPOTLIGHT_PADDING;
    const spaceLeft = rect.left - SPOTLIGHT_PADDING;

    let top: number;
    let left: number;

    // Em mobile, força top/bottom mesmo se o step pede left/right
    const effectivePlacement = (isMobile && (placement === "left" || placement === "right"))
      ? undefined
      : placement;

    // --- Tenta o placement solicitado ---
    if (effectivePlacement === "right" && spaceRight >= tooltipWidth + TOOLTIP_GAP) {
      // À direita do target
      left = rect.right + SPOTLIGHT_PADDING + TOOLTIP_GAP;
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
    } else if (effectivePlacement === "left" && spaceLeft >= tooltipWidth + TOOLTIP_GAP) {
      // À esquerda do target
      left = rect.left - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipWidth;
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
    } else if (effectivePlacement === "top" && spaceAbove >= tooltipHeight + TOOLTIP_GAP) {
      // Acima do target
      top = rect.top - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipHeight;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (effectivePlacement === "bottom" && spaceBelow >= tooltipHeight + TOOLTIP_GAP) {
      // Abaixo do target
      top = rect.bottom + SPOTLIGHT_PADDING + TOOLTIP_GAP;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else {
      // --- Fallback automático: abaixo > acima ---
      if (spaceBelow >= tooltipHeight + TOOLTIP_GAP) {
        top = rect.bottom + SPOTLIGHT_PADDING + TOOLTIP_GAP;
      } else if (spaceAbove >= tooltipHeight + TOOLTIP_GAP) {
        top = rect.top - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipHeight;
      } else {
        // Nenhum cabe perfeitamente — coloca onde tem mais espaço
        top = spaceBelow >= spaceAbove
          ? rect.bottom + SPOTLIGHT_PADDING + TOOLTIP_GAP
          : Math.max(16, rect.top - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipHeight);
      }
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    }

    // Clamp para não sair da tela
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

    setTooltipStyle({
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
    });
  }, []);

  const updatePosition = useCallback(() => {
    if (!step || !isOpen) return;

    const el = step.ref.current;
    if (!el) {
      // Step sem target (ex: boas-vindas)
      setTargetRect(null);
      // Aguarda o tooltip renderizar para pegar sua altura
      requestAnimationFrame(() => {
        positionTooltip(null);
        setVisible(true);
      });
      return;
    }

    // Scroll suave até o elemento
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Aguarda o scroll para pegar coordenadas corretas
    setTimeout(() => {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      // Aguarda o tooltip renderizar/atualizar para calcular posição
      requestAnimationFrame(() => {
        positionTooltip(rect, step.placement);
        setVisible(true);
      });
    }, 250);
  }, [step, isOpen, positionTooltip]);

  // Fluxo de transição entre steps:
  // 1. Fade-out com conteúdo ANTIGO
  // 2. Após fade-out terminar → atualiza conteúdo para o NOVO
  // 3. Reposiciona → Fade-in com conteúdo NOVO
  useEffect(() => {
    if (!isOpen || !step) return;

    // Limpa timer anterior
    if (fadeOutTimerRef.current) {
      clearTimeout(fadeOutTimerRef.current);
    }

    // Se é o primeiro render (ainda não tem displayedStep), mostra direto
    if (!displayedStep) {
      setDisplayedStep(step);
      setDisplayedCurrentStep(currentStep);
      updatePosition();
      return;
    }

    // Step mudou: inicia fade-out com conteúdo ANTIGO
    setVisible(false);

    // Após o fade-out terminar, troca o conteúdo e reposiciona
    fadeOutTimerRef.current = setTimeout(() => {
      setDisplayedStep(step);
      setDisplayedCurrentStep(currentStep);
      updatePosition();
    }, FADE_DURATION);

    return () => {
      if (fadeOutTimerRef.current) {
        clearTimeout(fadeOutTimerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentStep, isOpen]);

  // Recalcula no resize e scroll
  useEffect(() => {
    if (!isOpen) return;
    let rafId: number;
    const handleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!step?.ref.current) return;
        const rect = step.ref.current.getBoundingClientRect();
        setTargetRect(rect);
        positionTooltip(rect, step.placement);
      });
    };
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);
    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
      cancelAnimationFrame(rafId);
    };
  }, [isOpen, step, positionTooltip]);

  // Atalhos de teclado
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
      if (e.key === "ArrowRight" || e.key === "Enter") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onNext, onPrev, onSkip]);

  if (!isOpen || !displayedStep) return null;

  const progress = ((displayedCurrentStep + 1) / totalSteps) * 100;

  return (
    <Portal>
      {/* 
        Overlay: cobre toda a tela MENOS a área do target.
        Técnica: um elemento posicionado sobre o target com box-shadow enorme.
        O próprio elemento é transparente (o "furo"), o box-shadow é o overlay escuro.
      */}
      {targetRect ? (
        <>
          {/* Overlay com furo transparente */}
          <Box
            onClick={onSkip}
            sx={{
              position: "fixed",
              top: targetRect.top - SPOTLIGHT_PADDING,
              left: targetRect.left - SPOTLIGHT_PADDING,
              width: targetRect.width + SPOTLIGHT_PADDING * 2,
              height: targetRect.height + SPOTLIGHT_PADDING * 2,
              borderRadius: 3,
              // O elemento é transparente = furo. O box-shadow cobre o resto da tela.
              boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.55)`,
              zIndex: 9998,
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              pointerEvents: "none",
            }}
          />

          {/* Camada de click no overlay (senão o pointer-events:none impede o click para fechar) */}
          <Box
            onClick={onSkip}
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 9997,
            }}
          />

          {/* Borda luminosa no spotlight */}
          <Box
            sx={{
              position: "fixed",
              top: targetRect.top - SPOTLIGHT_PADDING,
              left: targetRect.left - SPOTLIGHT_PADDING,
              width: targetRect.width + SPOTLIGHT_PADDING * 2,
              height: targetRect.height + SPOTLIGHT_PADDING * 2,
              borderRadius: 3,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
              boxShadow: `
                0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)},
                0 0 24px ${alpha(theme.palette.primary.main, 0.12)}
              `,
              zIndex: 9999,
              pointerEvents: "none",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              animation: "tourSpotlightPulse 2.5s ease-in-out infinite",
              "@keyframes tourSpotlightPulse": {
                "0%, 100%": {
                  boxShadow: `
                    0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)},
                    0 0 24px ${alpha(theme.palette.primary.main, 0.12)}
                  `,
                },
                "50%": {
                  boxShadow: `
                    0 0 0 6px ${alpha(theme.palette.primary.main, 0.18)},
                    0 0 36px ${alpha(theme.palette.primary.main, 0.2)}
                  `,
                },
              },
            }}
          />
        </>
      ) : (
        // Sem target: overlay escuro inteiro
        <Box
          onClick={onSkip}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0, 0, 0, 0.55)",
            zIndex: 9998,
            transition: "opacity 0.4s ease",
          }}
        />
      )}

      {/* Tooltip — fade-out com conteúdo antigo, fade-in com conteúdo novo */}
      <Fade in={visible} timeout={FADE_DURATION}>
        <Box
          ref={tooltipRef}
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "fixed",
            ...tooltipStyle,
            zIndex: 10000,
            transition: "top 0.25s cubic-bezier(0.4, 0, 0.2, 1), left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              bgcolor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.background.paper, 0.98)
                  : "#fff",
              boxShadow: `
                0 20px 60px ${alpha("#000", 0.22)},
                0 0 0 1px ${alpha(theme.palette.primary.main, 0.06)}
              `,
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Barra de progresso gradiente */}
            <Box sx={{ position: "relative", height: 4, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  borderRadius: "0 4px 4px 0",
                }}
              />
            </Box>

            {/* Header */}
            <Box sx={{ p: 3, pb: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: 900,
                        flexShrink: 0,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    >
                      {displayedCurrentStep + 1}
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      fontWeight={700}
                      sx={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.6rem", lineHeight: 1 }}
                    >
                      Passo {displayedCurrentStep + 1} de {totalSteps}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{ lineHeight: 1.3, letterSpacing: "-0.02em", fontSize: "1.1rem" }}
                  >
                    {displayedStep.title}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={onSkip}
                  sx={{
                    ml: 1,
                    mt: -0.5,
                    color: "text.disabled",
                    "&:hover": { bgcolor: alpha(theme.palette.action.active, 0.08), color: "text.secondary" },
                  }}
                >
                  <IconX size={16} />
                </IconButton>
              </Stack>
            </Box>

            {/* Conteúdo */}
            <Box sx={{ px: 3, py: 1.5 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.8,
                  fontSize: "0.84rem",
                  whiteSpace: "pre-line",
                }}
              >
                {displayedStep.description}
              </Typography>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                px: 3,
                py: 2,
                mt: 0.5,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                bgcolor: alpha(theme.palette.action.hover, 0.015),
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                {!isFirstStep ? (
                  <Button
                    size="small"
                    onClick={onPrev}
                    startIcon={<IconChevronLeft size={16} />}
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      textTransform: "none",
                      borderRadius: 2,
                      px: 2,
                      "&:hover": { bgcolor: alpha(theme.palette.action.active, 0.05) },
                    }}
                  >
                    Anterior
                  </Button>
                ) : (
                  <Button
                    size="small"
                    onClick={onSkip}
                    startIcon={<IconPlayerSkipForward size={14} />}
                    sx={{
                      fontWeight: 600,
                      color: "text.disabled",
                      textTransform: "none",
                      borderRadius: 2,
                      px: 2,
                      fontSize: "0.75rem",
                      "&:hover": { color: "text.secondary" },
                    }}
                  >
                    Pular tour
                  </Button>
                )}

                <Button
                  size="small"
                  variant="contained"
                  onClick={onNext}
                  endIcon={!isLastStep ? <IconChevronRight size={16} /> : undefined}
                  sx={{
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: 2.5,
                    px: 3,
                    py: 1,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                    "&:hover": {
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.45)}`,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {isLastStep ? "Entendi tudo! 🚀" : "Próximo"}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Portal>
  );
};

export default ProductTour;
