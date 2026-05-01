import { prisma } from "@/lib/prisma";
import { dividasRepository as coreDividasRepository } from "@/core/dividas/repository";
import { isWithinInterval, parseISO, startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface DividaResumoItem {
  id: number | string;
  nome: string;
  valorTotal: number;
  valorPago: number;
  valorRestante: number;
  totalParcelas: number;
  parcelasPagas: number;
  parcelasRestantes: number;
  progresso: number;
  isPaga: boolean;
  categoria: { nome: string; icone: string | null; cor: string | null } | null;
  icone: string | null;
  cor: string | null;
  diaVencimento: number | null;
  tipo: 'DIVIDA' | 'FIXA' | 'VARIAVEL';
  labelParcela?: string;
  status: string;
}

export const dividasRepository = {
  /**
   * Obtém o resumo consolidado das obrigações do usuário (Dívidas, Fixas e Variáveis)
   * Utiliza a lógica oficial de parcelamentos e projeções
   */
  async obterResumoDividas(userId: number, filtros?: { dataInicio: string; dataFim: string }) {
    const dataInicio = filtros ? parseISO(filtros.dataInicio) : null;
    const dataFim = filtros ? parseISO(filtros.dataFim) : null;

    // 1. DÍVIDAS E VARIÁVEIS (Lógica Oficial)
    const [unicas, volateis] = await Promise.all([
      coreDividasRepository.listarUnicas(userId),
      // Agora pedimos para incluir pagos e filtramos no banco se houver um filtro de período
      coreDividasRepository.listarVolateis(userId, !!filtros, filtros)
    ]);

    // 2. PROJEÇÕES FIXAS (SQL Soberano - Apenas se houver período)
    let fixasProjetadas: DividaResumoItem[] = [];
    if (filtros) {
      const projetadas = await prisma.$queryRaw<any[]>`
        WITH meses_do_periodo AS (
          SELECT mes_referencia::date
          FROM generate_series(date_trunc('month', ${filtros.dataInicio}::date), date_trunc('month', ${filtros.dataFim}::date), '1 month'::interval) as mes_referencia
        )
        SELECT 
          d.id, d.nome, d."valorEstimado" as "valorTotal", d.icone, d.cor, d."diaVencimento",
          c.nome as "catNome", c.icone as "catIcone", c.cor as "catCor"
        FROM despesa d
        LEFT JOIN categoria c ON d."categoriaId" = c.id
        CROSS JOIN meses_do_periodo m
        WHERE d."userId" = ${userId} 
          AND d.status = 'A' 
          AND d.tipo = 'FIXA'
          AND d."deletedAt" IS NULL
          AND m.mes_referencia >= date_trunc('month', d."createdAt")
          AND NOT EXISTS (
            SELECT 1 FROM lancamento l 
            WHERE l."despesaId" = d.id 
            AND l.tipo = 'agendamento'
            AND EXTRACT(MONTH FROM l.data) = EXTRACT(MONTH FROM m.mes_referencia)
            AND EXTRACT(YEAR FROM l.data) = EXTRACT(YEAR FROM m.mes_referencia)
          )
      `;

      fixasProjetadas = projetadas.map(p => ({
        id: `fix-${p.id}`,
        nome: p.nome,
        valorTotal: Number(p.valorTotal || 0),
        valorPago: 0,
        valorRestante: Number(p.valorTotal || 0),
        totalParcelas: 0,
        parcelasPagas: 0,
        parcelasRestantes: 0,
        progresso: 0,
        isPaga: false,
        categoria: p.catNome ? { nome: p.catNome, icone: p.catIcone, cor: p.catCor } : null,
        icone: p.icone,
        cor: p.cor,
        diaVencimento: p.diaVencimento,
        tipo: 'FIXA',
        status: 'projetada'
      }));
    } else {
      const fixasAtivas = await prisma.despesa.findMany({
        where: { userId, tipo: 'FIXA', status: 'A', deletedAt: null },
        include: { categoria: true }
      });
      fixasProjetadas = fixasAtivas.map(f => ({
        id: `fix-${f.id}`,
        nome: f.nome,
        valorTotal: Number(f.valorEstimado || 0),
        valorPago: 0,
        valorRestante: Number(f.valorEstimado || 0),
        totalParcelas: 0,
        parcelasPagas: 0,
        parcelasRestantes: 0,
        progresso: 0,
        isPaga: false,
        categoria: f.categoria,
        icone: f.icone,
        cor: f.cor,
        diaVencimento: f.diaVencimento,
        tipo: 'FIXA',
        status: 'ativa'
      }));
    }

    // 3. PROCESSAMENTO E FILTRAGEM
    const listagemCompleta: DividaResumoItem[] = [];

    // Processar Unicas (Dívidas)
    unicas.forEach(d => {
      const parcelas = d.situacaoParcelas || [];
      const parcelasNoPeriodo = (filtros && dataInicio && dataFim)
        ? parcelas.filter(p => {
            const dataVenc = parseISO(p.dataVencimento);
            return dataVenc >= startOfMonth(dataInicio) && dataVenc <= endOfMonth(dataFim);
          })
        : parcelas;

      parcelasNoPeriodo.forEach(p => {
        listagemCompleta.push({
          id: `${d.id}-${p.numero}`,
          nome: d.nome,
          valorTotal: p.valorAgendado,
          valorPago: p.valorPago,
          valorRestante: Math.max(0, p.valorAgendado - p.valorPago),
          totalParcelas: d.totalParcelas || 0,
          parcelasPagas: d.parcelasPagas || 0,
          parcelasRestantes: d.parcelasRestantes || 0,
          progresso: d.progresso || 0,
          isPaga: p.status === 'pago',
          categoria: { nome: d.categoriaNome || 'Sem Categoria', icone: null, cor: null },
          icone: d.icone || null,
          cor: d.cor || null,
          diaVencimento: d.diaVencimento || 0,
          tipo: 'DIVIDA',
          labelParcela: p.label,
          status: p.status
        });
      });
    });

    // Processar Volateis (Variáveis)
    volateis.forEach(v => {
      const parcelas = v.situacaoParcelas || [];
      const parcelasNoPeriodo = (filtros && dataInicio && dataFim)
        ? parcelas.filter(p => {
            const dataVenc = parseISO(p.dataVencimento);
            return dataVenc >= startOfMonth(dataInicio) && dataVenc <= endOfMonth(dataFim);
          })
        : parcelas;

      parcelasNoPeriodo.forEach(p => {
        listagemCompleta.push({
          id: `${v.id}-${p.numero}`,
          nome: v.nome,
          valorTotal: p.valorAgendado,
          valorPago: p.valorPago,
          valorRestante: Math.max(0, p.valorAgendado - p.valorPago),
          totalParcelas: 0,
          parcelasPagas: 0,
          parcelasRestantes: 0,
          progresso: 0,
          isPaga: p.status === 'pago',
          categoria: { nome: v.categoriaNome || 'Sem Categoria', icone: null, cor: null },
          icone: v.icone || null,
          cor: v.cor || null,
          diaVencimento: null,
          tipo: 'VARIAVEL',
          labelParcela: p.label,
          status: p.status
        });
      });
    });

    // Adicionar Fixas
    listagemCompleta.push(...fixasProjetadas);

    // 4. CONSOLIDAÇÃO
    const ativas = listagemCompleta.filter(d => !d.isPaga);
    const concluidas = listagemCompleta.filter(d => d.isPaga);

    return {
      totalAtivas: ativas.length,
      totalConcluidas: concluidas.length,
      saldoDevedorTotal: ativas.reduce((acc, d) => acc + d.valorRestante, 0),
      valorTotalOriginal: listagemCompleta.reduce((acc, d) => acc + d.valorTotal, 0),
      valorTotalPago: listagemCompleta.reduce((acc, d) => acc + d.valorPago, 0),
      listagem: listagemCompleta,
    };
  },
};
