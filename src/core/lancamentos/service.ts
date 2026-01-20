// src/core/lancamentos/service.ts
import { Lancamento, LancamentoPayload } from "./types";
import { lancamentoRepository as repository } from "./repository";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FindAllFilters } from "./lancamento.dto";

/**
 * Gera a observação automática para lançamentos parcelados
 * Formato: "descrição informada (nº da parcela / nº total de parcela) - R$ valor (dia/mês)"
 */
function gerarObservacaoAutomatica(
  observacao: string | undefined,
  parcelaAtual: number,
  totalParcelas: number,
  valor: number,
  data: Date
): string {
  const observacaoBase = observacao || "Lançamento";
  const valorFormatado = valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const dataFormatada = format(data, "dd/MM", { locale: ptBR });
  
  return `${observacaoBase} (${parcelaAtual}/${totalParcelas}) - ${valorFormatado} (${dataFormatada})`;
}

export const lancamentoService = {
  async findAll(filters: FindAllFilters) {
    // Sempre usa findAll com paginação
    return await repository.findAll(filters);
  },

  async findById(id: string | number) {
    return await repository.findById(id);
  },

  async findByUser(userId: string | number) {
    return await repository.findByUser(userId);
  },

  async create(payload: LancamentoPayload) {
    // Validações de negócio
    if (!payload.userId) {
      throw new ValidationError("Usuário é obrigatório");
    }
    
    // Regra: Deve ter despesaId OU fonteRendaId (XOR)
    if (!payload.despesaId && !payload.fonteRendaId) {
      throw new ValidationError("Lançamento deve estar vinculado a uma despesa ou fonte de renda");
    }

    if (payload.despesaId && payload.fonteRendaId) {
      throw new ValidationError("Lançamento não pode ter despesa e fonte de renda ao mesmo tempo");
    }

    if (Number(payload.valor) <= 0) {
      throw new ValidationError("Valor deve ser maior que zero");
    }

    // Validação: agendamento só pode ter despesaId
    if (payload.tipo === "agendamento" && !payload.despesaId) {
      throw new ValidationError("Agendamentos devem estar vinculados a uma despesa");
    }

    const parcelas = payload.parcelas && payload.parcelas > 1 ? Number(payload.parcelas) : 1;
    const valorNumerico = Number(payload.valor);
    const dataBase = typeof payload.data === "string" ? new Date(payload.data) : payload.data;

    // Se não houver parcelas, cria apenas um registro
    if (parcelas === 1) {
      const data = {
        userId: Number(payload.userId),
        tipo: payload.tipo,
        valor: valorNumerico,
        data: dataBase,
        observacao: payload.observacao || null,
        observacaoAutomatica: null,
        categoriaId: payload.categoriaId,
        despesaId: payload.despesaId || null,
        fonteRendaId: payload.fonteRendaId || null,
      };

      return await repository.create(data);
    }

    // Se houver parcelas, cria múltiplos registros
    const lancamentosCriados = [];
    for (let i = 0; i < parcelas; i++) {
      const dataParcela = addMonths(dataBase, i);
      const observacaoAutomatica = gerarObservacaoAutomatica(
        payload.observacao,
        i + 1,
        parcelas,
        valorNumerico,
        dataParcela
      );

      const data = {
        userId: Number(payload.userId),
        tipo: payload.tipo,
        valor: valorNumerico,
        data: dataParcela,
        observacao: payload.observacao || null,
        observacaoAutomatica,
        categoriaId: payload.categoriaId,
        despesaId: payload.despesaId || null,
        fonteRendaId: payload.fonteRendaId || null,
      };

      const lancamento = await repository.create(data);
      lancamentosCriados.push(lancamento);
    }

    return lancamentosCriados;
  },

  async update(id: string | number, payload: LancamentoPayload) {
    const lancamento = await repository.findById(id);
    if (!lancamento) {
      throw new NotFoundError("Lançamento não encontrado");
    }

    if (payload.valor && Number(payload.valor) <= 0) {
      throw new ValidationError("Valor deve ser maior que zero");
    }

    // Validar XOR despesa/fonte de renda
    if (payload.despesaId && payload.fonteRendaId) {
      throw new ValidationError("Lançamento não pode ter despesa e fonte de renda ao mesmo tempo");
    }

    return await repository.update(id, payload);
  },

  async remove(id: string | number) {
    const lancamento = await repository.findById(id);
    if (!lancamento) {
      throw new NotFoundError("Lançamento não encontrado");
    }
    // Agora deleta permanentemente (sem soft delete)
    return await repository.remove(id);
  }
};
