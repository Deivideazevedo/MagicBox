import { useGetPerformanceQuery } from "@/services/endpoints/dashboardApi";
import { parseISO, format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthData {
  month: string;
  date: Date;
  receitasRealizadas: number;
  receitasProjetadas: number;
  despesasRealizadas: number;
  despesasProjetadas: number;
  metas: number;
  saldo: number;
}

export const useMonthlyChart = () => {
  const today = new Date();
  const currentYear = today.getFullYear();

  const { data: response, isLoading } = useGetPerformanceQuery({ 
    ano: currentYear 
  });

  const monthlyData: MonthData[] = (response || []).map((item) => {
    // Usar dataReferencia e validar se é uma data real
    const date = item.dataReferencia ? parseISO(item.dataReferencia) : new Date(NaN);
    
    const isDateValid = isValid(date);

    return {
      ...item,
      date: isDateValid ? date : new Date(),
      // Formatar o nome do mês localmente apenas se a data for válida
      month: isDateValid ? format(date, "MMM", { locale: ptBR }) : item.month || "---",
      saldo: (item.receitasRealizadas || 0) - (item.despesasRealizadas || 0) - (item.metas || 0)
    };
  });

  const currentMonth = monthlyData[today.getMonth()] || (monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : null);
  
  // Totais consolidados (Realizados)
  const totalReceitas = monthlyData.reduce((acc, month) => acc + (month.receitasRealizadas || 0), 0);
  const totalDespesas = monthlyData.reduce((acc, month) => acc + (month.despesasRealizadas || 0), 0);
  const totalMetas = monthlyData.reduce((acc, month) => acc + (month.metas || 0), 0);
  const saldoTotal = totalReceitas - totalDespesas - totalMetas;

  return {
    monthlyData,
    loading: isLoading,
    currentMonth,
    totalReceitas,
    totalDespesas,
    totalMetas,
    saldoTotal,
    percentualSaldo: totalReceitas > 0 ? ((saldoTotal / totalReceitas) * 100).toFixed(1) : "0"
  };
};