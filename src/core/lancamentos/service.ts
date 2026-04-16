// src/core/lancamentos/service.ts
import { LancamentoPayload } from "./types";
import { lancamentoRepository as repositorio } from "./repository";
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
  async listarTodos(filtros: FindAllFilters) {
    return await repositorio.listarTodos(filtros);
  },

  async buscarPorId(id: string | number) {
    return await repositorio.buscarPorId(id);
  },

  async listarPorUsuario(userId: string | number) {
    return await repositorio.listarPorUsuario(userId);
  },

  async criar(dados: LancamentoPayload) {
    if (!dados.userId) {
      throw new ValidationError("Usuário é obrigatório");
    }
    
    // Regra: Deve ter despesaId, receitaId OU metaId
    if (!dados.despesaId && !dados.receitaId && !dados.metaId) {
      throw new ValidationError("Lançamento deve estar vinculado a uma despesa, receita ou meta");
    }

    if (dados.despesaId && dados.receitaId) {
      throw new ValidationError("Lançamento não pode ter despesa e receita ao mesmo tempo");
    }

    if (Number(dados.valor) <= 0) {
      throw new ValidationError("Valor deve ser maior que zero");
    }

    // Validação: agendamento só pode ter despesaId
    if (dados.tipo === "agendamento" && !dados.despesaId) {
      throw new ValidationError("Agendamentos devem estar vinculados a uma despesa");
    }

    const parcelas = dados.parcelas && dados.parcelas > 1 ? Number(dados.parcelas) : 1;
    const valorNumerico = Number(dados.valor);
    const dataBase = typeof dados.data === "string" ? new Date(dados.data) : dados.data;

    // Se não houver parcelas, cria apenas um registro
    if (parcelas === 1) {
      const data = {
        userId: Number(dados.userId),
        tipo: dados.tipo,
        valor: valorNumerico,
        data: dataBase,
        observacao: dados.observacao || undefined,
        observacaoAutomatica: undefined,
        despesaId: dados.despesaId || null,
        receitaId: dados.receitaId || null,
        metaId: dados.metaId || null,
      };

      return await repositorio.criar(data);
    }

    // Se houver parcelas, cria múltiplos registros
    const lancamentosCriados = [];
    for (let i = 0; i < parcelas; i++) {
      const dataParcela = addMonths(dataBase as Date, i);
      const observacaoAutomatica = gerarObservacaoAutomatica(
        dados.observacao,
        i + 1,
        parcelas,
        valorNumerico,
        dataParcela
      );

      const data = {
        userId: Number(dados.userId),
        tipo: dados.tipo,
        valor: valorNumerico,
        data: dataParcela,
        observacao: dados.observacao || undefined,
        observacaoAutomatica,
        despesaId: dados.despesaId || null,
        receitaId: dados.receitaId || null,
        metaId: dados.metaId || null,
      };

      const lancamento = await repositorio.criar(data);
      lancamentosCriados.push(lancamento);
    }

    return lancamentosCriados;
  },

  async atualizar(id: string | number, dados: LancamentoPayload) {
    const lancamento = await repositorio.buscarPorId(id);
    if (!lancamento) {
      throw new NotFoundError("Lançamento não encontrado");
    }

    if (dados.valor && Number(dados.valor) <= 0) {
      throw new ValidationError("Valor deve ser maior que zero");
    }

    if (dados.despesaId && dados.receitaId) {
      throw new ValidationError("Lançamento não pode ter despesa e receita ao mesmo tempo");
    }

    return await repositorio.atualizar(id, dados);
  },

  async remover(id: string | number) {
    const lancamento = await repositorio.buscarPorId(id);
    if (!lancamento) {
      throw new NotFoundError("Lançamento não encontrado");
    }
    return await repositorio.remover(id);
  },

  async removerEmMassa(ids: Array<string | number>, userId: string | number) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError("IDs são obrigatórios");
    }

    const idsNumericos = ids
      .map((valor) => Number(valor))
      .filter((valor) => Number.isFinite(valor));

    if (idsNumericos.length === 0) {
      throw new ValidationError("IDs inválidos para exclusão");
    }

    return await repositorio.removerEmMassa(idsNumericos, Number(userId));
  },
};
