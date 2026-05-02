// src/core/lancamentos/service.ts
import {
  ResumoFiltros,
  ResumoTodosFiltros,
  ResumoCardFiltros,
} from "./resumo.dto";
import { resumoRepository as repositorio } from "./repository";

/**
 * Serviço de resumo focado em listagens e totais para a UI (Dashboard/Extrato).
 * Métodos de diagnóstico para o Chat foram migrados para chat/diagnosis.service.ts
 */
const resumoServico = {
  async listarTodos(filtros: ResumoTodosFiltros) {
    // Sempre usa listarTodos com paginação
    return await repositorio.listarTodos(filtros);
  },
  async obterCardResumo(filtros: ResumoCardFiltros) {
    // Sempre usa listarTodos com paginação
    return await repositorio.obterCardResumo(filtros);
  },
  async obterResumo(filtros: ResumoFiltros) {
    // Sempre usa listarTodos com paginação
    return await repositorio.obterResumo(filtros);
  },
};

export { resumoServico };
