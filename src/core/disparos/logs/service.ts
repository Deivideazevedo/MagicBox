import { disparosLogsRepository } from "./repository";

export const disparosLogsService = {
  async listarLogsPaginado(limit = 10, page = 0) {
    return await disparosLogsRepository.listarPaginado(limit, page);
  },

  async obterDestinatariosLote(disparoId: number) {
    return await disparosLogsRepository.obterDestinatarios(disparoId);
  },
};
