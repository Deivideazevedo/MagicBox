import { useState, useCallback, useEffect, useRef, MutableRefObject } from "react";

export interface TourStep {
  /** Ref do elemento alvo — quando null, o tooltip fica centralizado na tela */
  ref: MutableRefObject<HTMLElement | null>;
  /** Título do passo */
  title: string;
  /** Descrição do passo (suporta múltiplas linhas) */
  description: string;
  /** Posição preferida do tooltip em relação ao alvo */
  placement?: "top" | "bottom" | "left" | "right";
}

interface UseTourOptions {
  /** Chave única para persistir no localStorage */
  storageKey: string;
  /** Lista dos passos do tour */
  steps: TourStep[];
  /** Se true, exibe automaticamente na primeira visita */
  autoStart?: boolean;
}

export const useTour = ({ storageKey, steps, autoStart = true }: UseTourOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Verifica se o tour já foi visto
  useEffect(() => {
    if (autoStart && typeof window !== "undefined") {
      const alreadySeen = localStorage.getItem(storageKey);
      if (!alreadySeen && steps.length > 0) {
        // Delay para garantir que os elementos estejam renderizados
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [autoStart, storageKey, steps.length]);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const next = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Último passo: fechar e marcar como visto
      setIsOpen(false);
      setCurrentStep(0);
      localStorage.setItem(storageKey, "true");
    }
  }, [currentStep, steps.length, storageKey]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(0);
    localStorage.setItem(storageKey, "true");
  }, [storageKey]);

  const reset = useCallback(() => {
    localStorage.removeItem(storageKey);
    setCurrentStep(0);
  }, [storageKey]);

  return {
    isOpen,
    currentStep,
    totalSteps: steps.length,
    step: steps[currentStep] || null,
    start,
    next,
    prev,
    skip,
    reset,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  };
};
