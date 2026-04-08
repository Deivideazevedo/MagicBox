import { Categoria } from "../../categorias/types";
import { Despesa } from "../../despesas/types";
import { FonteRenda } from "../../fontesRenda/types";
import { ResumoFiltros } from "./resumo.dto";

export type TipoLancamento = "pagamento" | "agendamento";

export interface ResumoResposta {
  id: string;
  origemId: number;
  origem: "renda" | "despesa";
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
  fonteRendaId?: number | null;

  categoria?: Categoria;
  despesa?: Despesa;
  fonteRenda?: FonteRenda;
  statusDinamico?: string;
}

export interface ResumoMiniCardsProps {
  totalTransacoes: number;
  transacoesPagas: number;
  transacoesAgendadas: number;
  totalEntradas: number;
  entradasPagas: number;
  entradasAgendadas: number;
  totalSaidas: number;
  saidasPagas: number;
  saidasAgendadas: number;
  totalSaldo: number;
  saldoAtual: number;
  saldoProjetado: number;
}

export type ResumoParametros = ResumoFiltros;
