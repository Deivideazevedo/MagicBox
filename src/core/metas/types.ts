import { LancamentoResposta } from "../lancamentos/types";

export interface Meta {
  id: number;
  userId: number;
  nome: string;
  valorMeta: number | null;
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

export interface MetaPayload {
  id?: number;
  nome?: string;
  valorMeta?: number | null;
  dataAlvo?: string | Date | null;
  status?: string;
  icone?: string | null;
  cor?: string | null;
  userId?: number | null;
}
