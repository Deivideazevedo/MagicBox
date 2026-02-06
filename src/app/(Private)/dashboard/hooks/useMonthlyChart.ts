import { useState, useEffect, useMemo } from "react";
import { useGetLancamentosQuery } from "@/services/endpoints/lancamentosApi";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lancamento } from "@/core/lancamentos/types";

interface MonthData {
  month: string;
  receitas: number;
  categorias: number;
  saldo: number;
}

export const useMonthlyChart = () => {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar lançamentos dos últimos 6 meses
  const dataInicio = format(startOfMonth(subMonths(new Date(), 5)), "yyyy-MM-dd");
  const dataFim = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const queryParams = {
    page: 0,
    limit: 1000,
    dataInicio,
    dataFim
  };

  const { data: response, isLoading } = useGetLancamentosQuery(queryParams);

  // Extrair array de lancamentos da resposta paginada (memoizado para evitar re-renders)
  const lancamentos = useMemo(() => {
    return Array.isArray(response) ? response : response?.data || [];
  }, [response]);

  useEffect(() => {
    if (!isLoading && lancamentos) {
      const today = new Date();
      const monthsData: MonthData[] = [];

      // Criar dados para os últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthName = format(monthDate, "MMM", { locale: ptBR });
        
        // Filtrar lançamentos do mês
        const monthLancamentos = lancamentos.filter((lancamento: Lancamento) => {
          const lancamentoDate = new Date(lancamento.data);
          return isWithinInterval(lancamentoDate, { start: monthStart, end: monthEnd });
        });

        // Calcular receitas e categorias
        let receitas = 0;
        let categorias = 0;

        monthLancamentos.forEach((lancamento: Lancamento) => {
          const valor = Number(lancamento.valor);
          if (lancamento.tipo === 'pagamento') {
            if (valor > 0) {
              receitas += valor;
            } else {
              categorias += Math.abs(valor);
            }
          }
        });

        monthsData.push({
          month: monthName,
          receitas,
          categorias,
          saldo: receitas - categorias
        });
      }

      setMonthlyData(monthsData);
      setLoading(false);
    }
  }, [lancamentos, isLoading]);

  const currentMonth = monthlyData[monthlyData.length - 1];
  const totalReceitas = monthlyData.reduce((acc, month) => acc + month.receitas, 0);
  const totalCategorias = monthlyData.reduce((acc, month) => acc + month.categorias, 0);
  const saldoTotal = totalReceitas - totalCategorias;

  return {
    monthlyData,
    loading: loading || isLoading,
    currentMonth,
    totalReceitas,
    totalCategorias,
    saldoTotal,
    percentualSaldo: totalReceitas > 0 ? ((saldoTotal / totalReceitas) * 100).toFixed(1) : "0"
  };
};