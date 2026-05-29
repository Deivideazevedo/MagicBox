import { prisma } from "@/lib/prisma";
import { Objetivo as PrismaObjetivo } from "@prisma/client";
import { CreateObjetivoDTO, UpdateObjetivoDTO } from "./objetivo.dto";
import { Objetivo } from "./types";

export const objetivosRepository = {
  /**
   * Obtém todos os objetivos com suporte a filtros e soft delete.
   */
  async listarTodos(filtros: Partial<PrismaObjetivo>): Promise<Objetivo[]> {
    return await prisma.objetivo.findMany({
      where: {
        ...filtros,
        deletedAt: filtros.deletedAt !== undefined ? filtros.deletedAt : null,
      },
      orderBy: { createdAt: "desc" },
    }) as unknown as Objetivo[];
  },

  /**
   * Obtém o resumo consolidado dos objetivos do usuário.
   */
  async obterResumoObjetivos(userId: number): Promise<{
    totalObjetivado: number;
    totalAcumulado: number;
    totalFaltante: number;
    objetivosConcluidos: number;
    totalAtivas: number;
    objetivos: Objetivo[];
  }> {
    const objetivos = await prisma.objetivo.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' }
    });

    const aportes = await prisma.lancamento.groupBy({
      by: ['objetivoId'],
      where: {
        userId,
        objetivoId: { in: objetivos.map(o => o.id) },
        tipo: 'pagamento',
      },
      _sum: {
        valor: true
      }
    });

    const aportesMap = new Map(aportes.map(a => [a.objetivoId, Number(a._sum.valor || 0)]));

    const objetivosDetalhados = objetivos.map(o => {
      const valorAcumulado = aportesMap.get(o.id) || 0;
      const valorObjetivo = o.valorObjetivo ? Number(o.valorObjetivo) : null;
      
      const isMeta = o.tipo === "META";
      const progresso = isMeta && valorObjetivo && valorObjetivo > 0 ? (valorAcumulado / valorObjetivo) * 100 : null;
      const concluida = isMeta && valorObjetivo && valorObjetivo > 0 ? valorAcumulado >= valorObjetivo : false;

      return {
        ...o,
        valorAcumulado,
        valorObjetivo,
        progresso,
        concluida
      } as unknown as Objetivo;
    });

    const totalObjetivado = objetivosDetalhados.reduce((acc, o) => acc + (o.tipo === "META" ? (o.valorObjetivo || 0) : 0), 0);
    const totalAcumulado = objetivosDetalhados.reduce((acc, o) => acc + (o.valorAcumulado || 0), 0);
    
    // Para o total faltante, somamos apenas a diferença dos objetivos do tipo META que ainda não foram atingidos
    const totalFaltante = objetivosDetalhados.reduce((acc, o) => {
      if (o.tipo === "META" && o.valorObjetivo) {
        return acc + Math.max(0, o.valorObjetivo - (o.valorAcumulado || 0));
      }
      return acc;
    }, 0);
    
    const objetivosConcluidos = objetivosDetalhados.filter(o => o.concluida).length;

    return {
      totalObjetivado,
      totalAcumulado,
      totalFaltante,
      objetivosConcluidos,
      totalAtivas: objetivos.filter(o => o.status === 'A').length,
      objetivos: objetivosDetalhados,
    };
  },

  async listarPorUsuario(userId: number): Promise<Objetivo[]> {
    const objetivos = await prisma.objetivo.findMany({
      where: { userId, deletedAt: null },
      include: {
        lancamentos: {
          where: { tipo: 'pagamento' },
          select: { valor: true, data: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const hojeObj = new Date();
    const anoHoje = hojeObj.getFullYear();
    const mesHoje = hojeObj.getMonth();

    return objetivos.map(o => {
      const valorObj = o.valorObjetivo ? Number(o.valorObjetivo) : 0;
      const acumulado = o.lancamentos.reduce((acc, l) => acc + Number(l.valor), 0);
      const faltante = valorObj > 0 ? Math.max(valorObj - acumulado, 0) : 0;

      // Calcular meses pendentes
      let mesesPendentes = 1;
      let difMeses = 0;
      if (o.dataAlvo) {
        const targetDate = new Date(o.dataAlvo);
        const anoAlvo = targetDate.getFullYear();
        const mesAlvo = targetDate.getMonth();

        difMeses = (anoAlvo * 12 + mesAlvo) - (anoHoje * 12 + mesHoje);
        mesesPendentes = difMeses <= 0 ? 1 : difMeses;
      }

      // Somar aportes realizados no mês corrente
      const aportesDesteMes = o.lancamentos.reduce((acc, l) => {
        if (!l.data) return acc;
        const d = new Date(l.data);
        if (d.getFullYear() === anoHoje && d.getMonth() === mesHoje) {
          return acc + Number(l.valor);
        }
        return acc;
      }, 0);

      // Calcular previsão sugerida original antes dos aportes deste mês
      const acumuladoAntesDesteMes = Math.max(acumulado - aportesDesteMes, 0);
      const faltanteAntesDesteMes = Math.max(valorObj - acumuladoAntesDesteMes, 0);
      const previsaoOriginalDesteMes = mesesPendentes > 0 ? (faltanteAntesDesteMes / mesesPendentes) : 0;

      // Calcular previsão restante
      const previsaoRestanteDesteMes = Math.max(previsaoOriginalDesteMes - aportesDesteMes, 0);

      // Encontrar a data do último aporte (lançamento mais recente)
      let ultimoAporte: Date | null = null;
      if (o.lancamentos.length > 0) {
        ultimoAporte = o.lancamentos.reduce((max, l) => {
          if (!l.data) return max;
          const d = new Date(l.data);
          if (!max || d > max) return d;
          return max;
        }, null as Date | null);
      }

      // Desestruturamos para remover a lista completa de lançamentos e manter o payload leve
      const { lancamentos, ...resto } = o;

      return {
        ...resto,
        valorAcumulado: acumulado,
        previsaoDesteMes: previsaoRestanteDesteMes,
        aportesDesteMes: aportesDesteMes,
        difMeses: difMeses,
        qtdAportes: o.lancamentos.length,
        ultimoAporte: ultimoAporte
      };
    }) as unknown as Objetivo[];
  },

  async buscarPorId(id: number): Promise<Objetivo | null> {
    const objetivo = await prisma.objetivo.findUnique({
      where: { id },
      include: {
        lancamentos: {
          where: { tipo: 'pagamento' },
          orderBy: [
            { data: 'desc' },
            { createdAt: 'desc' }
          ]
        }
      }
    });

    if (!objetivo || objetivo.deletedAt) return null;

    return {
      ...objetivo,
      valorAcumulado: objetivo.lancamentos.reduce((acc, l) => acc + Number(l.valor), 0)
    } as unknown as Objetivo;
  },

  async criar(dados: CreateObjetivoDTO & { userId: number }): Promise<Objetivo> {
    const { valorInicial, ...rest } = dados;
    return await prisma.objetivo.create({
      data: {
        ...rest,
        valorObjetivo: rest.valorObjetivo ?? null,
        dataAlvo: rest.dataAlvo ? new Date(rest.dataAlvo) : null,
      }
    }) as unknown as Objetivo;
  },

  async atualizar(id: number, dados: UpdateObjetivoDTO): Promise<Objetivo> {
    const { valorAtual, ...rest } = dados as any;
    return await prisma.objetivo.update({
      where: { id },
      data: {
        ...rest,
        dataAlvo: rest.dataAlvo !== undefined ? (rest.dataAlvo ? new Date(rest.dataAlvo) : null) : undefined,
      }
    }) as unknown as Objetivo;
  },

  async remover(id: number): Promise<boolean> {
    try {
      await prisma.objetivo.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return true;
    } catch {
      return false;
    }
  }
};
