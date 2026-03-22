// src/core/lancamentos/service.ts
import { ExtratoFiltros, ExtratoResumoFiltros } from "./extrato.dto";
import { extratoRepository as repositorio } from "./repository";

/**
 * Gera a observação automática para lançamentos parcelados
 * Formato: "descrição informada (nº da parcela / nº total de parcela) - R$ valor (dia/mês)"
 */

const extratoService = {
  async listarTodos(filtros: ExtratoFiltros) {
    // Sempre usa listarTodos com paginação
    return await repositorio.listarTodos(filtros);
  },
  async obterResumo(filtros: ExtratoResumoFiltros) {
    // Sempre usa listarTodos com paginação
    return await repositorio.obterResumo(filtros);
  },
};

export { extratoService };
