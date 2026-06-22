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
   * Monta o conteúdo das mensagens dependendo do canal
   */
  formatarMensagem(
    name: string,
    vencidas: any[],
    aVencer: any[],
    canal: CanalEnvio,
  ) {
    const totalVencidas = vencidas.reduce(
      (acc, d) => acc + Number(d.valorProximaParcela || d.valorRestante || 0),
      0,
    );
    const totalAVencer = aVencer.reduce(
      (acc, d) => acc + Number(d.valorProximaParcela || d.valorRestante || 0),
      0,
    );

    const formatarMoeda = (valor: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor);

    if (canal === "IN_APP") {
      // In-app: o título do sino já identifica "MagicBox", então a mensagem não
      // repete o prefixo. Pode usar acentuação normalmente.
      let msg = `Olá, ${name}! `;
      if (vencidas.length > 0) {
        msg += `Você tem ${vencidas.length} dívida(s) vencida(s) no total de ${formatarMoeda(totalVencidas)}. `;
      }
      if (aVencer.length > 0) {
        msg += `${aVencer.length} dívida(s) vencendo nos próximos dias (${formatarMoeda(totalAVencer)}). `;
      }
      msg += "Acesse a plataforma para conferir e regularizar.";
      return msg;
    }

    if (canal === "SMS") {
      // SMS: texto curto, com remetente e sem acentos (compatibilidade GSM-7).
      let sms = `MagicBox: Ola, ${name}! `;
      if (vencidas.length > 0) {
        sms += `Voce tem ${vencidas.length} divida(s) vencida(s) no total de ${formatarMoeda(totalVencidas)}. `;
      }
      if (aVencer.length > 0) {
        sms += `${aVencer.length} divida(s) vencendo nos proximos dias (${formatarMoeda(totalAVencer)}). `;
      }
      sms += "Acesse a plataforma para conferir e regularizar.";
      return sms;
    }

    if (canal === "WHATSAPP" || canal === "TELEGRAM") {
      // WhatsApp/Telegram suportam markdown e mensagens um pouco mais ricas
      let wa = `*MagicBox Notificações*\n\nOlá, *${name}*!\n\nIdentificamos pendências financeiras na sua conta:\n\n`;

      if (vencidas.length > 0) {
        wa += `🔴 *Vencidas (Atrasadas):*\n`;
        vencidas.forEach((d) => {
          const valor = formatarMoeda(
            Number(d.valorProximaParcela || d.valorRestante || 0),
          );
          wa += `• ${d.nome} - *${valor}*\n`;
        });
        wa += `Total atrasado: *${formatarMoeda(totalVencidas)}*\n\n`;
      }

      if (aVencer.length > 0) {
        wa += `🟡 *A Vencer (Próximos 7 dias):*\n`;
        aVencer.forEach((d) => {
          const valor = formatarMoeda(
            Number(d.valorProximaParcela || d.valorRestante || 0),
          );
          const dias =
            d.diasParaVencer === 0 ? "hoje" : `em ${d.diasParaVencer} dias`;
          wa += `• ${d.nome} - *${valor}* (vence ${dias})\n`;
        });
        wa += `Total a vencer: *${formatarMoeda(totalAVencer)}*\n\n`;
      }

      wa += `Acesse seu painel no MagicBox para efetuar os pagamentos ou registrar os aportes de amortização.`;
      return wa;
    }

    // EMAIL (HTML)
    let emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificação de Dívidas - MagicBox</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f6;">
                
                <!-- Cabeçalho com Degradê Premium -->
                <tr>
                  <td style="background: linear-gradient(135deg, #5D87FF 0%, #4977F2 100%); padding: 35px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">MagicBox</h1>
                    <p style="color: rgba(255, 255, 255, 0.85); margin: 6px 0 0 0; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px;">Gestão Financeira Inteligente</p>
                  </td>
                </tr>

                <!-- Conteúdo Principal -->
                <tr>
                  <td style="padding: 35px 30px;">
                    <p style="font-size: 18px; color: #1e293b; margin: 0 0 10px 0; font-weight: 600;">Olá, ${name},</p>
                    <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin: 0 0 25px 0;">
                      Identificamos que existem pendências financeiras ativas registradas em sua conta. Confira abaixo o detalhamento dos vencimentos e organize suas finanças:
                    </p>
    `;

    if (vencidas.length > 0) {
      emailHtml += `
                    <!-- Card de Contas Vencidas -->
                    <div style="margin-bottom: 25px; border: 1px solid #fee2e2; border-radius: 12px; background-color: #fef2f2; padding: 20px;">
                      
                      <!-- Tabela de Alinhamento Horizontal (Badges) -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                        <tr>
                          <td width="90" style="vertical-align: middle;">
                            <span style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Atrasado</span>
                          </td>
                          <td style="vertical-align: middle; padding-left: 8px;">
                            <h3 style="color: #991b1b; margin: 0; font-size: 16px; font-weight: 700;">Contas Vencidas</h3>
                          </td>
                        </tr>
                      </table>
                      
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                        <thead>
                          <tr style="border-bottom: 1.5px solid #fca5a5; text-align: left;">
                            <th style="padding: 8px 4px; color: #7f1d1d; font-size: 13px; font-weight: 600;">Descrição</th>
                            <th style="padding: 8px 4px; color: #7f1d1d; font-size: 13px; font-weight: 600; text-align: right;">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
      `;
      vencidas.forEach((d) => {
        emailHtml += `
                          <tr style="border-bottom: 1px solid #fee2e2;">
                            <td style="padding: 10px 4px; color: #475569; font-size: 14px; font-weight: 500;">${d.nome}</td>
                            <td style="padding: 10px 4px; color: #1e293b; font-size: 14px; font-weight: 700; text-align: right;">${formatarMoeda(Number(d.valorProximaParcela || d.valorRestante || 0))}</td>
                          </tr>
        `;
      });
      emailHtml += `
                        </tbody>
                      </table>
                      
                      <div style="margin-top: 12px; text-align: right; border-top: 1px solid #fca5a5; padding-top: 8px;">
                        <span style="font-size: 13px; color: #7f1d1d; font-weight: 500; margin-right: 8px;">Subtotal Atrasado:</span>
                        <span style="font-size: 18px; color: #991b1b; font-weight: 800;">${formatarMoeda(totalVencidas)}</span>
                      </div>
                    </div>
      `;
    }

    if (aVencer.length > 0) {
      emailHtml += `
                    <!-- Card de Contas A Vencer -->
                    <div style="margin-bottom: 25px; border: 1px solid #ffedd5; border-radius: 12px; background-color: #fffbeb; padding: 20px;">
                      
                      <!-- Tabela de Alinhamento Horizontal (Badges) -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                        <tr>
                          <td width="90" style="vertical-align: middle;">
                            <span style="display: inline-block; background-color: #f59e0b; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">A Vencer</span>
                          </td>
                          <td style="vertical-align: middle; padding-left: 8px;">
                            <h3 style="color: #92400e; margin: 0; font-size: 16px; font-weight: 700;">Próximos Vencimentos</h3>
                          </td>
                        </tr>
                      </table>
                      
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                        <thead>
                          <tr style="border-bottom: 1.5px solid #fcd34d; text-align: left;">
                            <th style="padding: 8px 4px; color: #78350f; font-size: 13px; font-weight: 600;">Descrição</th>
                            <th style="padding: 8px 4px; color: #78350f; font-size: 13px; font-weight: 600; text-align: center;">Vencimento</th>
                            <th style="padding: 8px 4px; color: #78350f; font-size: 13px; font-weight: 600; text-align: right;">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
      `;
      aVencer.forEach((d) => {
        const dias =
          d.diasParaVencer === 0 ? "Hoje" : `Em ${d.diasParaVencer} dias`;
        emailHtml += `
                          <tr style="border-bottom: 1px solid #ffedd5;">
                            <td style="padding: 10px 4px; color: #475569; font-size: 14px; font-weight: 500;">${d.nome}</td>
                            <td style="padding: 10px 4px; color: #d97706; font-size: 13px; font-weight: 600; text-align: center;">${dias}</td>
                            <td style="padding: 10px 4px; color: #1e293b; font-size: 14px; font-weight: 700; text-align: right;">${formatarMoeda(Number(d.valorProximaParcela || d.valorRestante || 0))}</td>
                          </tr>
        `;
      });
      emailHtml += `
                        </tbody>
                      </table>
                      
                      <div style="margin-top: 12px; text-align: right; border-top: 1px solid #fcd34d; padding-top: 8px;">
                        <span style="font-size: 13px; color: #78350f; font-weight: 500; margin-right: 8px;">Subtotal a Vencer:</span>
                        <span style="font-size: 18px; color: #92400e; font-weight: 800;">${formatarMoeda(totalAVencer)}</span>
                      </div>
                    </div>
      `;
    }

    emailHtml += `
                    <!-- Botão de Ação Premium -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 20px; margin-bottom: 15px;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}" style="display: inline-block; background-color: #5D87FF; color: #ffffff; padding: 14px 28px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(93, 135, 255, 0.25); text-align: center;">
                            Acessar Painel Financeiro
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 30px 0 0 0; text-align: center;">
                      Recomendamos regularizar as pendências diretamente na plataforma para manter seus serviços ativos e suas contas organizadas.
                    </p>
                  </td>
                </tr>

                <!-- Rodapé -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 30px; border-top: 1px solid #f1f5f9; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                      Este é um e-mail transacional automático enviado por <strong>MagicBox</strong>.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.4;">
                      Você está recebendo este alerta de vencimento pois ativou as notificações do sistema.<br>
                      Caso não deseje mais receber estes avisos, por favor desative nas configurações de sua conta no MagicBox.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return emailHtml;
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
      vencidas: any[],
      aVencer: any[],
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

        const conteudo = this.formatarMensagem(
          user.name || "Usuário",
          vencidas,
          aVencer,
          canal,
        );

        // Canal in-app: cria uma Notificação no sino (não há provedor externo).
        if (canal === "IN_APP") {
          await notificacoesService.criar({
            userId: user.id,
            tipo: contexto,
            titulo: "Lembrete de dívidas - MagicBox",
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
