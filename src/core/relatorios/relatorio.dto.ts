import { TipoDespesa } from "@prisma/client";

export interface RelatorioFiltros {
  userId: number;
  dataInicio: string; // ISO String (yyyy-mm-dd)
  dataFim: string;    // ISO String (yyyy-mm-dd)
}

export interface ItemRelatorio {
  id: number;
  nome: string;
  tipo: "RECEITA" | "DESPESA" | "META";
  valorPlanejado: number;
  valorRealizado: number;
  deficit: number;
  mediaMensal: number;
  status: string;
  historicoMensal: Array<{
    mes: string;
    ano: number;
    valor: number;
    deficit: number;
  }>;
}

export interface CategoriaRelatorio {
  id: number;
  nome: string;
  icone?: string;
  cor?: string;
  valorPlanejado: number;
  valorRealizado: number;
  deficit: number;
  itens: ItemRelatorio[];
}

export interface ResumoRelatorio {
  totalReceitas: number;
  receitasPagas: number;
  totalDespesas: number;
  despesasPagas: number;
  totalMetas: number;
  metasPorcentagem: number; // Porcentagem de conclusão das metas com alvo
  saldoLivre: number;
  saldoProjetado: number;
  saldoBloqueado: number; // Valor em metas
  dividaPendente: number; // Qtd de despesas agendadas e não pagas no período
}

export interface RelatorioResponse {
  periodo: {
    dataInicio: string;
    dataFim: string;
  };
  resumo: ResumoRelatorio;
  categorias: CategoriaRelatorio[];
  evolucao: Array<{
    mes: string;
    receitas: number;
    despesas: number;
    investimentos: number; // Metas
  }>;
}
