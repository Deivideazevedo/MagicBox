import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";
import { Prisma } from "@prisma/client";
import { gerarObservacaoAutomatica } from "../lancamentos/service";
import {
  CreateDividaDTO,
  ProcessAporteDTO,
  UpdateDividaDTO,
} from "./divida.dto";
import { dividasRepository as repositorio } from "./repository";
import { ListagemDividasResponse } from "./types";

export const dividasService = {
  async listarPorUsuario(userId: number): Promise<ListagemDividasResponse> {
    const unicas = await repositorio.listarUnicas(userId);
    const volateis = await repositorio.listarVolateis(userId);

    const dividas = [...unicas, ...volateis];

    const resumo = {
      totalDevidoUnicas: unicas.reduce((acc, d) => acc + d.valorRestante, 0),
      totalPagoUnicas: unicas.reduce((acc, d) => acc + d.valorPago, 0),
      totalAgendadoVolateis: volateis.reduce(
        (acc, d) => acc + d.valorTotalAgendado,
        0,
      ),
      quantidadeTotalParcelas: dividas.reduce(
        (acc, d) =>
          acc +
          (d.tipo === "UNICA" ? d.parcelasRestantes : d.quantidadeParcelas),
        0,
      ),
      dividasAtrasadas: dividas.filter(
        (d) =>
          (d.tipo === "UNICA" &&
            d.diasParaVencer != null &&
            d.diasParaVencer < 0) ||
          (d.tipo === "VOLATIL" && d.atrasada),
      ).length,
      proximosVencimentos: dividas.filter(
        (d) =>
          d.diasParaVencer != null &&
          d.diasParaVencer >= 0 &&
          d.diasParaVencer <= 7,
      ).length,
    };

    return { resumo, dividas };
  },

  async buscarPorId(id: string | number, userId: number) {
    if (typeof id === "string" && id.startsWith("vol-")) {
      const despesaId = Number(id.replace("vol-", ""));
      const divida = await repositorio.buscarVolatilPorDespesaId(
        despesaId,
        userId,
      );
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

    // 2. Gerar agendamentos automáticos em lote (Bulk Insert)
    const valorParcela = Number(novaDivida.valorEstimado || 0);
    const dataInicio = new Date(dados.dataInicio);
    const diaDesejado = dataInicio.getUTCDate();

    const lancamentosData = [];

    for (let i = 0; i < dados.totalParcelas; i++) {
      // Criamos a data base em UTC para manipulação segura
      const dataParcela = new Date(
        Date.UTC(dataInicio.getUTCFullYear(), dataInicio.getUTCMonth() + i, 1),
      );

      // Regra de Vencimento: manter dia da dataInicio ou último dia do mês
      const ultimoDiaMes = new Date(
        Date.UTC(
          dataParcela.getUTCFullYear(),
          dataParcela.getUTCMonth() + 1,
          0,
        ),
      ).getUTCDate();
      dataParcela.setUTCDate(Math.min(diaDesejado, ultimoDiaMes));

      lancamentosData.push({
        userId,
        despesaId: novaDivida.id,
        tipo: "agendamento" as const,
        valor: valorParcela,
        data: dataParcela,
        observacao: novaDivida.nome,
        observacaoAutomatica: gerarObservacaoAutomatica(
          i + 1,
          dados.totalParcelas,
          novaDivida.nome,
          valorParcela,
        ),
      });
    }

    await prisma.lancamento.createMany({
      data: lancamentosData,
    });

    return novaDivida;
  },

  async atualizar(id: string | number, dados: UpdateDividaDTO) {
    const hasDivida = await repositorio.buscarPorId(Number(id));
    if (!hasDivida) throw new NotFoundError("Dívida não encontrada");

    // 1. Obter os novos valores consolidados (com fallback para os dados originais)
    const nomeFinal = dados.nome !== undefined ? dados.nome : hasDivida.nome;
    const valorTotalFinal =
      dados.valorTotal !== undefined ? dados.valorTotal : hasDivida.valorTotal;
    const totalParcelasFinal =
      dados.totalParcelas !== undefined
        ? dados.totalParcelas
        : hasDivida.totalParcelas;
    const dataInicioFinal =
      dados.dataInicio !== undefined
        ? new Date(dados.dataInicio)
        : new Date(hasDivida.dataInicio);

    // 2. Definir o valorEstimado da parcela (prioriza o enviado pelo front, usa o já salvo como fallback)
    const novoValorParcela =
      dados.valorEstimado !== undefined
        ? dados.valorEstimado
        : Number(hasDivida.valorParcela || 0);

    // 3. Atualizar a dívida principal na tabela despesa, definindo valorEstimado e o diaVencimento
    const diaVencimentoFinal = dataInicioFinal.getUTCDate();
    const dividaAtualizada = await repositorio.atualizar(Number(id), {
      ...dados,
      valorEstimado: novoValorParcela,
      diaVencimento: diaVencimentoFinal,
      dataInicio: dataInicioFinal,
    });

    // 4. Sincronização e Saneamento de Lançamentos (Modo Pilha com prevenção de duplicidades)
    // Criamos as datas previstas do novo cronograma planejado
    const mesesPlanejados = new Map<
      string,
      { dataVencimento: Date; numeroParcela: number }
    >();
    for (let i = 0; i < totalParcelasFinal; i++) {
      const dataParcela = new Date(
        Date.UTC(
          dataInicioFinal.getUTCFullYear(),
          dataInicioFinal.getUTCMonth() + i,
          1,
        ),
      );

      const ultimoDiaMes = new Date(
        Date.UTC(
          dataParcela.getUTCFullYear(),
          dataParcela.getUTCMonth() + 1,
          0,
        ),
      ).getUTCDate();

      dataParcela.setUTCDate(Math.min(diaVencimentoFinal, ultimoDiaMes));

      const key = `${String(dataParcela.getUTCMonth() + 1).padStart(2, "0")}-${dataParcela.getUTCFullYear()}`;
      mesesPlanejados.set(key, {
        dataVencimento: dataParcela,
        numeroParcela: i + 1,
      });
    }

    // Buscar todos os lançamentos atuais para essa despesa no banco
    const lancamentosAtuais = await prisma.lancamento.findMany({
      where: { despesaId: Number(id) },
    });

    const agendamentosPorMes = new Map<string, typeof lancamentosAtuais>();
    const pagamentosPorMes = new Map<string, typeof lancamentosAtuais>();

    lancamentosAtuais.forEach((l) => {
      const date = new Date(l.data);
      const key = `${String(date.getUTCMonth() + 1).padStart(2, "0")}-${date.getUTCFullYear()}`;

      if (l.tipo === "agendamento") {
        const list = agendamentosPorMes.get(key) || [];
        list.push(l);
        agendamentosPorMes.set(key, list);
      } else if (l.tipo === "pagamento") {
        const list = pagamentosPorMes.get(key) || [];
        list.push(l);
        pagamentosPorMes.set(key, list);
      }
    });

    const idsParaDeletar: number[] = [];
    const novosAgendamentosData = [];
    const operacoes = [];

    // Sincronizar os meses planejados do novo cronograma
    for (const [key, info] of mesesPlanejados.entries()) {
      const agendamentosMes = agendamentosPorMes.get(key) || [];
      const obsAutomatica = gerarObservacaoAutomatica(
        info.numeroParcela,
        totalParcelasFinal,
        nomeFinal,
        novoValorParcela,
      );

      if (agendamentosMes.length > 0) {
        // Se há agendamento(s) neste mês:
        // 1. O sobrevivente será o primeiro agendamento da lista
        const sobrevivente = agendamentosMes[0];

        // 2. Tratar duplicidades: Mesclar observações se houver mais de um agendamento
        let observacaoMesclada = sobrevivente.observacao || undefined;
        if (agendamentosMes.length > 1) {
          const observacoesOutros = agendamentosMes
            .map((l) => l.observacao)
            .filter((obs) => obs && obs.trim() !== "" && obs !== nomeFinal)
            .join(" | ");

          if (observacoesOutros.trim() !== "") {
            observacaoMesclada = observacoesOutros;
          }

          // Deletar os agendamentos duplicados excedentes
          for (let j = 1; j < agendamentosMes.length; j++) {
            idsParaDeletar.push(agendamentosMes[j].id);
          }
        }

        // 3. Acumular o update do sobrevivente com a data correta, valor e observações fundidas na transação
        operacoes.push(
          prisma.lancamento.update({
            where: { id: sobrevivente.id },
            data: {
              valor: novoValorParcela,
              data: info.dataVencimento,
              observacao: observacaoMesclada,
              observacaoAutomatica: obsAutomatica,
              updatedAt: new Date(),
            },
          }),
        );
      } else {
        // Se não há agendamento neste mês planejado:
        // Verificar pagamentos feitos neste mês para saber se cria um agendamento complementar
        const pagamentosMes = pagamentosPorMes.get(key) || [];
        const totalPagoMes = pagamentosMes.reduce(
          (acc, p) => acc + Number(p.valor),
          0,
        );

        if (totalPagoMes < novoValorParcela - 0.01) {
          // Cria agendamento com a diferença restante (ou valor total da parcela se não houver pagamento)
          const valorFaltante = novoValorParcela - totalPagoMes;

          novosAgendamentosData.push({
            userId: hasDivida.userId,
            despesaId: Number(id),
            tipo: "agendamento" as const,
            valor: valorFaltante,
            data: info.dataVencimento,
            observacao: nomeFinal,
            observacaoAutomatica: obsAutomatica,
          });
        }
      }
    }

    // 5. Exclusão de agendamentos órfãos fora do intervalo planejado (antes do mês de início ou após o mês final)
    for (const [key, list] of agendamentosPorMes.entries()) {
      if (!mesesPlanejados.has(key)) {
        for (const agendamento of list) {
          idsParaDeletar.push(agendamento.id);
        }
      }
    }

    // Adicionar as operações em lote na transação consolidada
    if (idsParaDeletar.length > 0) {
      operacoes.push(
        prisma.lancamento.deleteMany({
          where: { id: { in: idsParaDeletar } },
        }),
      );
    }

    if (novosAgendamentosData.length > 0) {
      operacoes.push(
        prisma.lancamento.createMany({
          data: novosAgendamentosData,
        }),
      );
    }

    // Executar todas as operações de banco simultaneamente em uma única transação atômica
    if (operacoes.length > 0) {
      await prisma.$transaction(operacoes);
    }

    return dividaAtualizada;
  },

  async remover(id: string | number) {
    const hasDivida = await repositorio.buscarPorId(Number(id));
    if (!hasDivida) throw new NotFoundError("Dívida não encontrada");

    return await repositorio.remover(Number(id));
  },

  async processarAporte(
    id: string | number,
    dados: ProcessAporteDTO,
    userId: number,
  ) {
    const dividaId = Number(id);
    const divida = await repositorio.buscarPorId(dividaId);
    if (!divida || divida.userId !== userId)
      throw new NotFoundError("Dívida não encontrada");

    // 1. Limpar e arredondar imediatamente a entrada de dados para duas casas decimais
    const valorRestanteLimpo = Number(Number(divida.valorRestante).toFixed(2));
    const valorAporteTotal = Number(Number(dados.valor).toFixed(2));

    // O saldo disponível inicial é o valor TOTAL do aporte trazido pelo usuário
    let saldoAporteDisponivel = valorAporteTotal;
    const dataAporte = dados.data || new Date();
    const mesesPagos: string[] = [];

    // Pegamos a situação atual das parcelas para saber por onde começar
    const parcelas = divida.situacaoParcelas || [];
    const novosPagamentosData: Prisma.LancamentoCreateManyInput[] = [];

    // Variável para acumular quanto de fato conseguimos amortizar das parcelas planejadas
    let totalAmortizadoNasParcelas = 0;

    for (const parcela of parcelas) {
      if (saldoAporteDisponivel <= 0) break;
      if (parcela.status === "pago") continue;

      const valorNecessarioParaQuitar = Number(
        (parcela.valorAgendado - parcela.valorPago).toFixed(2),
      );

      if (valorNecessarioParaQuitar <= 0) continue;

      const valorAAplicar = Number(
        Math.min(saldoAporteDisponivel, valorNecessarioParaQuitar).toFixed(2),
      );

      // Cada pagamento que quita uma parcela é lançado com a respectiva data de vencimento da parcela
      const dataLancamento = new Date(parcela.dataVencimento);

      const numParcela = String(parcela.numero).padStart(2, "0");
      const totParcelas = String(parcelas.length).padStart(2, "0");

      novosPagamentosData.push({
        userId,
        despesaId: dividaId,
        tipo: "pagamento",
        valor: valorAAplicar,
        data: dataLancamento,
        observacao: `Aporte - Parcela ${numParcela}/${totParcelas}`,
        observacaoAutomatica: "Aporte Automático",
      });

      if (valorAAplicar >= valorNecessarioParaQuitar) {
        const mesFormatado = fnFormatNaiveDate(
          parcela.dataVencimento,
          "MMMM 'de' yyyy",
        );
        const capitalizado =
          mesFormatado.charAt(0).toUpperCase() + mesFormatado.slice(1);
        mesesPagos.push(capitalizado);
      }

      saldoAporteDisponivel = Number(
        (saldoAporteDisponivel - valorAAplicar).toFixed(2),
      );
      totalAmortizadoNasParcelas = Number(
        (totalAmortizadoNasParcelas + valorAAplicar).toFixed(2),
      );
    }

    // 2. O EXCEDENTE REAL É O QUE SOBROU APÓS TENTAR QUITAR TODAS AS PARCELAS POSSÍVEIS
    const excedenteReal = saldoAporteDisponivel;

    if (excedenteReal > 0) {
      // O excedente deve cair no mês subsequente ao de vencimento da última parcela do cronograma
      let dataExcedente = dataAporte;
      if (parcelas.length > 0) {
        const ultimaParcela = parcelas[parcelas.length - 1];
        const vencimentoUltimaDate = new Date(ultimaParcela.dataVencimento);
        dataExcedente = new Date(
          Date.UTC(
            vencimentoUltimaDate.getUTCFullYear(),
            vencimentoUltimaDate.getUTCMonth() + 1, // Mês após a última parcela
            divida.diaVencimento || vencimentoUltimaDate.getUTCDate(),
          ),
        );
      }

      novosPagamentosData.push({
        userId,
        despesaId: dividaId,
        tipo: "pagamento",
        valor: excedenteReal,
        data: dataExcedente,
        observacao: `Aporte Excedente - ${divida.nome}`,
        observacaoAutomatica: "Aporte Automático",
      });
    }

    // 3. A QUITAÇÃO SÓ É REAL SE O TOTAL AMORTIZADO + EXCEDENTE COBRIU O RESTANTE DA DÍVIDA
    const foiQuitada =
      totalAmortizadoNasParcelas + excedenteReal >= valorRestanteLimpo;

    const operacoes: Prisma.PrismaPromise<any>[] = [];

    // Adiciona a inserção em lote dos pagamentos na transação
    if (novosPagamentosData.length > 0) {
      operacoes.push(
        prisma.lancamento.createMany({
          data: novosPagamentosData,
        }),
      );
    }

    // Se a dívida foi quitada com o aporte, inativa na mesma transação atômica
    if (foiQuitada && divida.status === "A") {
      operacoes.push(
        prisma.despesa.update({
          where: { id: dividaId },
          data: { status: "I" },
        }),
      );
    }

    // Executamos a inserção dos pagamentos de forma atômica
    if (operacoes.length > 0) {
      await prisma.$transaction(operacoes);
    }

    return {
      mesesPagos,
      excedenteReal,
    };
  },
};
