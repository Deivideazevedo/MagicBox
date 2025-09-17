import { useState, useEffect } from "react";

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  color: string;
  deadline: string;
}

export const useGoalsProgress = () => {
  // Por enquanto mantemos mock até termos uma API de metas
  // Em produção isso viria de uma API específica para metas financeiras
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Reserva de Emergência",
      current: 3500,
      target: 10000,
      color: "#13DEB9",
      deadline: "2024-12-31",
    },
    {
      id: "2",
      title: "Viagem para Europa",
      current: 2800,
      target: 8000,
      color: "#5D87FF",
      deadline: "2024-08-31",
    },
    {
      id: "3",
      title: "Novo Notebook",
      current: 1200,
      target: 2500,
      color: "#FFAE1F",
      deadline: "2024-06-30",
    },
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTimeRemaining = (deadline: string) => {
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

  const overallProgress = goals.reduce((acc, goal) => acc + calculateProgress(goal.current, goal.target), 0) / goals.length;

  return {
    goals,
    formatCurrency,
    calculateProgress,
    formatDeadline,
    getTimeRemaining,
    overallProgress
  };
};