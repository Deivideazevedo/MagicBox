"use client";
import React, { createContext, useContext, useRef, MutableRefObject } from "react";

export interface DivergenciasTourRefs {
  boasVindasRef: MutableRefObject<HTMLDivElement | null>;
  scoreRef: MutableRefObject<HTMLDivElement | null>;
  conciliadorRef: MutableRefObject<HTMLDivElement | null>;
  diagnosticosRef: MutableRefObject<HTMLDivElement | null>;
  atrasadosCardRef: MutableRefObject<HTMLDivElement | null>;
  historicoRef: MutableRefObject<HTMLDivElement | null>;
}

const DivergenciasTourContext = createContext<DivergenciasTourRefs | null>(null);

export const DivergenciasTourProvider = ({ children }: { children: React.ReactNode }) => {
  const refs: DivergenciasTourRefs = {
    boasVindasRef: useRef<HTMLDivElement | null>(null),
    scoreRef: useRef<HTMLDivElement | null>(null),
    conciliadorRef: useRef<HTMLDivElement | null>(null),
    diagnosticosRef: useRef<HTMLDivElement | null>(null),
    atrasadosCardRef: useRef<HTMLDivElement | null>(null),
    historicoRef: useRef<HTMLDivElement | null>(null),
  };

  return (
    <DivergenciasTourContext.Provider value={refs}>
      {children}
    </DivergenciasTourContext.Provider>
  );
};

export const useDivergenciasTourRefs = (): DivergenciasTourRefs => {
  const ctx = useContext(DivergenciasTourContext);
  if (!ctx) {
    throw new Error("useDivergenciasTourRefs deve ser usado dentro de <DivergenciasTourProvider>");
  }
  return ctx;
};
