// src/core/lancamentos/service.ts
import { Lancamento, LancamentoPayload } from "./types";
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
    // Sempre usa listarTodos com paginação
    return await repositorio.listarTodos(filtros);
  },

  async buscarPorId(id: string | number) {
    return await repositorio.buscarPorId(id);
  },

  async listarPorUsuario(userId: string | number) {
    return await repositorio.listarPorUsuario(userId);
  },

  async criar(dados: LancamentoPayload) {
    // Validações de negócio
    if (!dados.userId) {
      throw new ValidationError("Usuário é obrigatório");
    }
    
    // Regra: Deve ter despesaId OU fonteRendaId (XOR)
    if (!dados.despesaId && !dados.fonteRendaId) {
      throw new ValidationError("Lançamento deve estar vinculado a uma despesa ou fonte de renda");
    }

    if (dados.despesaId && dados.fonteRendaId) {
      throw new ValidationError("Lançamento não pode ter despesa e fonte de renda ao mesmo tempo");
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
        observacao: dados.observacao || null,
        observacaoAutomatica: null,
        categoriaId: dados.categoriaId,
        despesaId: dados.despesaId || null,
        fonteRendaId: dados.fonteRendaId || null,
      };

      return await repositorio.criar(data);
    }

    // Se houver parcelas, cria múltiplos registros
    const lancamentosCriados = [];
    for (let i = 0; i < parcelas; i++) {
      const dataParcela = addMonths(dataBase, i);
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
        observacao: dados.observacao || null,
        observacaoAutomatica,
        categoriaId: dados.categoriaId,
        despesaId: dados.despesaId || null,
        fonteRendaId: dados.fonteRendaId || null,
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

    // Validar XOR despesa/fonte de renda
    if (dados.despesaId && dados.fonteRendaId) {
      throw new ValidationError("Lançamento não pode ter despesa e fonte de renda ao mesmo tempo");
    }

    return await repositorio.atualizar(id, dados);
  },

  async remover(id: string | number) {
    const lancamento = await repositorio.buscarPorId(id);
    if (!lancamento) {
      throw new NotFoundError("Lançamento não encontrado");
    }
    // Agora deleta permanentemente (sem soft delete)
    return await repositorio.remover(id);
  }
};
