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
  saldoLivreGeral: number;
  saldoBrutoLiquido: number;
  taxaEconomiaPeriodo: number;
  totalAcumuladoMetas?: number;
  totalPlanejadoMetas?: number;
  totalAcumuladoMetasComAlvo?: number;
  totalAcumuladoMetasSemAlvo?: number;
  qtdMetasAtivas?: number;
  qtdMetasTotal?: number;
  qtdMetasConcluidas?: number;
  qtdMetasEmAndamento?: number;
  qtdReceitasAtivas?: number;
  qtdReceitasInativas?: number;
  qtdReceitasTotal?: number;
  qtdDespesasAtivas?: number;
  qtdDespesasInativas?: number;
  qtdDespesasTotal?: number;
}

export interface RelatorioResponse {
  periodo: {
    dataInicio: string;
    dataFim: string;
  };
  resumo: ResumoRelatorio;
  categorias: CategoriaRelatorio[];
  totalCategorias: number;
}

export interface EvolucaoMensalItem {
  mes: string;
  dataReferencia: string;
  receitas: number;
  despesas: number;
  metas: number;
  receitasPrevistas: number;
  despesasPrevistas: number;
}

export type EvolucaoAnualResponse = EvolucaoMensalItem[];

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
  status?: string;
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

export const evolucaoFiltroSchema = z.object({
  ano: z.coerce.number().int().positive()
});

export type HistoricoFiltroDTO = z.infer<typeof historicoFiltroSchema>;
