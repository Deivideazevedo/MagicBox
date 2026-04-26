"use client";

import React, { createContext, useContext, useRef, MutableRefObject } from "react";

export interface DividasTourRefs {
  resumoRef: MutableRefObject<HTMLElement | null>;
  acoesRef: MutableRefObject<HTMLElement | null>;
  cardRef: MutableRefObject<HTMLElement | null>;
  chipTipoRef: MutableRefObject<HTMLElement | null>;
  progressoRef: MutableRefObject<HTMLElement | null>;
  menuRef: MutableRefObject<HTMLElement | null>;
  boasVindasRef: MutableRefObject<HTMLElement | null>; // sempre null, step sem target
  tituloRef: MutableRefObject<HTMLElement | null>;
}

const DividasTourContext = createContext<DividasTourRefs | null>(null);

export const DividasTourProvider = ({ children }: { children: React.ReactNode }) => {
  const refs: DividasTourRefs = {
    resumoRef: useRef<HTMLElement | null>(null),
    acoesRef: useRef<HTMLElement | null>(null),
    cardRef: useRef<HTMLElement | null>(null),
    chipTipoRef: useRef<HTMLElement | null>(null),
    progressoRef: useRef<HTMLElement | null>(null),
    menuRef: useRef<HTMLElement | null>(null),
    boasVindasRef: useRef<HTMLElement | null>(null),
    tituloRef: useRef<HTMLElement | null>(null),
  };

  return (
    <DividasTourContext.Provider value={refs}>
      {children}
    </DividasTourContext.Provider>
  );
};

export const useDividasTourRefs = (): DividasTourRefs => {
  const ctx = useContext(DividasTourContext);
  if (!ctx) {
    throw new Error("useDividasTourRefs deve ser usado dentro de <DividasTourProvider>");
  }
  return ctx;
};
