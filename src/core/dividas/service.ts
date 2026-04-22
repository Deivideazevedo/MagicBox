import { NotFoundError } from "@/lib/errors";
import { dividasRepository as repositorio } from "./repository";
import { CreateDividaDTO, UpdateDividaDTO, ProcessAporteDTO } from "./divida.dto";
import { lancamentoService } from "../lancamentos/service";
import { ListagemDividasResponse, StatusDivida } from "./types";
import { prisma } from "@/lib/prisma";

export const dividasService = {
  async listarPorUsuario(userId: number): Promise<ListagemDividasResponse> {
    const unicas = await repositorio.listarUnicas(userId);
    const volateis = await repositorio.listarVolateis(userId);

    const dividas = [...unicas, ...volateis];

    const resumo = {
      totalDevidoUnicas: unicas.reduce((acc, d) => acc + d.valorRestante, 0),
      totalPagoUnicas: unicas.reduce((acc, d) => acc + d.valorPago, 0),
      totalAgendadoVolateis: volateis.reduce((acc, d) => acc + d.valorTotalAgendado, 0),
      quantidadeTotalParcelas: dividas.reduce((acc, d) =>
        acc + (d.tipo === "UNICA" ? d.parcelasRestantes : d.quantidadeParcelas), 0),
      dividasAtrasadas: dividas.filter(d =>
        (d.tipo === "UNICA" && d.diasParaVencer != null && d.diasParaVencer < 0) ||
        (d.tipo === "VOLATIL" && d.atrasada)
      ).length,
      proximosVencimentos: dividas.filter(d =>
        d.diasParaVencer != null && d.diasParaVencer >= 0 && d.diasParaVencer <= 7
      ).length,
    };

    return { resumo, dividas };
  },

  async buscarPorId(id: string | number, userId: number) {
    if (typeof id === 'string' && id.startsWith('vol-')) {
      const despesaId = Number(id.replace('vol-', ''));
      const divida = await repositorio.buscarVolatilPorDespesaId(despesaId, userId);
      if (!divida) throw new NotFoundError("Dívida volátil não encontrada");
      return divida;
    }

    const divida = await repositorio.buscarPorId(Number(id));
    if (!divida) throw new NotFoundError("Dívida não encontrada");
    return divida;
  },

  async criar(dados: CreateDividaDTO & { userId: number }) {
    const userId = dados.userId!;

    // 1. Criar a Despesa do tipo DIVIDA
    const novaDivida = await repositorio.criar(dados);

    // 2. Gerar agendamentos automáticos
    const valorParcela = Number(dados.valorTotal) / dados.totalParcelas;
    const dataInicio = new Date(dados.dataInicio);

    for (let i = 0; i < dados.totalParcelas; i++) {
      const dataParcela = new Date(dataInicio);
      dataParcela.setMonth(dataInicio.getMonth() + i);

      // Regra de Vencimento: manter dia da dataInicio ou último dia do mês
      const diaDesejado = dataInicio.getDate();
      const ultimoDiaMes = new Date(dataParcela.getFullYear(), dataParcela.getMonth() + 1, 0).getDate();
      dataParcela.setDate(Math.min(diaDesejado, ultimoDiaMes));

      await lancamentoService.criar({
        userId,
        despesaId: novaDivida.id,
        tipo: "agendamento",
        valor: valorParcela,
        data: dataParcela,
        observacao: novaDivida.nome, 
        observacaoAutomatica: `Parcela ${String(i + 1).padStart(2, '0')}/${String(dados.totalParcelas).padStart(2, '0')}`
      });
    }

    return novaDivida;
  },

  async atualizar(id: string | number, dados: UpdateDividaDTO) {
    const hasDivida = await repositorio.buscarPorId(Number(id));
    if (!hasDivida) throw new NotFoundError("Dívida não encontrada");

    return await repositorio.atualizar(Number(id), dados);
  },

  async remover(id: string | number) {
    const hasDivida = await repositorio.buscarPorId(Number(id));
    if (!hasDivida) throw new NotFoundError("Dívida não encontrada");

    return await repositorio.remover(Number(id));
  },

  async processarAporte(id: string | number, dados: ProcessAporteDTO, userId: number) {
    const dividaId = Number(id);
    const divida = await repositorio.buscarPorId(dividaId);
    if (!divida || divida.userId !== userId) throw new NotFoundError("Dívida não encontrada");

    let valorRestante = dados.valor;
    const dataAporte = dados.data;

    while (valorRestante > 0.001) { // Evitar problemas de precisão
      const proximoAgendamento = await prisma.lancamento.findFirst({
        where: {
          despesaId: dividaId,
          tipo: "agendamento"
        },
        orderBy: { data: "asc" }
      });

      if (!proximoAgendamento) break;

      const valorParcela = Number(proximoAgendamento.valor);

      if (valorRestante >= valorParcela - 0.001) {
        // Liquida a parcela inteira
        await prisma.lancamento.update({
          where: { id: proximoAgendamento.id },
          data: {
            tipo: "pagamento",
            data: dataAporte,
            observacao: proximoAgendamento.observacao + " (Pago)"
          }
        });
        valorRestante -= valorParcela;
      } else {
        // Pagamento parcial
        await prisma.lancamento.create({
          data: {
            userId: proximoAgendamento.userId,
            despesaId: dividaId,
            tipo: "pagamento",
            valor: valorRestante,
            data: dataAporte,
            observacao: `Aporte parcial - ${proximoAgendamento.observacao}`,
          }
        });

        await prisma.lancamento.update({
          where: { id: proximoAgendamento.id },
          data: { valor: valorParcela - valorRestante }
        });

        valorRestante = 0;
      }
    }

    // Verificar se a dívida foi totalmente paga para inativar (concluir)
    const dividaAtualizada = await repositorio.buscarPorId(dividaId);
    if (dividaAtualizada && dividaAtualizada.concluida) {
      await repositorio.atualizar(dividaId, { status: "I" });
    }

    return dividaAtualizada;
  }
};
