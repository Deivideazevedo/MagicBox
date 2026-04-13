import { prisma } from "@/lib/prisma";
import {
  Prisma,
  Lancamento as PrismaLancamento,
  TipoLancamento
} from "@prisma/client";
import { PaginatedResult } from "../types/global";
import { FindAllFilters } from "./lancamento.dto";
import { LancamentoPayload } from "./types";

export const lancamentoRepository = {
  /**
   * Busca lançamentos com suporte a filtros dinâmicos
   */
  async listarTodos(
    filtros: FindAllFilters
  ): Promise<PaginatedResult<PrismaLancamento>> {
    const { 
      page = 0, 
      limit = 10, 
      dataInicio,
      dataFim,
      tipo,
      observacao,
      userId,
      categoriaId,
      despesaId,
      receitaId,
      origem,
    } = filtros;

    let whereClause: Prisma.LancamentoWhereInput = {};

    // Adicionar filtros válidos manualmente
    if (userId) {
      whereClause.userId = Number(userId);
    }
    if (categoriaId) {
      whereClause.categoriaId = Number(categoriaId);
    }
    if (despesaId) {
      whereClause.despesaId = Number(despesaId);
    }
    if (receitaId) {
      whereClause.receitaId = Number(receitaId);
    }
    if (origem) {
      if (origem === "despesa") {
        whereClause.despesaId = { not: null };
      } else if (origem === "renda" || origem === "receita") {
        whereClause.receitaId = { not: null };
      }
    }

    // Filtro por período
    if (dataInicio || dataFim) {
      whereClause.data = {};
      if (dataInicio) {
        whereClause.data.gte = new Date(dataInicio);
      }
      if (dataFim) {
        whereClause.data.lte = new Date(dataFim);
      }
    }

    // Filtro por tipo
    if (tipo) {
      whereClause.tipo = tipo as TipoLancamento;
    }

    // Filtro por busca (descrição)
    if (observacao) {
      whereClause.observacao = {
        contains: observacao,
        mode: 'insensitive',
      };
    }

    const [total, data] = await prisma.$transaction([
      prisma.lancamento.count({ where: whereClause }),
      prisma.lancamento.findMany({
        where: whereClause,
        take: limit,
        skip: page * limit,
        orderBy: { data: "desc" },
        include: {
          categoria: {
            select: {
              id: true,
              nome: true,
              icone: true,
              cor: true,
            },
          },
          despesa: {
            select: {
              id: true,
              nome: true,
              valorEstimado: true,
              diaVencimento: true,
              icone: true,
              cor: true,
            },
          },
          receita: {
            select: {
              id: true,
              nome: true,
              valorEstimado: true,
              diaRecebimento: true,
              icone: true,
              cor: true,
            },
          },
        },
      }),
    ]);

    return {
      data: data as any,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  },

  async buscarPorId(id: string | number) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    return await prisma.lancamento.findUnique({
      where: { id: numericId },
      include: {
        categoria: { select: { id: true, nome: true } },
        despesa: { select: { id: true, nome: true, valorEstimado: true, diaVencimento: true } },
        receita: { select: { id: true, nome: true, valorEstimado: true, diaRecebimento: true } },
      },
    });
  },

  async listarPorUsuario(userId: string | number) {
    const numericId = Number(userId);
    if (isNaN(numericId)) return [];

    return await prisma.lancamento.findMany({
      where: { userId: numericId },
      orderBy: { data: "desc" },
      include: {
        categoria: { select: { id: true, nome: true } },
        despesa: { select: { id: true, nome: true, valorEstimado: true, diaVencimento: true } },
        receita: { select: { id: true, nome: true, valorEstimado: true, diaRecebimento: true } },
      },
    });
  },

  async criar(data: any) {
    return await prisma.lancamento.create({
      data: {
        userId: Number(data.userId),
        tipo: data.tipo,
        valor: Number(data.valor),
        data: new Date(data.data),
        observacao: data.observacao,
        observacaoAutomatica: data.observacaoAutomatica,
        categoriaId: Number(data.categoriaId),
        despesaId: data.despesaId ? Number(data.despesaId) : null,
        receitaId: data.receitaId ? Number(data.receitaId) : null,
        metaId: data.metaId ? Number(data.metaId) : null,
      },
    });
  },

  async remover(id: string | number): Promise<boolean> {
    const numericId = Number(id);
    if (isNaN(numericId)) return false;

    try {
      await prisma.lancamento.delete({
        where: { id: numericId },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async removerEmMassa(ids: number[], userId: number): Promise<{ count: number }> {
    const resultado = await prisma.lancamento.deleteMany({
      where: {
        id: { in: ids },
        userId: userId,
      },
    });

    return { count: resultado.count };
  },

  async atualizar(id: string | number, data: Partial<LancamentoPayload>) {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error("ID inválido");

    return await prisma.lancamento.update({
      where: { id: numericId },
      data: {
        tipo: data.tipo ? (data.tipo as TipoLancamento) : undefined,
        valor: data.valor ? Number(data.valor) : undefined,
        data: data.data ? new Date(data.data) : undefined,
        observacao: data.observacao,
        despesaId: data.despesaId !== undefined ? (data.despesaId ? Number(data.despesaId) : null) : undefined,
        receitaId: data.receitaId !== undefined ? (data.receitaId ? Number(data.receitaId) : null) : undefined,
      },
    });
  },
};
