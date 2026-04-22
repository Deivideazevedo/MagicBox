import { Despesa, Lancamento } from "@prisma/client";

export type StatusDivida = "A" | "I"; // Ativo | Inativo (Concluída)

export interface DividaBase {
  id: string | number;
  nome: string;
  icone?: string | null;
  cor?: string | null;
  status: StatusDivida;
  tipo: "UNICA" | "VOLATIL";
  lancamentos?: any[];
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
}

export interface DividaVolatil extends DividaBase {
  tipo: "VOLATIL";
  despesaId: number;
  
  // Metadados calculados do agrupamento de agendamentos
  valorTotalAgendado: number;
  quantidadeParcelas: number;
  atrasada: boolean;
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
