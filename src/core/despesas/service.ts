import { NotFoundError } from "@/lib/errors";
import { despesaRepository as repositorio } from "./repository";
import { Despesa } from "./types";
import { CreateDespesaDTO, UpdateDespesaDTO } from "./despesa.dto";
import { lancamentoService } from "../lancamentos/service";

export const despesaService = {
  async listarTodos(filtros: Partial<Despesa>) {
    return await repositorio.listarTodos(filtros);
  },

  async listarPorUsuario(userId: number) {
    return await repositorio.listarPorUsuario(userId);
  },

  async buscarPorId(id: number) {
    const despesa = await repositorio.buscarPorId(id);
    if (!despesa) throw new NotFoundError("Despesa não encontrada");
    return despesa;
  },

  async criar(dados: CreateDespesaDTO & { userId: number }) {
    // Cria a despesa via repositório
    const novaDespesa = await repositorio.criar(dados);

    // Se for DÍVIDA e houver valor inicial (pagamento inicial), cria o lançamento vinculado
    if (novaDespesa.tipo === "DIVIDA" && dados.valorInicial && dados.valorInicial > 0) {
      await lancamentoService.criar({
        userId: novaDespesa.userId,
        tipo: "pagamento", // Dívida paga é um pagamento
        valor: dados.valorInicial,
        data: novaDespesa.dataInicio ? new Date(novaDespesa.dataInicio) : new Date(),
        observacao: `Pagamento inicial - ${novaDespesa.nome}`,
        observacaoAutomatica: `Pagamento inicial automático para a dívida: ${novaDespesa.nome}`,
        categoriaId: novaDespesa.categoriaId,
        despesaId: novaDespesa.id
      });
    }

    return novaDespesa;
  },

  async remover(id: number) {
    const despesa = await repositorio.buscarPorId(id);
    if (!despesa) throw new NotFoundError("Despesa não encontrada");

    return await repositorio.remover(id);
  },

  async atualizar(id: number, dados: UpdateDespesaDTO) {
    const hasDespesa = await repositorio.buscarPorId(id);
    if (!hasDespesa) throw new NotFoundError("Despesa não encontrada");

    return await repositorio.atualizar(id, dados);
  },
};
