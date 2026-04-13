import { Categoria } from "../../categorias/types";
import { Despesa } from "../../despesas/types";
import { Receita } from "../../receitas/types";
import { ResumoFiltros } from "./resumo.dto";

export type TipoLancamento = "pagamento" | "agendamento";

export interface ResumoResposta {
  id: string;
  origemId: number;
  origem: "receita" | "despesa";
  nome: string;
  valorPrevisto: number;
  valorPago: number;
  diaVencido: number | null;
  mes: number;
  ano: number;
  status: string;
  atrasado: boolean;
  icone: string | null;
  cor: string | null;
  detalhes: DetalheResumo[];
}

type DetalheResumo = {
  id: number;
  tipo: TipoLancamento;
  data: string;
  valor: number;
  observacao?: string;
}

export interface ResumoTodosResposta {
  id: number;
  userId: number;
  tipo: TipoLancamento;
  data: string;
  observacao?: string;
  observacaoAutomatica?: string;
  valor: number;
  createdAt: string;
  updatedAt: string;
  categoriaId: number;
  despesaId?: number | null;
  receitaId?: number | null;
  categoria?: Categoria;
  despesa?: Despesa;
  receita?: Receita;
  statusDinamico?: string;
}

export interface ResumoMiniCardsProps {
  totalTransacoes: number;
  transacoesPagas: number;
  transacoesAgendadas: number;
  totalEntradas: number;
  entradasPagas: number;
  entradasAgendadas: number;
  diferencaEntradas: number;
  totalSaidas: number;
  saidasPagas: number;
  saidasAgendadas: number;
  diferencaSaidas: number;
  totalSaldo: number;
  saldoAtual: number;
  saldoProjetado: number;
  saldoBloqueado: number; // Valor reservado em metas ativas
  saldoLivre: number;     // Saldo Atual - Saldo Bloqueado
}

export type ResumoParametros = ResumoFiltros;
