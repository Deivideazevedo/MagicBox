import { Categoria } from "../../categorias/types";
import { Despesa } from "../../despesas/types";
import { FonteRenda } from "../../fontesRenda/types";
import { ExtratoFiltros } from "./extrato.dto";

export type TipoLancamento = "pagamento" | "agendamento";

export interface ExtratoResposta {
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

export interface MiniCardsResumoProps {
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

export type ExtratoParametros = ExtratoFiltros;
