import { Despesa, Lancamento } from "@prisma/client";

export type StatusDivida = "A" | "I"; // Ativo | Inativo (Concluída)
export type StatusSituacaoParcela = 'pago' | 'parcial' | 'pendente' | 'atrasada';

export interface SituacaoParcela {
  numero: number;
  label?: string;
  dataVencimento: string;
  valorAgendado: number;
  valorPago: number;
  status: StatusSituacaoParcela;
}

export interface DividaBase {
  id: string | number;
  nome: string;
  icone?: string | null;
  cor?: string | null;
  status: StatusDivida;
  tipo: "UNICA" | "VOLATIL";
  lancamentos?: Lancamento[];
  proximoVencimento?: string | null;
  diasParaVencer?: number | null;
  categoriaNome?: string;
  userId: number;
}

export interface DividaUnica extends DividaBase {
  tipo: "UNICA";
  valorTotal: number;
  totalParcelas: number;
  valorParcela: number;
  dataInicio: string | Date;
  diaVencimento: number;
  categoriaId: number;
  
  // Metadados calculados
  valorPago: number;
  valorRestante: number;
  parcelasPagas: number;
  parcelasRestantes: number;
  progresso: number; // 0-100
  concluida: boolean;
  situacaoParcelas?: SituacaoParcela[];
}

export interface DividaVolatil extends DividaBase {
  tipo: "VOLATIL";
  despesaId: number;
  
  // Metadados calculados
  valorTotalAgendado: number;
  valorPago: number;
  valorRestante: number;
  quantidadeParcelas: number;
  atrasada: boolean;
  situacaoParcelas?: SituacaoParcela[];
}

export type Divida = DividaUnica | DividaVolatil;

export interface ResumoDividas {
  totalDevidoUnicas: number;
  totalPagoUnicas: number;
  totalAgendadoVolateis: number;
  quantidadeTotalParcelas: number;
  dividasAtrasadas: number;
  proximosVencimentos: number; // Qtd de dívidas vencendo em breve
}

export interface ListagemDividasResponse {
  resumo: ResumoDividas;
  dividas: Divida[];
}
