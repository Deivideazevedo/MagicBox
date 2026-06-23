import { dividasService } from "@/core/dividas/service";
import {
  CanalEnvio,
  NotificationStatus,
} from "./types";
import { disparosRepository } from "./repository";
import { EmailProvider } from "./providers/email.provider";
import { SmsProvider } from "./providers/sms.provider";
import { WhatsAppProvider } from "./providers/whatsapp.provider";
import { TelegramProvider } from "./providers/telegram.provider";
import { notificacoesService } from "@/core/notificacoes/service";
import { notificacoesRepository } from "@/core/notificacoes/repository";
import { estagioDoAlerta } from "./cadencia";
import { montarMensagem } from "./templates";
import { canalConfigurado } from "./config";

/**
 * Subconjunto de campos de uma despesa pendente que o formatador de mensagem
 * consome. Aceita tanto as linhas reais do CTE (`DespesaPendenteRow`) quanto os
 * objetos parciais usados em testes/simulações.
 */
type DespesaFormatavel = {
  nome: string;
  valorProximaParcela?: number;
  valorRestante?: number;
  diasParaVencer?: number | null;
};

const emailProvider = new EmailProvider();
const smsProvider = new SmsProvider();
const whatsAppProvider = new WhatsAppProvider();
const telegramProvider = new TelegramProvider();

