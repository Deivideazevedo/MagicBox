"use client";

import React, { createContext, useContext, useRef } from "react";

export interface DashboardTourRefs {
  welcomeRef: any;
  summaryCardsRef: any;
  monthlyChartRef: any;
  goalsRef: any;
  recentTransactionsRef: any;
  upcomingBillsRef: any;
}

const DashboardTourContext = createContext<DashboardTourRefs | null>(null);

export const DashboardTourProvider = ({ children }: { children: React.ReactNode }) => {
  const refs: DashboardTourRefs = {
    welcomeRef: useRef<any>(null),
    summaryCardsRef: useRef<any>(null),
    monthlyChartRef: useRef<any>(null),
    goalsRef: useRef<any>(null),
    recentTransactionsRef: useRef<any>(null),
    upcomingBillsRef: useRef<any>(null),
  };

  return (
    <DashboardTourContext.Provider value={refs}>
      {children}
    </DashboardTourContext.Provider>
  );
};

export const useDashboardTourRefs = (): DashboardTourRefs => {
  const ctx = useContext(DashboardTourContext);
  if (!ctx) {
    throw new Error("useDashboardTourRefs deve ser usado dentro de <DashboardTourProvider>");
  }
  return ctx;
};
