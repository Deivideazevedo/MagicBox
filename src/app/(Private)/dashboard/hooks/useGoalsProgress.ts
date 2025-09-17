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
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    // Substitua a URL abaixo pela URL real da sua API de metas financeiras
    fetch("/api/goals")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao buscar metas");
        }
        return response.json();
      })
      .then((data: Goal[]) => {
        setGoals(data);
      })
      .catch((error) => {
        // Trate o erro conforme necessário (ex: mostrar mensagem ao usuário)
        console.error(error);
      });
  }, []);

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