import { DividaResumoItem, dividasRepository } from "@/core/despesas/dividasRepository";
import { resumoRepository as repositorio } from "@/core/lancamentos/resumo/repository";
import { ResumoCardFiltros } from "@/core/lancamentos/resumo/resumo.dto";
import { metasRepository } from "@/core/metas/repository";
import { Meta } from "@/core/metas/types";
import { differenceInDays, isSameMonth, startOfDay, addMonths, setDate, endOfMonth, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";
import { chatDiagnosisRepository, DespesaComLancamentos } from "./diagnosis.repository";
import { DiagnosticoFinanceiro, ItemPilarDespesa, ResultadoPilarDespesas, ItemDetalheMensal } from "./types";

export const chatDiagnosisService = {
  /**
   * Orquestra dados de múltiplos pilares (Receita, Despesa, Metas, Dívidas)
   * para fornecer um diagnóstico completo para o Chat.
   */
  async obterDiagnosticoCompleto(
    userId: number,
    filtros?: ResumoCardFiltros,
  ): Promise<DiagnosticoFinanceiro> {
    const [historico, resumoMetas, resumoDividas, dadosPeriodo] =
      await Promise.all([
        repositorio.obterTotaisHistoricos(userId),
        metasRepository.obterResumoMetas(userId),
        dividasRepository.obterResumoDividas(userId, filtros),
        filtros ? repositorio.obterCardResumo(filtros) : null,
      ]);

    // Saldo Bloqueado = somatório de aportes em METAS ATIVAS
    const saldoBloqueado = resumoMetas.metas
      .filter((m: Meta) => m.status === "A")
      .reduce((acc: number, m: Meta) => acc + (m.valorAcumulado ?? 0), 0);

    // Saldo Atual (GLOBAL) = entradas pagas - saídas pagas
    const saldoAtual = historico.receitasPagas - historico.despesasPagas;

    const saldoAtualNoPeriodo =
      filtros && dadosPeriodo ? Number(dadosPeriodo.saldoAtual) : undefined;

    const saldoBloqueadoNoPeriodo =
      filtros && dadosPeriodo ? Number(dadosPeriodo.saldoBloqueado) : undefined;

    const saldoLivreNoPeriodo =
      saldoAtualNoPeriodo != null && saldoBloqueadoNoPeriodo != null
        ? saldoAtualNoPeriodo - saldoBloqueadoNoPeriodo
        : undefined;

    const saldoProjetadoNoPeriodo =
      filtros && dadosPeriodo ? Number(dadosPeriodo.saldoProjetado) : undefined;

    return {
      periodo: filtros
        ? { inicio: filtros.dataInicio, fim: filtros.dataFim }
        : undefined,
      contexto: filtros ? "MENSAL_PROJETADO" : "ABSOLUTO_HISTORICO",
      pilarReceitas: {
        totalHistorico: historico.receitasPagas,
        pagoNoPeriodo: dadosPeriodo ? Number(dadosPeriodo.entradasPagas) : 0,
        previstoNoPeriodo: dadosPeriodo
          ? Number(dadosPeriodo.entradasAgendadas)
          : 0,
        totalProjetadoNoPeriodo: dadosPeriodo
          ? Number(dadosPeriodo.totalEntradas)
          : 0,
        mediaMensalHistorica: historico.receitasPagas / 12,
      },
      pilarDespesas: {
        totalHistorico: historico.despesasPagas,
        pagoNoPeriodo: dadosPeriodo ? Number(dadosPeriodo.saidasPagas) : 0,
        previstoNoPeriodo: dadosPeriodo
          ? Number(dadosPeriodo.saidasAgendadas)
          : 0,
        totalProjetadoNoPeriodo: dadosPeriodo
          ? Number(dadosPeriodo.totalSaidas)
          : 0,
        totalDevedorDividas: resumoDividas.saldoDevedorTotal,
        detalheDividas: resumoDividas.listagem.map((d: DividaResumoItem): ItemPilarDespesa => ({
          ...d,
          valorTotal: Number(d.valorTotal) || 0,
          valorPago: (Number(d.valorTotal) || 0) - (Number(d.valorRestante) || 0),
          saldoDevedor: Number(d.valorRestante) || 0,
          status: d.isPaga ? "QUITADA" : "ATIVA",
          dataLancamento: null,
          isProjecao: false
        })),
      },
      pilarMetas: {
        totalAcumulado: resumoMetas.totalAcumulado || 0,
        totalObjetivadoAtivas: resumoMetas.totalObjetivado || 0,
        totalFaltanteAtivas: resumoMetas.totalFaltante || 0,
        totalAtivas: resumoMetas.totalAtivas || 0,
        totalConcluidas: resumoMetas.metasConcluidas || 0,
        metas: resumoMetas.metas.map((m: Meta) => ({
          id: Number(m.id),
          nome: m.nome,
          valorAcumulado: m.valorAcumulado ?? 0,
          valorMeta: m.valorMeta,
          progresso: m.progresso ?? null,
          concluida: m.concluida ?? false,
          icone: m.icone || null,
          cor: m.cor || null,
          dataAlvo: m.dataAlvo || null,
        })),
      },
      saldos: {
        saldoBloqueado,
        saldoAtual,
        saldoLivre: saldoAtual - saldoBloqueado,
        saldoAtualNoPeriodo,
        saldoBloqueadoNoPeriodo,
        saldoLivreNoPeriodo,
        saldoProjetadoNoPeriodo,
      },
    };
  },

  /**
   * Obtém o Pilar de Despesas em um modelo hierárquico consolidado.
   * 
   * @description
   * Esta função retorna um **resumo executivo completo das despesas**, estruturado em três níveis 
   * de agregação para facilitar a análise de tendências e saúde financeira, sem a poluição de 
   * lançamentos individuais:
   * 
   * 1. TOTAIS GERAIS: Visão macro do pilar (Total Histórico, Pago, Previsto e Devedor).
   * 2. TOTAIS POR DESPESA: Agrupamento "Pai" que consolida os somatórios de cada item (ex: Internet, Aluguel).
   * 3. SOMATÓRIOS MENSAIS: Detalhamento "Filho" com o acumulado de cada mês para aquela despesa específica.
   * 
   * IMPORTANTE: Esta função **NÃO** retorna registro a registro de lançamentos. Ela trabalha apenas 
   * com somatórios consolidados e projeções mensais, sendo ideal para diagnósticos de alto nível.
   * 
   * QUANDO USAR:
   * - Como fonte de dados primária para o Agente de IA (Gênio) realizar diagnósticos e oferecer insights.
   * - Em dashboards analíticos que exigem agrupamento hierárquico (Pai -> Filhos).
   * 
   * POR QUE USAR:
   * - EVITA CONFUSÃO: Ao não trazer lançamentos granulares, foca no que realmente importa: os números finais.
   * - ECONOMIA DE TOKENS: JSON altamente sintetizado e sem redundâncias para processamento de IA.
   * - SOBERANIA SQL: Cálculos baseados na verdade do banco de dados, garantindo precisão absoluta.
   * 
   * Regras de Negócio:
   * 1. FIXAS: Calcula vencimento pelo 'diaVencimento'. Oculta projeções em buscas atemporais.
   * 2. DÍVIDAS: Gera parcelas futuras baseadas no plano original, sincronizando com pagamentos reais.
   * 3. VARIÁVEIS: O valor previsto é estritamente o agendado, permitindo identificar gastos extras.
   * 4. SOBERANIA: Datas são tratadas como "naïve" para evitar erros de timezone.
   * 
   * @returns {Promise<ResultadoPilarDespesas>} Objeto consolidado.
   */
  async obterPilarDespesas(userId: number, filtros?: ResumoCardFiltros): Promise<ResultadoPilarDespesas> {
    const dadosBrutos = await chatDiagnosisRepository.obterDadosConsolidadosDespesas(userId, filtros?.dataInicio, filtros?.dataFim);
    const agora = new Date();
    const hoje = startOfDay(agora);

    const despesasConsolidadas: ResultadoPilarDespesas['despesasConsolidadas'] = [];

    dadosBrutos.despesas.forEach((despesa) => {
      const lancamentos = despesa.lancamentos || [];
      const detalhesMensais: ItemDetalheMensal[] = [];

      if (despesa.tipo === "DIVIDA") {
        const dataInicioDespesa = new Date(despesa.dataInicio || despesa.createdAt);
        const totalParcelas = despesa.totalParcelas || 0;
        const valorParcelaBase = despesa.valorEstimado
          ? Number(despesa.valorEstimado)
          : (totalParcelas > 0 ? Number(despesa.valorTotal || 0) / totalParcelas : 0);
        const mesesProcessados = new Set<string>();

        // 1.1 Parcelas Planejadas
        for (let i = 0; i < totalParcelas; i++) {
          const isoInicio = fnFormatNaiveDate(dataInicioDespesa, "yyyy-MM-dd");
          const dataVencimentoOriginal = addMonths(parseISO(isoInicio), i);
          const ultimoDiaMes = endOfMonth(dataVencimentoOriginal).getDate();
          const diaFinal = despesa.diaVencimento ? Math.min(despesa.diaVencimento, ultimoDiaMes) : dataVencimentoOriginal.getDate();
          const dataVencimento = setDate(dataVencimentoOriginal, diaFinal);
          const isoVencimento = fnFormatNaiveDate(dataVencimento, "yyyy-MM-dd");

          // RIGOR: Só processa se estiver no período solicitado (se houver filtro)
          if (filtros?.dataInicio && filtros?.dataFim) {
            if (isoVencimento < filtros.dataInicio || isoVencimento > filtros.dataFim) continue;
          }

          const mes = dataVencimento.getMonth();
          const ano = dataVencimento.getFullYear();
          const chaveMes = `${mes}-${ano}`;
          mesesProcessados.add(chaveMes);

          const lancamentosMes = lancamentos.filter((l: any) => {
            const iso = fnFormatNaiveDate(l.data, "yyyy-MM-dd");
            const d = parseISO(iso);
            return d.getMonth() === mes && d.getFullYear() === ano;
          });

          const lancamentoPagamento = lancamentosMes.find((l: any) => l.tipo === 'pagamento');
          const valorPago = lancamentosMes.filter((l: any) => l.tipo === 'pagamento').reduce((acc: number, l: any) => acc + Number(l.valor), 0);
          const valorAgendadoReal = lancamentosMes.filter((l: any) => l.tipo === 'agendamento').reduce((acc: number, l: any) => acc + Number(l.valor), 0);
          const valorFinalAgendado = Math.max(valorAgendadoReal, valorParcelaBase);

          const statusInterno = Math.round(valorPago * 100) >= Math.round(valorFinalAgendado * 100)
            ? 'QUITADA' : (valorPago > 0 ? 'PARCIAL' : (dataVencimento < hoje && !isSameMonth(dataVencimento, hoje) ? 'ATRASADA' : 'PENDENTE'));

          detalhesMensais.push({
            id: `${despesa.id}-${i + 1}`,
            nome: despesa.nome,
            valorPrevisto: valorFinalAgendado,
            valorPago,
            saldoDevedor: Math.max(0, valorFinalAgendado - valorPago),
            status: statusInterno,
            labelParcela: `Parcela ${String(i + 1).padStart(2, '0')}/${String(totalParcelas).padStart(2, '0')}`,
            dataVencimento: isoVencimento,
            dataLancamento: lancamentoPagamento ? fnFormatNaiveDate(lancamentoPagamento.data, "yyyy-MM-dd") : null,
            diasParaVencer: differenceInDays(dataVencimento, hoje),
            isProjecao: false,
            observacao: lancamentosMes[0]?.observacao || lancamentosMes[0]?.observacaoAutomatica || undefined
          });
        }

        // 1.2 Parcelas Adicionais
        const lancamentosExtras = lancamentos.filter(l => {
          const iso = fnFormatNaiveDate(l.data, "yyyy-MM-dd");
          const d = parseISO(iso);
          return !mesesProcessados.has(`${d.getMonth()}-${d.getFullYear()}`);
        });

        const mesesExtras = new Map<string, { data: Date; pago: number; agendado: number; obs?: string; ultimaDataLancamento: string }>();
        lancamentosExtras.forEach(l => {
          const iso = fnFormatNaiveDate(l.data, "yyyy-MM-dd");
          const d = parseISO(iso);
          const chave = `${d.getMonth()}-${d.getFullYear()}`;
          const grupo = mesesExtras.get(chave) || { data: d, pago: 0, agendado: 0, obs: l.observacao || l.observacaoAutomatica || undefined, ultimaDataLancamento: iso };
          if (l.tipo === 'pagamento') grupo.pago += Number(l.valor);
          else grupo.agendado += Number(l.valor);
          if (iso > grupo.ultimaDataLancamento) grupo.ultimaDataLancamento = iso;
          mesesExtras.set(chave, grupo);
        });

        mesesExtras.forEach((grupo, chave) => {
          const valorBase = Math.max(grupo.agendado, grupo.pago);
          const statusInterno = Math.round(grupo.pago * 100) >= Math.round(valorBase * 100)
            ? 'QUITADA' : (grupo.pago > 0 ? 'PARCIAL' : (grupo.data < hoje && !isSameMonth(grupo.data, hoje) ? 'ATRASADA' : 'PENDENTE'));

          detalhesMensais.push({
            id: `${despesa.id}-extra-${chave}`,
            nome: despesa.nome,
            valorPrevisto: valorBase,
            valorPago: grupo.pago,
            saldoDevedor: Math.max(0, valorBase - grupo.pago),
            status: statusInterno,
            labelParcela: "Parcela Adicional",
            dataVencimento: fnFormatNaiveDate(grupo.data, "yyyy-MM-dd"),
            dataLancamento: null,
            diasParaVencer: differenceInDays(grupo.data, hoje),
            isProjecao: false,
            observacao: grupo.obs
          });
        });

      } else if (despesa.tipo === "FIXA") {
        const meses = new Map<string, { data: Date; dataFormatada: string; pago: number; agendado: number; obs?: string; isProjecao: boolean; temAgendamentoReal: boolean; ultimaDataPagamento: string | null }>();
        const valorEstimado = Number(despesa.valorEstimado || 0);

        const isAtemporal = !filtros?.dataInicio;

        lancamentos.forEach((l: any) => {
          // No modo atemporal, ignoramos o que for projeção vinda do repositório
          if (isAtemporal && l.isProjecao) return;

          const iso = fnFormatNaiveDate(l.data, "yyyy-MM-dd");
          const date = parseISO(iso);
          const chave = `${date.getMonth()}-${date.getFullYear()}`;
          const grupo = meses.get(chave) || {
            data: date,
            dataFormatada: iso,
            pago: 0,
            agendado: 0,
            obs: l.observacao || l.observacaoAutomatica || undefined,
            isProjecao: false,
            temAgendamentoReal: false,
            ultimaDataPagamento: null
          };

          if (l.tipo === 'pagamento') {
            grupo.pago += Number(l.valor);
            if (!grupo.ultimaDataPagamento || iso > grupo.ultimaDataPagamento) {
              grupo.ultimaDataPagamento = iso;
            }
          } else {
            grupo.agendado += Number(l.valor);
            if (l.isProjecao) {
              grupo.isProjecao = true;
              grupo.dataFormatada = iso; // Data soberana do SQL
            } else {
              grupo.temAgendamentoReal = true;
            }
          }
          meses.set(chave, grupo);
        });

        meses.forEach((grupo, chave) => {
          const isAtemporal = !filtros?.dataInicio;

          // Se for atemporal, o previsto é apenas o agendamento real caso tenha valor maior que 0. Se for temporal, projetamos o valorEstimado.
          const valorBase = isAtemporal ? (grupo.agendado || valorEstimado) : Math.max(grupo.agendado, valorEstimado);

          // Cálculo do Vencimento Real baseado no diaVencimento da despesa
          const dataReferencia = grupo.data;
          const ultimoDiaMes = endOfMonth(dataReferencia).getDate();
          const diaFinal = despesa.diaVencimento ? Math.min(despesa.diaVencimento, ultimoDiaMes) : dataReferencia.getDate();
          const dataVencimentoReal = setDate(dataReferencia, diaFinal);
          const isoVencimentoReal = fnFormatNaiveDate(dataVencimentoReal, "yyyy-MM-dd");

          // No modo atemporal, ignoramos meses que não tenham movimentação real (pagamento ou agendamento real)
          if (isAtemporal && grupo.pago === 0 && grupo.agendado === 0) {
            return;
          }

          // A marcação de projeção só existe no modo TEMPORAL e se não houver agendamento real
          const isRealmenteProjetado = !isAtemporal && grupo.isProjecao && !grupo.temAgendamentoReal;

          const statusInterno = Math.round(grupo.pago * 100) >= Math.round(valorBase * 100)
            ? 'QUITADA' : (grupo.pago > 0 ? 'PARCIAL' : (isRealmenteProjetado ? 'PENDENTE' : (dataVencimentoReal < hoje && !isSameMonth(dataVencimentoReal, hoje) ? 'ATRASADA' : 'PENDENTE')));

          detalhesMensais.push({
            id: `${despesa.id}-${chave}`,
            nome: despesa.nome,
            valorPrevisto: valorBase,
            valorPago: grupo.pago,
            saldoDevedor: Math.max(0, valorBase - grupo.pago),
            status: statusInterno,
            dataVencimento: isoVencimentoReal,
            dataLancamento: grupo.ultimaDataPagamento,
            diasParaVencer: differenceInDays(dataVencimentoReal, hoje),
            isProjecao: isRealmenteProjetado,
            observacao: grupo.obs
          });
        });

      } else if (despesa.tipo === "VARIAVEL") {
        const meses = new Map<string, { data: Date; pago: number; agendado: number; obs?: string; ultimaDataPagamento: string | null }>();
        lancamentos.forEach((l: any) => {
          const iso = fnFormatNaiveDate(l.data, "yyyy-MM-dd");
          const date = parseISO(iso);
          const chave = `${date.getMonth()}-${date.getFullYear()}`;
          const grupo = meses.get(chave) || { data: date, pago: 0, agendado: 0, obs: l.observacao || l.observacaoAutomatica || undefined, ultimaDataPagamento: null };

          if (l.tipo === 'pagamento') {
            grupo.pago += Number(l.valor);
            if (!grupo.ultimaDataPagamento || iso > grupo.ultimaDataPagamento) {
              grupo.ultimaDataPagamento = iso;
            }
          } else {
            grupo.agendado += Number(l.valor);
          }
          meses.set(chave, grupo);
        });

        meses.forEach((grupo, chave) => {
          const valorPrevisto = grupo.agendado; // Para variável, o previsto é SÓ o agendado
          const statusInterno = Math.round(grupo.pago * 100) >= Math.round(valorPrevisto * 100)
            ? 'QUITADA' : (grupo.pago > 0 ? 'PARCIAL' : (grupo.data < hoje && !isSameMonth(grupo.data, hoje) ? 'ATRASADA' : 'PENDENTE'));

          detalhesMensais.push({
            id: `${despesa.id}-${chave}`,
            nome: despesa.nome,
            valorPrevisto,
            valorPago: grupo.pago,
            saldoDevedor: Math.max(0, valorPrevisto - grupo.pago),
            status: statusInterno,
            labelParcela: format(grupo.data, "MM/yyyy", { locale: ptBR }),
            dataVencimento: null,
            dataLancamento: grupo.ultimaDataPagamento,
            diasParaVencer: 0,
            isProjecao: false,
            observacao: grupo.obs
          });
        });
      }

      if (detalhesMensais.length > 0) {
        const totalPrevisto = detalhesMensais.reduce((acc, d) => acc + (d.valorPrevisto || 0), 0);
        const totalPago = detalhesMensais.reduce((acc, d) => acc + (d.valorPago || 0), 0);
        const saldoDevedor = detalhesMensais.reduce((acc, d) => acc + (d.saldoDevedor || 0), 0);

        const statusPai = Math.round(totalPago * 100) >= Math.round(totalPrevisto * 100) && totalPrevisto > 0 ? 'QUITADA' : 'ATIVA';

        despesasConsolidadas.push({
          id: despesa.id,
          nome: despesa.nome,
          tipo: despesa.tipo,
          totalPrevisto,
          totalPago,
          saldoDevedor,
          status: statusPai,
          detalhesMensais: detalhesMensais.sort((a, b) => (a.dataVencimento || a.dataLancamento || '').localeCompare(b.dataVencimento || b.dataLancamento || ''))
        });
      }
    });

    const saidasPagasPeriodo = despesasConsolidadas.reduce((acc: number, d) => acc + d.totalPago, 0);
    const saidasPrevistasPeriodo = despesasConsolidadas.reduce((acc: number, d) => acc + d.totalPrevisto, 0);
    const totalDevedorDividas = despesasConsolidadas.reduce((acc: number, d) => acc + d.saldoDevedor, 0);

    return {
      totalHistorico: Math.max(saidasPagasPeriodo, saidasPrevistasPeriodo),
      pagoNoPeriodo: saidasPagasPeriodo,
      previstoNoPeriodo: saidasPrevistasPeriodo,
      totalDevedorDividas,
      totalItens: despesasConsolidadas.length,
      despesasConsolidadas: despesasConsolidadas,
    };
  },
};
