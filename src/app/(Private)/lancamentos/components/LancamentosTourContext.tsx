"use client";

import React, { createContext, useContext, useRef } from "react";

export interface LancamentosTourRefs {
  tituloRef: any;
  filtrosRef: any;
  seletorPeriodoRef: any;
  botaoFiltrosRef: any;
  filtrosAdicionaisRef: any;
  tabelaRef: any;
  selectAllRef: any;
  primeiraAcaoRef: any;
  boasVindasRef: any;
}

const LancamentosTourContext = createContext<LancamentosTourRefs | null>(null);

export const LancamentosTourProvider = ({ children }: { children: React.ReactNode }) => {
  const refs: LancamentosTourRefs = {
    tituloRef: useRef<any>(null),
    filtrosRef: useRef<any>(null),
    seletorPeriodoRef: useRef<any>(null),
    botaoFiltrosRef: useRef<any>(null),
    filtrosAdicionaisRef: useRef<any>(null),
    tabelaRef: useRef<any>(null),
    selectAllRef: useRef<any>(null),
    primeiraAcaoRef: useRef<any>(null),
    boasVindasRef: useRef<any>(null),
  };

  return (
    <LancamentosTourContext.Provider value={refs}>
      {children}
    </LancamentosTourContext.Provider>
  );
};

export const useLancamentosTourRefs = (): LancamentosTourRefs => {
  const ctx = useContext(LancamentosTourContext);
  if (!ctx) {
    throw new Error("useLancamentosTourRefs deve ser usado dentro de <LancamentosTourProvider>");
  }
  return ctx;
};