export const disparosService = {
  async obterUsuariosAtivos() {
    return await disparosRepository.obterUsuariosAtivosSimplificado();
  },

  /**
   * Cria o cabeçalho do log de notificação (principal) em status PENDING.
   * Um log mestre representa o disparo inteiro (todos os canais/usuários).
   */
  async criarLogPrincipal(origem: "MANUAL" | "CRON", previstos: number, contexto: string = "DIVIDA") {
    try {
      return await disparosRepository.criarLogPrincipal(origem, previstos, contexto);
    } catch (err: any) {
      console.error(
        "[NotificationLog Error] Falha ao criar log principal no banco:",
        err.message,
      );
    }
  },

  /**
   * Atualiza o log principal no final do envio.
   */
  async finalizarLogPrincipal(
    logId: number,
    status: NotificationStatus,
    enviados: number,
    mensagemErro?: string | null,
  ) {
    try {
      return await disparosRepository.finalizarLogPrincipal(logId, status, enviados, mensagemErro);
    } catch (err: any) {
      console.error(
        "[NotificationLog Error] Falha ao finalizar log principal no banco:",
        err.message,
      );
    }
  },

  /**
   * Salva o log de detalhe de envio para um usuário específico.
   */
  async salvarLogUsuario(
    logId: number,
    userId: number,
    canal: CanalEnvio,
    status: "ENVIADO" | "FALHOU" | "BARRADO",
    mensagemErro?: string | null,
  ) {
    try {
      return await disparosRepository.salvarLogUsuario(logId, userId, canal, status, mensagemErro);
    } catch (err: any) {
      console.error(
        "[NotificationUserLog Error] Falha ao salvar log de usuário no banco:",
        err.message,
      );
    }
  },

  /**
   * Limpa o histórico de disparos antigo (retenção). Remove os lotes `Disparo` com
   * `createdAt` anterior a `meses` atrás (cascata leva os `DisparoEnvio` junto).
   * Único DELETE em massa — não estoura o timeout do cron. Nunca lança: em erro,
   * loga e devolve `removidos: 0` para não derrubar o disparo que já concluiu.
   */
  async limparLogsAntigos(meses = 1) {
    try {
      const dataLimite = new Date();
      dataLimite.setMonth(dataLimite.getMonth() - meses);
      const removidos = await disparosRepository.deletarLogsAntigos(dataLimite);
      return { removidos, limite: dataLimite };
    } catch (err: any) {
      console.error("[Disparos] Falha ao limpar logs antigos:", err.message);
      return { removidos: 0, erro: err.message };
    }
  },

  /**
   * Lista o histórico de notificações enviadas.
   */
  async listarLogs(userId?: number, limit = 20) {
    return await disparosRepository.listarLogs(userId, limit);
  },

  /**
   * Lista o histórico de notificações enviadas de forma paginada.
   */
  async listarLogsPaginado(limit = 10, page = 0) {
    return await disparosRepository.listarLogsPaginado(limit, page);
  },

  /**
   * Coleta as dívidas vencidas e a vencer de um usuário e monta os textos personalizados.
   */
  async obterDadosNotificacao(userId: number, diasAVencer = 7) {
    const user = await disparosRepository.buscarUsuarioPorId(userId);

    if (!user) {
      throw new Error(`Usuário ${userId} não encontrado ou inativo.`);
    }

    // Busca os dados consolidados via query CTE rápida
    const despesasPendentes =
      await disparosRepository.obterDespesasPendentesCTE(
        userId,
        new Date(),
      );

    // Filtra dívidas vencidas (atrasadas)
    const vencidas = despesasPendentes.filter(
      (d) => d.diasParaVencer !== null && d.diasParaVencer < 0,
    );

    // Filtra dívidas a vencer nos próximos X dias (configurado no controle deslizante)
    const aVencer = despesasPendentes.filter(
      (d) =>
        d.diasParaVencer !== null &&
        d.diasParaVencer >= 0 &&
        d.diasParaVencer <= diasAVencer,
    );

    return { user, vencidas, aVencer };
  },

  /**
   * Coleta as dívidas vencidas e a vencer de TODOS os usuários ativos de uma só vez,
   * agrupando as despesas por usuário na memória do Node.
   */
  async obterPendenciasGeral(diasAVencer = 7) {
    // 1. Buscar todos os usuários ativos
    const usuarios = await disparosRepository.obterUsuariosAtivos();

    // 2. Coletar despesas pendentes de todos os usuários em uma única query
    const despesasGerais =
      await disparosRepository.obterDespesasPendentesGeralCTE(new Date());

    // 3. Agrupar as despesas por userId em memória usando Map
    const despesasPorUsuario = new Map<number, typeof despesasGerais>();
    for (const d of despesasGerais) {
      if (!despesasPorUsuario.has(d.userId)) {
        despesasPorUsuario.set(d.userId, []);
      }
      despesasPorUsuario.get(d.userId)!.push(d);
    }

    // 4. Mapear cada usuário para suas respectivas despesas vencidas e a vencer
    const resultados = [];
    for (const user of usuarios) {
      const despesasUsuario = despesasPorUsuario.get(user.id) || [];

      // Filtra dívidas vencidas (atrasadas)
      const vencidas = despesasUsuario.filter(
        (d) => d.diasParaVencer !== null && d.diasParaVencer < 0,
      );

      // Filtra dívidas a vencer no período especificado
      const aVencer = despesasUsuario.filter(
        (d) =>
          d.diasParaVencer !== null &&
          d.diasParaVencer >= 0 &&
          d.diasParaVencer <= diasAVencer,
      );

      // Retorna apenas se tiver alguma pendência (assim como na lógica original do loop do route)
      if (vencidas.length > 0 || aVencer.length > 0) {
        resultados.push({ user, vencidas, aVencer });
      }
    }

    return resultados;
  },

  /**
   * Adaptador fino: normaliza as dívidas cruas (campos do banco) para o formato
   * `DadosMensagem` e delega ao template único em `templates.ts`. NÃO contém
   * texto de mensagem — essa é a única fonte da verdade compartilhada com a UI.
   */
  formatarMensagem(
    name: string,
    vencidas: DespesaFormatavel[],
    aVencer: DespesaFormatavel[],
    canal: CanalEnvio,
    diasAVencer = 7,
  ) {
    const valorDe = (d: DespesaFormatavel) =>
      Number(d.valorProximaParcela || d.valorRestante || 0);
    return montarMensagem(
      {
        nome: name,
        vencidas: vencidas.map((d) => ({ nome: d.nome, valor: valorDe(d) })),
        aVencer: aVencer.map((d) => ({
          nome: d.nome,
          valor: valorDe(d),
          dias: Number(d.diasParaVencer ?? 0),
        })),
      },
      canal,
      diasAVencer,
    );
  },

  /**
   * Dispara notificações para todos os usuários com pendência (ou apenas um, em teste).
   * Lê as pendências de todos em uma única passada (obterPendenciasGeral) e envia em
   * lotes paralelos por (usuário x canal). Cria UM log mestre por disparo e um detalhe
   * por (usuário x canal).
   */
  async dispararNotificacoes({
    canais,
    diasAVencer = 7,
    origem = "MANUAL",
    usuarioIds,
    contexto = "DIVIDA",
    ignorarPreferencias = false,
    canaisPorUsuario,
  }: {
    canais: CanalEnvio[];
    diasAVencer?: number;
    origem?: "MANUAL" | "CRON";
    usuarioIds?: number[];
    contexto?: string;
    // Quando true (ex.: "enviar teste para mim"), ignora o filtro de preferências.
    ignorarPreferencias?: boolean;
    // Quando informado, cada usuário usa seus próprios canais (cadência) em vez do `canais` global.
    canaisPorUsuario?: Map<number, CanalEnvio[]>;
  }) {
    // 1. Lê as pendências de todos os usuários ativos em uma única passada (2 queries).
    let pendencias = await this.obterPendenciasGeral(diasAVencer);

    // Disparo direcionado: filtra apenas os usuários selecionados (ou o admin no teste).
    if (usuarioIds?.length) {
      pendencias = pendencias.filter((p) => usuarioIds.includes(p.user.id));
    }

    // Carrega as preferências de canal de todos os destinatários numa única query.
    const prefsMap = ignorarPreferencias
      ? null
      : await notificacoesRepository.obterPreferenciasEmLote(
          pendencias.map((p) => p.user.id),
        );

    // Canais efetivos por usuário (cadência) ou o `canais` global (disparo simples).
    const canaisDoUsuario = (userId: number): CanalEnvio[] =>
      canaisPorUsuario?.get(userId) ?? canais;

    const porCanal: Record<string, { enviados: number; falhas: number }> = {};
    const todosCanais = canaisPorUsuario
      ? Array.from(new Set([...canais, ...Array.from(canaisPorUsuario.values()).flat()]))
      : canais;
    for (const canal of todosCanais) porCanal[canal] = { enviados: 0, falhas: 0 };

    const previstos = canaisPorUsuario
      ? pendencias.reduce((acc, p) => acc + canaisDoUsuario(p.user.id).length, 0)
      : pendencias.length * canais.length;

    // Nenhuma pendência: registra um log vazio para auditoria e retorna.
    if (previstos === 0) {
      const logVazio = await this.criarLogPrincipal(origem, 0, contexto);
      if (logVazio) {
        await this.finalizarLogPrincipal(logVazio.id, "ENVIADO", 0, null);
      }
      return {
        logId: logVazio?.id ?? null,
        previstos: 0,
        enviados: 0,
        falhas: 0,
        porCanal,
      };
    }

    // 2. Cria UM log mestre para o disparo inteiro.
    const log = await this.criarLogPrincipal(origem, previstos, contexto);
    if (!log) {
      return {
        logId: null,
        previstos,
        enviados: 0,
        falhas: previstos,
        porCanal,
        error: "Falha ao inicializar log de auditoria.",
      };
    }

    let enviados = 0;
    let falhas = 0;
    const erros: string[] = [];

    // Envia uma mensagem (usuário x canal) e grava o detalhe correspondente.
    const enviarUm = async (
      user: {
        id: number;
        name: string | null;
        email: string;
        phone: string | null;
      },
      vencidas: DespesaFormatavel[],
      aVencer: DespesaFormatavel[],
      canal: CanalEnvio,
    ) => {
      let status: "ENVIADO" | "FALHOU" | "BARRADO" = "FALHOU";
      let erro: string | null = null;

      try {
        const pref = prefsMap?.get(user.id) ?? null;

        // Filtro de preferência: canal desativado (ou Telegram sem vínculo) → BARRADO.
        if (!ignorarPreferencias && !notificacoesService.canalHabilitado(pref, canal)) {
          status = "BARRADO";
          erro = "Canal desativado nas preferências do usuário.";
          return { canal, status, erro };
        }

        // Canal sem credenciais (.env ausente): ignora (BARRADO) em vez de enviar
        // mensagem mocada em produção. IN_APP não depende de env e segue normalmente.
        if (canal !== "IN_APP" && !canalConfigurado(canal)) {
          status = "BARRADO";
          erro = `Canal ${canal} não configurado (variáveis de ambiente ausentes).`;
          return { canal, status, erro };
        }

        const conteudo = this.formatarMensagem(
          user.name || "Usuário",
          vencidas,
          aVencer,
          canal,
          diasAVencer,
        );

        // Canal in-app: cria uma Notificação no sino (não há provedor externo).
        if (canal === "IN_APP") {
          await notificacoesService.criar({
            userId: user.id,
            tipo: contexto,
            titulo: "🎩 A Mágica dos Boletos",
            mensagem: conteudo,
            link: "/cadastros/dividas",
          });
          status = "ENVIADO";
          return { canal, status, erro };
        }

        let destinatario = "";
        if (canal === "EMAIL") destinatario = user.email;
        else if (canal === "TELEGRAM") destinatario = pref?.telegramChatId || "";
        else destinatario = user.phone || ""; // SMS / WHATSAPP
        if (!destinatario) {
          throw new Error(`Destinatário vazio para o canal ${canal}`);
        }

        let res;
        if (canal === "EMAIL") {
          res = await emailProvider.send({
            destinatario,
            assunto: "Aviso de Dívidas Pendentes - MagicBox",
            conteudo,
          });
        } else if (canal === "SMS") {
          res = await smsProvider.send({ destinatario, conteudo });
        } else if (canal === "TELEGRAM") {
          res = await telegramProvider.send({ destinatario, conteudo });
        } else {
          res = await whatsAppProvider.send({ destinatario, conteudo });
        }

        if (res.success) {
          status = "ENVIADO";
        } else {
          erro = res.error || "Falha no provedor de envio";
        }
      } catch (err: any) {
        erro = err.message;
      } finally {
        await this.salvarLogUsuario(log.id, user.id, canal, status, erro);
      }

      return { canal, status, erro };
    };

    // 3. Processa em lotes (chunks) de usuários, em paralelo dentro do lote.
    const CHUNK_SIZE = 20;
    for (let i = 0; i < pendencias.length; i += CHUNK_SIZE) {
      const lote = pendencias.slice(i, i + CHUNK_SIZE);
      const tarefas = lote.flatMap((p) =>
        canaisDoUsuario(p.user.id).map((canal) =>
          enviarUm(p.user, p.vencidas, p.aVencer, canal),
        ),
      );
      const resultados = await Promise.all(tarefas);
      for (const r of resultados) {
        if (r.status === "ENVIADO") {
          enviados++;
          porCanal[r.canal].enviados++;
        } else if (r.status === "BARRADO") {
          // Bloqueado por preferência do usuário: não conta como falha.
          continue;
        } else {
          falhas++;
          porCanal[r.canal].falhas++;
          if (r.erro) erros.push(r.erro);
        }
      }
    }

    // 4. Finaliza o log mestre.
    const statusGeral = enviados === 0 ? "FALHOU" : "ENVIADO";
    const erroGlobal =
      erros.length > 0 ? Array.from(new Set(erros)).slice(0, 3).join("; ") : null;
    await this.finalizarLogPrincipal(log.id, statusGeral, enviados, erroGlobal);

    return { logId: log.id, previstos, enviados, falhas, porCanal };
  },

  /**
   * Disparo da CADÊNCIA de dívidas (consumido pelo cron). Para cada usuário, decide
   * os canais a partir dos estágios (cadencia.ts) que batem hoje, consolida numa única
   * passada e delega ao motor `dispararNotificacoes` com canais por usuário.
   */
  async dispararCadenciaDividas(origem: "MANUAL" | "CRON" = "CRON") {
    // Janela 7 cobre os estágios futuros (D-7..D0); as vencidas (dias<0) já vêm todas.
    const pendencias = await this.obterPendenciasGeral(7);

    const canaisPorUsuario = new Map<number, CanalEnvio[]>();
    for (const p of pendencias) {
      const canais = new Set<CanalEnvio>();
      for (const dividas of [p.vencidas, p.aVencer]) {
        for (const d of dividas) {
          const estagio = estagioDoAlerta(Number(d.diasParaVencer));
          if (estagio) estagio.canais.forEach((c) => canais.add(c));
        }
      }
      if (canais.size > 0) {
        canaisPorUsuario.set(p.user.id, Array.from(canais));
      }
    }

    // Nenhuma dívida bateu um estágio hoje.
    if (canaisPorUsuario.size === 0) {
      const logVazio = await this.criarLogPrincipal(origem, 0, "DIVIDA");
      if (logVazio) await this.finalizarLogPrincipal(logVazio.id, "ENVIADO", 0, null);
      return { logId: logVazio?.id ?? null, previstos: 0, enviados: 0, falhas: 0 };
    }

    return this.dispararNotificacoes({
      canais: [],
      diasAVencer: 7,
      origem,
      contexto: "DIVIDA",
      usuarioIds: Array.from(canaisPorUsuario.keys()),
      canaisPorUsuario,
    });
  },
};
