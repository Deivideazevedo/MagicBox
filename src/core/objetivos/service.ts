import { NotFoundError } from "@/lib/errors";
import { objetivosRepository as repositorio } from "./repository";
import { CreateObjetivoDTO, UpdateObjetivoDTO } from "./objetivo.dto";
import { lancamentoService } from "../lancamentos/service";
import { Objetivo } from "./types";

export const objetivoService = {
  async listarPorUsuario(userId: number): Promise<Objetivo[]> {
    return await repositorio.listarPorUsuario(userId);
  },

  async buscarPorId(id: number): Promise<Objetivo> {
    const objetivo = await repositorio.buscarPorId(id);
    if (!objetivo) throw new NotFoundError("Objetivo não encontrado");
    return objetivo;
  },

  async criar(dados: CreateObjetivoDTO & { userId: number }): Promise<Objetivo> {
    // Cria o objetivo via repositório
    const novoObjetivo = await repositorio.criar(dados);

    // Se houver valor inicial (aporte inicial), cria o lançamento vinculado
    if (dados.valorInicial && dados.valorInicial > 0) {
      await lancamentoService.criar({
        userId: novoObjetivo.userId,
        tipo: "pagamento", // Aporte em objetivo é um pagamento
        valor: dados.valorInicial,
        data: new Date(),
        observacao: `Aporte inicial - ${novoObjetivo.nome}`,
        observacaoAutomatica: `Aporte inicial automático para o objetivo: ${novoObjetivo.nome}`,
        objetivoId: novoObjetivo.id
      });
    }

    return novoObjetivo;
  },

  async atualizar(id: number, dados: UpdateObjetivoDTO): Promise<Objetivo> {
    const hasObjetivo = await repositorio.buscarPorId(id);
    if (!hasObjetivo) throw new NotFoundError("Objetivo não encontrado");

    return await repositorio.atualizar(id, dados);
  },

  async remover(id: number): Promise<boolean> {
    const hasObjetivo = await repositorio.buscarPorId(id);
    if (!hasObjetivo) throw new NotFoundError("Objetivo não encontrado");

    return await repositorio.remover(id);
  },

  /**
   * Atualiza o valor acumulado do objetivo manualmente ou via gatilho
   */
  async atualizarValorAtual(id: number, novoValor: number): Promise<Objetivo> {
    return await repositorio.atualizar(id, { valorAtual: novoValor });
  },

  async obterResumo(userId: number) {
    return await repositorio.obterResumoObjetivos(userId);
  }
};
