import { relatoriosRepository } from "./repository";
import { RelatorioFiltros, RelatorioResponse, CategoriaRelatorio, ItemRelatorio } from "./relatorio.dto";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export const relatoriosService = {
  async gerarRelatorio(userId: number, dataInicio: Date, dataFim: Date): Promise<RelatorioResponse> {
    // 1. Busca dados brutos do período
    const [dadosBrutos, totalMetas, metasComProgresso] = await Promise.all([
      relatoriosRepository.obterDadosBrutosPorCategoria(userId, dataInicio, dataFim),
      relatoriosRepository.obterTotaisMetas(userId, dataInicio, dataFim),
      relatoriosRepository.obterMetasComProgresso(userId)
    ]);

    const categoriasMap = new Map<number, CategoriaRelatorio>();

    // 2. Processa itens e agrupa por categoria
    (dadosBrutos as any[]).forEach((db) => {
      if (!categoriasMap.has(db.categoriaId)) {
        categoriasMap.set(db.categoriaId, {
          id: db.categoriaId,
          nome: db.categoriaNome,
          icone: db.categoriaIcone,
          cor: db.categoriaCor,
          valorPlanejado: 0,
          valorRealizado: 0,
          deficit: 0,
          itens: []
        });
      }

      const categoria = categoriasMap.get(db.categoriaId)!;
      
      // Cálculo do planejado soberano: se houver agendamento manual, ele é o planejado. 
      // Se não, o valorEstimado da despesa/receita é o planejado.
      const planejado = db.valorAgendado > 0 ? db.valorAgendado : db.valorPlanejado;
      const realizado = db.valorRealizado;
      const deficit = realizado - planejado;

      const item: ItemRelatorio = {
        id: db.itemId,
        nome: db.itemNome,
        tipo: db.itemTipo,
        valorPlanejado: planejado,
        valorRealizado: realizado,
        deficit: deficit,
        mediaMensal: 0, // Será calculado em uma etapa posterior se necessário
        status: realizado >= planejado && planejado > 0 ? "OK" : (realizado > 0 ? "PARCIAL" : "PENDENTE"),
        historicoMensal: []
      };

      categoria.itens.push(item);
      categoria.valorPlanejado += planejado;
      categoria.valorRealizado += realizado;
      categoria.deficit += deficit;
    });

    // 2.1 Adiciona a Categoria Virtual "Metas Gerais" para aparecer na tabela 360
    const metasItens: ItemRelatorio[] = (metasComProgresso as any[]).map((m) => {
      const deficit = m.valorRealizado - m.valorPlanejado;
      return {
        id: m.itemId,
        nome: m.itemNome,
        tipo: 'META',
        valorPlanejado: m.valorPlanejado,
        valorRealizado: m.valorRealizado,
        deficit: deficit,
        mediaMensal: 0,
        status: m.valorRealizado >= m.valorPlanejado && m.valorPlanejado > 0 ? "OK" : "PENDENTE",
        historicoMensal: []
      };
    });

    if (metasItens.length > 0) {
      categoriasMap.set(-1, {
        id: -1,
        nome: "Metas e Investimentos",
        icone: "Target",
        cor: "#1976d2", // info.main
        valorPlanejado: metasItens.reduce((acc, i) => acc + i.valorPlanejado, 0),
        valorRealizado: metasItens.reduce((acc, i) => acc + i.valorRealizado, 0),
        deficit: metasItens.reduce((acc, i) => acc + i.deficit, 0),
        itens: metasItens
      });
    }

    const categorias = Array.from(categoriasMap.values());

    // 3. Resumo Geral
    const totalReceitasPagas = categorias.reduce((acc, c) => acc + c.itens.filter(i => i.tipo === 'RECEITA').reduce((sum, i) => sum + i.valorRealizado, 0), 0);
    const totalDespesasPagas = categorias.reduce((acc, c) => acc + c.itens.filter(i => i.tipo === 'DESPESA').reduce((sum, i) => sum + i.valorRealizado, 0), 0);
    const totalMetasPagas = Number(totalMetas._sum.valor) || 0;

    const totalReceitasPlanejadas = categorias.reduce((acc, c) => acc + c.itens.filter(i => i.tipo === 'RECEITA').reduce((sum, i) => sum + i.valorPlanejado, 0), 0);
    const totalDespesasPlanejadas = categorias.reduce((acc, c) => acc + c.itens.filter(i => i.tipo === 'DESPESA').reduce((sum, i) => sum + i.valorPlanejado, 0), 0);

    // Dívida pendente: qtd de despesas com agendamento > 0 e pagamento == 0
    let dividaPendente = 0;
    (dadosBrutos as any[]).forEach(db => {
      if (db.itemTipo === 'DESPESA' && db.valorAgendado > 0 && db.valorRealizado === 0) {
        dividaPendente++;
      }
    });

    // % de Metas: apenas as com valorMeta definido > 0
    let somaRealizadoMetas = 0;
    let somaPlanejadoMetas = 0;
    metasItens.forEach(m => {
      if (m.valorPlanejado > 0) {
        somaRealizadoMetas += m.valorRealizado;
        somaPlanejadoMetas += m.valorPlanejado;
      }
    });
    const metasPorcentagem = somaPlanejadoMetas > 0 ? (somaRealizadoMetas / somaPlanejadoMetas) * 100 : 0;

    const resumo = {
      totalReceitas: totalReceitasPlanejadas,
      receitasPagas: totalReceitasPagas,
      totalDespesas: totalDespesasPlanejadas,
      despesasPagas: totalDespesasPagas,
      totalMetas: totalMetasPagas,
      metasPorcentagem: metasPorcentagem > 100 ? 100 : metasPorcentagem,
      saldoLivre: totalReceitasPagas - (totalDespesasPagas + totalMetasPagas),
      saldoProjetado: totalReceitasPlanejadas - totalDespesasPlanejadas,
      saldoBloqueado: somaRealizadoMetas,
      dividaPendente: dividaPendente
    };

    // 4. Evolução (Dados fictícios para agora, podem ser implementados com query real depois)
    const evolucao = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(dataInicio, 5 - i);
      return {
        mes: format(d, "MMM", { locale: ptBR }),
        receitas: resumo.totalReceitas * (0.8 + Math.random() * 0.4),
        despesas: resumo.totalDespesas * (0.8 + Math.random() * 0.4),
        investimentos: resumo.totalMetas * (0.8 + Math.random() * 0.4)
      };
    });

    return {
      periodo: { dataInicio: dataInicio.toISOString().split('T')[0], dataFim: dataFim.toISOString().split('T')[0] },
      resumo,
      categorias,
      evolucao
    };
  },

  /**
   * Obtém o histórico detalhado de um item para a tabela lateral.
   */
  async obterDetalhesItem(userId: number, itemId: number, tipo: "RECEITA" | "DESPESA") {
    const historico = await relatoriosRepository.obterHistoricoItem(userId, itemId, tipo);
    return (historico as any[]).map(h => ({
      mes: format(h.mes, "MMM", { locale: ptBR }).toUpperCase(),
      ano: new Date(h.mes).getFullYear(),
      total: h.valor,
      deficit: 0 // Pode ser calculado se tivermos o planejado histórico
    }));
  }
};
