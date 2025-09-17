import { useState, useEffect } from "react";
import { useGetLancamentosQuery } from "@/services/endpoints/lancamentosApi";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export const useMonthlyChart = () => {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar lançamentos dos últimos 6 meses
  const today = new Date();
  const dataInicio = format(startOfMonth(subMonths(today, 5)), "yyyy-MM-dd");
  const dataFim = format(endOfMonth(today), "yyyy-MM-dd");

  const { data: lancamentos = [], isLoading } = useGetLancamentosQuery({
    dataInicio,
    dataFim
  });

  useEffect(() => {
    if (!isLoading && lancamentos) {
      const monthsData: MonthData[] = [];

      // Criar dados para os últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthName = format(monthDate, "MMM", { locale: ptBR });
        
        // Filtrar lançamentos do mês
        const monthLancamentos = lancamentos.filter(lancamento => {
          const lancamentoDate = new Date(lancamento.data);
          return isWithinInterval(lancamentoDate, { start: monthStart, end: monthEnd });
        });

        // Calcular receitas e despesas
        let receitas = 0;
        let despesas = 0;

        monthLancamentos.forEach(lancamento => {
          if (lancamento.tipo === 'pagamento') {
            if (lancamento.valor > 0) {
              receitas += lancamento.valor;
            } else {
              despesas += Math.abs(lancamento.valor);
            }
          }
        });

        monthsData.push({
          month: monthName,
          receitas,
          despesas,
          saldo: receitas - despesas
        });
      }

      setMonthlyData(monthsData);
      setLoading(false);
    }
  }, [lancamentos, isLoading]);

  const currentMonth = monthlyData[monthlyData.length - 1];
  const totalReceitas = monthlyData.reduce((acc, month) => acc + month.receitas, 0);
  const totalDespesas = monthlyData.reduce((acc, month) => acc + month.despesas, 0);
  const saldoTotal = totalReceitas - totalDespesas;

  return {
    monthlyData,
    loading: loading || isLoading,
    currentMonth,
    totalReceitas,
    totalDespesas,
    saldoTotal,
    percentualSaldo: totalReceitas > 0 ? ((saldoTotal / totalReceitas) * 100).toFixed(1) : "0"
  };
};