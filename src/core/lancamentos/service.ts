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
function gerarObservacaoAutomatica(parcelaAtual: number, totalParcelas: number): string {
  const p = String(parcelaAtual).padStart(2, '0');
  const t = String(totalParcelas).padStart(2, '0');

  return `Parcela ${p}/${t}`;
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

    if (Number(dados.valor) === 0) {
      throw new ValidationError("Valor não pode ser zero");
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
        vinculoId: dados.vinculoId || null,
      };

      return await repositorio.criar(data);
    }

    // Se houver parcelas, cria múltiplos registros
    const lancamentosCriados = [];
    for (let i = 0; i < parcelas; i++) {
      const dataParcela = addMonths(dataBase as Date, i);
      const observacaoAutomatica = gerarObservacaoAutomatica(i + 1, parcelas);

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
        vinculoId: dados.vinculoId || null,
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

    if (dados.valor !== undefined && Number(dados.valor) === 0) {
      throw new ValidationError("Valor não pode ser zero");
    }

    if (dados.despesaId && dados.receitaId) {
      throw new ValidationError("Lançamento não pode ter despesa e receita ao mesmo tempo");
    }

    const lancamentoAtualizado = await repositorio.atualizar(id, dados);

    // Lógica de Sincronização por vinculoId
    if (lancamentoAtualizado.vinculoId) {
      const vinculados = await repositorio.buscarPorVinculo(lancamentoAtualizado.vinculoId, Number(id));

      for (const vinculado of vinculados) {
        // Sincronização robusta utilizando o resultado da atualização anterior
        const payloadSinc: Partial<LancamentoPayload> = {
          data: lancamentoAtualizado.data,
          valor: Number(lancamentoAtualizado.valor) * -1,
        };

        await repositorio.atualizar(vinculado.id, payloadSinc);
      }
    }

    return lancamentoAtualizado;
  },

  async remover(id: string | number) {
    const lancamento = await repositorio.buscarPorId(id);
    if (!lancamento) {
      throw new NotFoundError("Lançamento não encontrado");
    }

    // Se tiver vínculo, remove o par primeiro
    if (lancamento.vinculoId) {
      const vinculados = await repositorio.buscarPorVinculo(lancamento.vinculoId, Number(id));
      for (const vinculado of vinculados) {
        await repositorio.remover(vinculado.id);
      }
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
