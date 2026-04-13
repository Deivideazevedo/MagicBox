import { prisma } from "@/lib/prisma";

export const dividasRepository = {
  /**
   * Obtém o resumo consolidado das dívidas do usuário
   * Retorna informações sobre amortização, parcelas e status
   */
  async obterResumoDividas(userId: number) {
    // 1. Dívidas Totais (Incluindo as 100% pagas para o detalhamento)
    const todasDividas = await prisma.despesa.findMany({
      where: {
        userId,
        tipo: 'DIVIDA',
        deletedAt: null,
      },
      include: {
        categoria: {
          select: { nome: true, icone: true, cor: true }
        }
      }
    });

    // 2. Saldos devedores reais (Baseado nos lançamentos de pagamento)
    const saldos = await prisma.lancamento.groupBy({
      by: ['despesaId'],
      where: {
        userId,
        tipo: 'pagamento',
        despesaId: { in: todasDividas.map(d => d.id) }
      },
      _sum: {
        valor: true
      },
      _count: {
        id: true
      }
    });

    const saldosMap = new Map(saldos.map(s => [s.despesaId, { 
      totalPago: Number(s._sum.valor || 0),
      parcelasPagas: s._count.id
    }]));

    // 3. Processar informações detalhadas
    const dividasDetalhadas = todasDividas.map(d => {
      const saldoInfo = saldosMap.get(d.id) || { totalPago: 0, parcelasPagas: 0 };
      const valorTotal = Number(d.valorTotal || 0);
      const valorRestante = Math.max(0, valorTotal - saldoInfo.totalPago);
      const totalParcelas = d.totalParcelas || 0;
      const parcelasRestantes = Math.max(0, totalParcelas - saldoInfo.parcelasPagas);
      
      const isPaga = valorRestante <= 0 && valorTotal > 0;

      return {
        id: d.id,
        nome: d.nome,
        valorTotal,
        valorPago: saldoInfo.totalPago,
        valorRestante,
        totalParcelas,
        parcelasPagas: saldoInfo.parcelasPagas,
        parcelasRestantes,
        progresso: valorTotal > 0 ? (saldoInfo.totalPago / valorTotal) * 100 : 0,
        isPaga,
        categoria: d.categoria,
        icone: d.icone,
        cor: d.cor,
        diaVencimento: d.diaVencimento
      };
    });

    // 4. Consolidação para os cards (Apenas dívidas com saldo devedor)
    const dividasAtivas = dividasDetalhadas.filter(d => !d.isPaga);
    const dividasConcluidas = dividasDetalhadas.filter(d => d.isPaga);

    return {
      totalAtivas: dividasAtivas.length,
      totalConcluidas: dividasConcluidas.length,
      saldoDevedorTotal: dividasAtivas.reduce((acc, d) => acc + d.valorRestante, 0),
      valorTotalOriginal: dividasDetalhadas.reduce((acc, d) => acc + d.valorTotal, 0),
      valorTotalPago: dividasDetalhadas.reduce((acc, d) => acc + d.valorPago, 0),
      // Lista completa para o detalhamento ("O máximo de informações")
      listagem: dividasDetalhadas,
    };
  },
};
