// Interfaces para as entidades do sistema financeiro

export interface Despesa {
  id: string;
  nome: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conta {
  id: string;
  despesaId: string;
  nome: string;
  valorEstimado?: number;
  diaVencimento?: number; // 1-31
  status: boolean; // true = ativo, false = inativo
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lancamento {
  id: string;
  despesaId: string;
  contaId: string;
  tipo: 'pagamento' | 'agendamento';
  valor: number;
  data: string; // Data do pagamento ou início do agendamento
  descricao?: string;
  parcelas?: number; // Número de meses para agendamento
  valorPago?: number; // Valor efetivamente pago (pode ser diferente do valor)
  status: 'pendente' | 'pago' | 'atrasado';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs para criação
export interface CreateDespesaDto {
  nome: string;
}

export interface CreateContaDto {
  despesaId: string;
  nome: string;
  valorEstimado?: number;
  diaVencimento?: number;
  status: boolean;
}

export interface CreateLancamentoDto {
  despesaId: string;
  contaId: string;
  tipo: 'pagamento' | 'agendamento';
  valor: number;
  data: string;
  descricao?: string;
  parcelas?: number;
}

// DTOs para atualização
export interface UpdateContaDto extends Partial<CreateContaDto> {
  id: string;
}

export interface UpdateLancamentoDto extends Partial<CreateLancamentoDto> {
  id: string;
  valorPago?: number;
  status?: 'pendente' | 'pago' | 'atrasado';
}

// Interface para filtros de extrato
export interface FiltroExtrato {
  dataInicio?: string;
  dataFim?: string;
  despesaId?: string;
  contaId?: string;
  status?: 'pendente' | 'pago' | 'atrasado' | 'todos';
}

// Interface para relatórios
export interface RelatorioKPI {
  gastoTotal: number;
  deficitTotal: number;
  mediaGastoMensal: number;
}

export interface DadosGrafico {
  labels: string[];
  valores: number[];
}