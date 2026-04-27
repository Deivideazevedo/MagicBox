import { useState, useEffect, useMemo } from "react";
import { useGetLancamentosQuery } from "@/services/endpoints/lancamentosApi";
import { format, startOfMonth, endOfMonth, isWithinInterval, startOfYear, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lancamento } from "@/core/lancamentos/types";

interface MonthData {
  month: string;
  date: Date;
  receitas: number;
  despesas: number;
  metas: number;
  saldo: number;
}

export const useMonthlyChart = () => {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar lançamentos do ano atual (Janeiro a Dezembro)
  const today = new Date();
  const dataInicio = format(startOfYear(today), "yyyy-MM-dd");
  const dataFim = format(endOfYear(today), "yyyy-MM-dd");

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
      const monthsData: MonthData[] = [];
      const currentYear = today.getFullYear();

      // Criar dados para os 12 meses do ano atual
      for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
        const monthDate = new Date(currentYear, monthIdx, 1);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthName = format(monthDate, "MMM", { locale: ptBR });
        
        // Filtrar lançamentos do mês
        const monthLancamentos = lancamentos.filter((lancamento: Lancamento) => {
          const lancamentoDate = new Date(lancamento.data);
          return isWithinInterval(lancamentoDate, { start: monthStart, end: monthEnd });
        });

        // Calcular receitas, despesas e metas
        let receitas = 0;
        let despesas = 0;
        let metas = 0;

        monthLancamentos.forEach((lancamento: Lancamento) => {
          const valor = Math.abs(Number(lancamento.valor));
          
          if (lancamento.receitaId || lancamento.receita_id) {
            receitas += valor;
          } else if (lancamento.despesaId || lancamento.despesa_id) {
            despesas += valor;
          } else if (lancamento.metaId || lancamento.meta_id) {
            metas += valor;
          }
        });

        monthsData.push({
          month: monthName,
          date: monthDate,
          receitas,
          despesas,
          metas,
          saldo: receitas - despesas - metas
        });
      }

      setMonthlyData(monthsData);
      setLoading(false);
    }
  }, [lancamentos, isLoading]);

  const currentMonth = monthlyData[today.getMonth()] || monthlyData[monthlyData.length - 1];
  const totalReceitas = monthlyData.reduce((acc, month) => acc + month.receitas, 0);
  const totalDespesas = monthlyData.reduce((acc, month) => acc + month.despesas, 0);
  const totalMetas = monthlyData.reduce((acc, month) => acc + month.metas, 0);
  const saldoTotal = totalReceitas - totalDespesas - totalMetas;

  return {
    monthlyData,
    loading: loading || isLoading,
    currentMonth,
    totalReceitas,
    totalDespesas,
    totalMetas,
    saldoTotal,
    percentualSaldo: totalReceitas > 0 ? ((saldoTotal / totalReceitas) * 100).toFixed(1) : "0"
  };
};