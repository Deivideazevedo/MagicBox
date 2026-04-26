import { NotFoundError } from "@/lib/errors";
import { dividasRepository as repositorio } from "./repository";
import { CreateDividaDTO, UpdateDividaDTO, ProcessAporteDTO } from "./divida.dto";
import { lancamentoService, gerarObservacaoAutomatica } from "../lancamentos/service";
import { ListagemDividasResponse, StatusDivida } from "./types";

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
    const diaDesejado = dataInicio.getUTCDate();

    for (let i = 0; i < dados.totalParcelas; i++) {
      // Criamos a data base em UTC para manipulação segura
      const dataParcela = new Date(Date.UTC(
        dataInicio.getUTCFullYear(),
        dataInicio.getUTCMonth() + i,
        1
      ));

      // Regra de Vencimento: manter dia da dataInicio ou último dia do mês
      const ultimoDiaMes = new Date(Date.UTC(dataParcela.getUTCFullYear(), dataParcela.getUTCMonth() + 1, 0)).getUTCDate();
      dataParcela.setUTCDate(Math.min(diaDesejado, ultimoDiaMes));

      await lancamentoService.criar({
        userId,
        despesaId: novaDivida.id,
        tipo: "agendamento",
        valor: valorParcela,
        data: dataParcela,
        observacao: novaDivida.nome, 
        observacaoAutomatica: gerarObservacaoAutomatica(
          i + 1, 
          dados.totalParcelas, 
          novaDivida.nome, 
          Number(valorParcela)
        ),
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
    const dataAporte = dados.data || new Date();

    // Pegamos a situação atual das parcelas para saber por onde começar
    const parcelas = divida.situacaoParcelas || [];

    for (const parcela of parcelas) {
      if (valorRestante <= 0.001) break;
      if (parcela.status === 'pago') continue;

      const valorNecessarioParaQuitar = parcela.valorAgendado - parcela.valorPago;
      const valorAAplicar = Math.min(valorRestante, valorNecessarioParaQuitar);

      // Encontramos o agendamento correspondente para atualizar ou criar pagamento vinculado
      const agendamento = await repositorio.buscarAgendamentoPorData(dividaId, new Date(parcela.dataVencimento));

      if (!agendamento) continue;

      if (valorAAplicar >= valorNecessarioParaQuitar - 0.01) {
        // Liquida a parcela do mês
        // Se já houver pagamentos parciais, transformamos este agendamento no "pagamento final" do mês
        // ou apenas marcamos como pago se o valor bater
        await repositorio.liquidarAgendamento(agendamento.id, new Date(parcela.dataVencimento), `Liquidação de parcela - ${divida.nome}`);
      } else {
        // Pagamento ainda parcial
        await lancamentoService.criar({
          userId,
          despesaId: dividaId,
          tipo: "pagamento",
          valor: valorAAplicar,
          data: dataAporte,
          observacao: `Aporte parcial - ${divida.nome}`,
        });
        // Não removemos o agendamento, pois a parcela ainda não está "paga" integralmente
      }

      valorRestante -= valorAAplicar;
    }

    // Verificar se a dívida foi totalmente paga para inativar (concluir)
    const dividaAtualizada = await repositorio.buscarPorId(dividaId);
    if (dividaAtualizada && dividaAtualizada.concluida) {
      await repositorio.atualizar(dividaId, { status: "I" });
    }

    return dividaAtualizada;
  }
};
