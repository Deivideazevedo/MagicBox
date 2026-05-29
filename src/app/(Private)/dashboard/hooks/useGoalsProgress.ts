"use client";

import { useGetObjetivosQuery } from "@/services/endpoints/objetivosApi";

export const useGoalsProgress = (date?: Date) => {
  const { data: objetivos = [], isLoading } = useGetObjetivosQuery();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateProgress = (current: number, target: number) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getTimeRemaining = (deadline: string | Date | null) => {
    if (!deadline) return "Sem prazo";
    
    const now = new Date();
    const target = new Date(deadline);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Vencido";
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "1 dia";
    if (diffDays < 30) return `${diffDays} dias`;
    
    const diffMonths = Math.ceil(diffDays / 30);
    return diffMonths === 1 ? "1 mês" : `${diffMonths} meses`;
  };

  // Mapeia para o formato esperado pelo componente GoalsProgress (Legacy support)
  const goals = objetivos.map(objetivo => ({
    id: objetivo.id,
    title: objetivo.nome,
    current: objetivo.valorAcumulado || 0,
    target: objetivo.valorObjetivo ? Number(objetivo.valorObjetivo) : 0,
    deadline: objetivo.dataAlvo,
    color: objetivo.cor || "#5D87FF",
  }));

  const overallProgress = goals.length > 0 
    ? goals.reduce((acc, goal) => acc + calculateProgress(goal.current, goal.target), 0) / goals.length 
    : 0;


  return {
    goals,
    isLoading,
    formatCurrency,
    calculateProgress,
    getTimeRemaining,
    overallProgress
  };
};