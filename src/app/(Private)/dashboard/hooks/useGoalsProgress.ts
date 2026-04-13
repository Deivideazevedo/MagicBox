"use client";

import { useGetMetasQuery } from "@/services/endpoints/metasApi";

export const useGoalsProgress = () => {
  const { data: metas = [], isLoading } = useGetMetasQuery();

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
  const goals = metas.map(meta => ({
    id: meta.id,
    title: meta.nome,
    current: meta.valorAcumulado || 0,
    target: meta.valorMeta,
    deadline: meta.dataAlvo,
    color: meta.cor || "#5D87FF",
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