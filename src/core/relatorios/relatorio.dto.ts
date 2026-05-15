import { z } from "zod";

export interface RelatorioFiltros {
  userId: number;
  dataInicio: string; // ISO String (yyyy-mm-dd)
  dataFim: string;    // ISO String (yyyy-mm-dd)
}

export interface DetalheRelatorio {
  id: number;
  nome: string;
  tipo: "RECEITA" | "DESPESA" | "META";
  valorPlanejado: number;
  valorRealizado: number;
  valorAgendado: number;
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
  referencia: string;
  ano: number;
  totalPago: number;
  realAgendado: number;
  totalProjetado: number;
  totalPrevisto: number;
  totalPrevistoComProjecao: number;
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
  origemTipo: string;
  mediaMensal: number;
  itemCreatedAt: Date;
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
  mediaMensal: number;
}

export interface RawRelatorioMetas {
  totais: RawTotaisMetas;
  detalhes: RawMetasProgresso[];
}

export interface RawHistoricoAgrupado {
  mes: Date;
  ano: number;
  totalPago: number;
  realAgendado: number;
  totalProjetado: number;
  totalPrevisto: number;
  totalPrevistoComProjecao: number;
  restanteReal: number;
  restanteComProjecao: number;
}

// ============================================
// SCHEMAS DE VALIDAÇÃO (ZOD)
// ============================================

export const historicoFiltroSchema = z.object({
  itens: z.string().transform((val) => {
    // Suporta o formato novo: TIPO-ID,TIPO-ID
    // Ou o formato antigo (fallback): JSON string
    try {
      if (val.startsWith("[") || val.startsWith("{")) {
        return JSON.parse(val);
      }
      return val.split(',').map(part => {
        const [tipo, id] = part.split('-');
        return { tipo, id: Number(id) };
      });
    } catch (e) {
      return val;
    }
  }).pipe(
    z.array(
      z.object({
        id: z.coerce.number().int().positive(),
        tipo: z.enum(["RECEITA", "DESPESA", "META"])
      })
    )
  ),
  ano: z.coerce.number().int().positive()
});

export type HistoricoFiltroDTO = z.infer<typeof historicoFiltroSchema>;
