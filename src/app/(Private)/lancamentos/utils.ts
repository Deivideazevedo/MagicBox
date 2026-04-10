import { FindAllFilters } from "@/dtos";

export interface FiltrosLancamentos {
  dataInicio?: string;
  dataFim?: string;
  categoriaId?: number | null;
  item?: string | null;
  observacao?: string;
  origem?: "despesa" | "renda" | "";
  tipo?: "pagamento" | "agendamento" | "";
}

// Função para obter primeiro e último dia do mês atual
export const getDefaultDates = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    dataInicio: firstDay.toISOString().split("T")[0],
    dataFim: lastDay.toISOString().split("T")[0],
  };
};

export const getDefaultFilters = (): FindAllFilters => {
  const dates = getDefaultDates();
  return {
    ...dates,
    page: 0,
    limit: 10,
    origem: "",
    tipo: undefined,
    observacao: undefined,
    categoriaId: undefined,
    despesaId: undefined,
    fonteRendaId: undefined,
  };
};
