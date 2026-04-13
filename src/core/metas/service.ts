import { NotFoundError } from "@/lib/errors";
import { metasRepository as repositorio } from "./repository";
import { CreateMetaDTO, UpdateMetaDTO } from "./meta.dto";
import { lancamentoService } from "../lancamentos/service";
import { Meta } from "./types";

export const metaService = {
  async listarPorUsuario(userId: number): Promise<Meta[]> {
    return await repositorio.listarPorUsuario(userId);
  },

  async buscarPorId(id: number): Promise<Meta> {
    const meta = await repositorio.buscarPorId(id);
    if (!meta) throw new NotFoundError("Meta não encontrada");
    return meta;
  },

  async criar(dados: CreateMetaDTO & { userId: number }): Promise<Meta> {
    // Cria a meta via repositório
    const novaMeta = await repositorio.criar(dados);

    // Se houver valor inicial (aporte inicial), cria o lançamento vinculado
    if (dados.valorInicial && dados.valorInicial > 0) {
      await lancamentoService.criar({
        userId: novaMeta.userId,
        tipo: "pagamento", // Aporte em meta é um pagamento
        valor: dados.valorInicial,
        data: new Date(),
        observacao: `Aporte inicial - ${novaMeta.nome}`,
        observacaoAutomatica: `Aporte inicial automático para a meta: ${novaMeta.nome}`,
        categoriaId: dados.categoriaId ?? 1, // Fallback fixo para 'Outros' se não informado
        metaId: novaMeta.id
      });
    }

    return novaMeta;
  },

  async atualizar(id: number, dados: UpdateMetaDTO): Promise<Meta> {
    const hasMeta = await repositorio.buscarPorId(id);
    if (!hasMeta) throw new NotFoundError("Meta não encontrada");

    return await repositorio.atualizar(id, dados);
  },

  async remover(id: number): Promise<boolean> {
    const hasMeta = await repositorio.buscarPorId(id);
    if (!hasMeta) throw new NotFoundError("Meta não encontrada");

    return await repositorio.remover(id);
  },

  /**
   * Atualiza o valor acumulado da meta manualmente ou via gatilho
   */
  async atualizarValorAtual(id: number, novoValor: number): Promise<Meta> {
    return await repositorio.atualizar(id, { valorAtual: novoValor });
  }
};
