import { TipoDespesa } from "@prisma/client";

export interface RelatorioFiltros {
  userId: number;
  dataInicio: string; // ISO String (yyyy-mm-dd)
  dataFim: string;    // ISO String (yyyy-mm-dd)
  page?: number;
  limit?: number;
}

export interface DetalheRelatorio {
  id: number;
  nome: string;
  tipo: "RECEITA" | "DESPESA" | "META";
  valorPlanejado: number;
  valorRealizado: number;
  restante: number;
  mediaMensal: number;
  isProjecao: boolean;
  status: string;
}

export interface CategoriaRelatorio {
  id: number;
  nome: string;
  icone?: string;
  cor?: string;
  valorPlanejado: number;
  valorRealizado: number;
  restante: number;
  detalhes: DetalheRelatorio[];
}

export interface ResumoRelatorio {
  totalReceitas: number;
  receitasPagas: number;
  totalDespesas: number;
  despesasPagas: number;
  totalMetas: number;
  metasPorcentagem: number;
  saldoLivre: number;
  saldoProjetado: number;
  saldoBloqueado: number;
  dividaPendente: number;
}

export interface RelatorioResponse {
  periodo: {
    dataInicio: string;
    dataFim: string;
  };
  resumo: ResumoRelatorio;
  categorias: CategoriaRelatorio[];
  totalCategorias: number;
  evolucao: Array<{
    mes: string;
    receitas: number;
    despesas: number;
    investimentos: number;
  }>;
}

export interface HistoricoMensal {
  mes: string;
  ano: number;
  realizado: number;
  planejado: number;
  projetado: number;
  restanteReal: number;
  restanteComProjecao: number;
  dataRef: string;
}

// Interfaces para os resultados brutos do Banco (SQL Raw)
export interface RawDadosBrutosCategoria {
  categoriaId: number;
  categoriaNome: string;
  categoriaIcone: string;
  categoriaCor: string;
  categoriaTipo: string;
  itemId: number;
  itemName: string;
  itemTipo: "RECEITA" | "DESPESA" | "META";
  valorRealizado: number;
  valorAgendado: number;
  valorPlanejado: number;
}

export interface RawTotaisMetas {
  valorTotalMeta: number;
  valorAlcancadoMeta: number;
}

export interface RawCardResumo {
  mes_referencia: Date;
  receitas_reais: number;
  despesas_reais: number;
  projecoes: number;
}

export interface RawMetasProgresso {
  id: number;
  nome: string;
  icone: string;
  cor: string;
  planejado: number;
  realizado: number;
}

export interface RawHistoricoAgrupado {
  mes: Date;
  ano: number;
  realizado: number;
  planejado: number;
  projetado: number;
  restanteReal: number;
  restanteComProjecao: number;
}
