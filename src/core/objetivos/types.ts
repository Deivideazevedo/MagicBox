import { LancamentoResposta } from "../lancamentos/types";

export interface Objetivo {
  id: number;
  userId: number;
  nome: string;
  tipo: "META" | "RESERVA";
  valorObjetivo: number | null;
  dataAlvo: string | Date | null;
  status: string;
  icone: string | null;
  cor: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;

  // Campos calculados (opcionais)
  valorAcumulado?: number;
  progresso?: number | null;
  concluida?: boolean;
  lancamentos?: LancamentoResposta[];
}

export interface ObjetivoPayload {
  id?: number;
  nome?: string;
  tipo?: "META" | "RESERVA";
  valorObjetivo?: number | null;
  dataAlvo?: string | Date | null;
  status?: string;
  icone?: string | null;
  cor?: string | null;
  userId?: number | null;
}
