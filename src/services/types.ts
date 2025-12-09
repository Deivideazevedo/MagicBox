
export interface Despesa {
  id: string;
  categoriaId: string;
  nome: string;
  valorEstimado?: number;
  diaVencimento?: number; // 1-31
  status: boolean; // true = ativo, false = inativo
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FonteRenda {
  id: string;
  nome: string;
  valorEstimado?: number;
  diaRecebimento?: number; // 1-31
  status: boolean; // true = ativo, false = inativo
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lancamento {
  id: string;
  categoriaId?: string;
  despesaId?: string;
  receitaId?: string;
  fonteRendaId?: string;
  tipo: 'pagamento' | 'agendamento' | 'receita';
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

export interface DespesaDto {
  categoriaId: string;
  nome: string;
  valorEstimado?: number | string;
  diaVencimento?: number | string;
  status: boolean;
}

export interface CreateFonteRendaDto {
  nome: string;
  valorEstimado?: number;
  diaRecebimento?: number;
  status: boolean;
}

export interface CreateLancamentoDto {
  categoriaId?: string;
  despesaId?: string;
  receitaId?: string;
  fonteRendaId?: string;
  tipo: 'pagamento' | 'agendamento' | 'receita';
  valor: number;
  data: string;
  descricao?: string;
  parcelas?: number;
}

// Filtro usado para consultas de extrato
export interface FiltroExtrato {
  categoriaId?: string;
  despesaId?: string;
  receitaId?: string;
  fonteRendaId?: string;
  status?: 'pendente' | 'pago' | 'atrasado';
  dataInicio?: string; // ISO date
  dataFim?: string; // ISO date
}

export interface UpdateReceitaDto {
  id: string;
  nome: string;
}

export interface UpdateDespesaDto {
  id: string;
  // Campos opcionais para permitir atualizações parciais
  data: Partial<DespesaDto>;
}

export interface UpdateFonteRendaDto {
  id: string;
  receitaId: string;
  nome: string;
  valorEstimado?: number;
  diaRecebimento?: number;
  status: boolean;
}

export interface UpdateLancamentoDto {
  id: string;
  categoriaId?: string;
  despesaId?: string;
  receitaId?: string;
  fonteRendaId?: string;
  // Campos opcionais para permitir atualizações parciais
  tipo?: 'pagamento' | 'agendamento' | 'receita';
  valor?: number;
  data?: string;
  descricao?: string;
  parcelas?: number;
  valorPago?: number;
  status?: 'pendente' | 'pago' | 'atrasado';
}
