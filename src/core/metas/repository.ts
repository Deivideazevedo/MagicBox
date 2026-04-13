import { prisma } from "@/lib/prisma";
import { Meta as PrismaMeta } from "@prisma/client";
import { CreateMetaDTO, UpdateMetaDTO } from "./meta.dto";
import { Meta } from "./types";

export const metasRepository = {
  /**
   * Obtém todas as metas com suporte a filtros e soft delete.
   */
  async listarTodos(filtros: Partial<PrismaMeta>): Promise<Meta[]> {
    return await prisma.meta.findMany({
      where: {
        ...filtros,
        deletedAt: filtros.deletedAt !== undefined ? filtros.deletedAt : null,
      },
      orderBy: { createdAt: "desc" },
    }) as unknown as Meta[];
  },

  /**
   * Obtém o resumo consolidado das metas do usuário.
   */
  async obterResumoMetas(userId: number): Promise<{
    totalObjetivado: number;
    totalAcumulado: number;
    totalFaltante: number;
    metasConcluidas: number;
    totalAtivas: number;
    metas: Meta[];
  }> {
    const metas = await prisma.meta.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' }
    });

    const aportes = await prisma.lancamento.groupBy({
      by: ['metaId'],
      where: {
        userId,
        metaId: { in: metas.map(m => m.id) },
        tipo: 'pagamento',
      },
      _sum: {
        valor: true
      }
    });

    const aportesMap = new Map(aportes.map(a => [a.metaId, Number(a._sum.valor || 0)]));

    const metasDetalhadas = metas.map(m => {
      const valorAcumulado = aportesMap.get(m.id) || 0;
      const valorMeta = Number(m.valorMeta);
      const progresso = valorMeta > 0 ? (valorAcumulado / valorMeta) * 100 : 0;
      
      return {
        ...m,
        valorAcumulado,
        valorMeta,
        progresso,
        concluida: valorAcumulado >= valorMeta && valorMeta > 0
      } as unknown as Meta;
    });

    const totalObjetivado = metasDetalhadas.reduce((acc, m) => acc + (m.valorMeta || 0), 0);
    const totalAcumulado = metasDetalhadas.reduce((acc, m) => acc + (m.valorAcumulado || 0), 0);
    const totalFaltante = Math.max(0, totalObjetivado - totalAcumulado);
    const metasConcluidas = metasDetalhadas.filter(m => m.concluida).length;

    return {
      totalObjetivado,
      totalAcumulado,
      totalFaltante,
      metasConcluidas,
      totalAtivas: metas.filter(m => m.status === 'A').length,
      metas: metasDetalhadas,
    };
  },

  async listarPorUsuario(userId: number): Promise<Meta[]> {
    const metas = await prisma.meta.findMany({
      where: { userId, deletedAt: null },
      include: {
        lancamentos: {
          where: { tipo: 'pagamento' },
          select: { valor: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return metas.map(m => ({
      ...m,
      valorAcumulado: m.lancamentos.reduce((acc, l) => acc + Number(l.valor), 0)
    })) as unknown as Meta[];
  },

  async buscarPorId(id: number): Promise<Meta | null> {
    const meta = await prisma.meta.findUnique({
      where: { id },
      include: {
        lancamentos: {
          where: { tipo: 'pagamento' }
        }
      }
    });

    if (!meta || meta.deletedAt) return null;

    return {
      ...meta,
      valorAcumulado: meta.lancamentos.reduce((acc, l) => acc + Number(l.valor), 0)
    } as unknown as Meta;
  },

  async criar(dados: CreateMetaDTO & { userId: number }): Promise<Meta> {
    const { valorInicial, ...dadosParaSalvar } = dados;

    return await prisma.meta.create({
      data: {
        ...dadosParaSalvar,
        dataAlvo: dadosParaSalvar.dataAlvo ? new Date(dadosParaSalvar.dataAlvo) : new Date(),
      }
    }) as unknown as Meta;
  },

  async atualizar(id: number, dados: UpdateMetaDTO): Promise<Meta> {
    return await prisma.meta.update({
      where: { id },
      data: {
        ...dados,
        dataAlvo: dados.dataAlvo ? new Date(dados.dataAlvo) : undefined,
      }
    }) as unknown as Meta;
  },

  async remover(id: number): Promise<boolean> {
    try {
      await prisma.meta.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return true;
    } catch {
      return false;
    }
  }
};
