import { CanalEnvio } from "./types";

// Módulo PURO (sem dependências de servidor): é a ÚNICA fonte da verdade dos
// textos de notificação. Tanto o disparo real (service.ts) quanto a
// pré-visualização da UI (buildPreview.ts) normalizam seus dados para o formato
// `DadosMensagem` e chamam `montarMensagem`, evitando templates duplicados.

export interface ItemVencida {
  nome: string;
  valor: number;
}

export interface ItemAVencer {
  nome: string;
  valor: number;
  dias: number;
}

export interface DadosMensagem {
  nome: string;
  vencidas: ItemVencida[];
  aVencer: ItemAVencer[];
}

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);

const textoDia = (dias: number) =>
  dias <= 0 ? "hoje" : `em ${dias} dia${dias > 1 ? "s" : ""}`;

/**
 * Monta o conteúdo da mensagem para o canal informado a partir de dados já
 * normalizados. `diasAVencer` reflete a janela escolhida no disparador e é usado
 * apenas nos rótulos ("A Vencer (Próximos N dias)").
 * EMAIL retorna HTML; os demais canais retornam texto puro.
 */
export function montarMensagem(
  dados: DadosMensagem,
  canal: CanalEnvio,
  diasAVencer = 7,
): string {
  const { vencidas, aVencer } = dados;
  const nome = dados.nome || "Usuário";
  const totalVencidas = vencidas.reduce((acc, d) => acc + (d.valor || 0), 0);
  const totalAVencer = aVencer.reduce((acc, d) => acc + (d.valor || 0), 0);

  if (canal === "IN_APP") {
    // In-app: o usuário já está logado, então a mensagem é limpa e amigável
    // (saudação + lista enxuta). O CTA ("Ver detalhes") é renderizado pelo
    // próprio card do sino.
    const plural = (n: number, singular: string, pluralForma: string) =>
      n === 1 ? singular : pluralForma;

    const linhas = [
      `Olá, ${nome.split(" ")[0]}! 👋 \nBoleto vencido não chora, mas cobra. Bora conferir?`,
    ];

    if (vencidas.length > 0) {
      linhas.push(
        `🐍 ${vencidas.length} ${plural(vencidas.length, "conta vencida", "contas vencidas")} · ${formatarMoeda(totalVencidas)}`,
      );
    }

    if (aVencer.length > 0) {
      linhas.push(
        `📆 ${aVencer.length} ${plural(aVencer.length, "conta a vencer", "contas a vencer")} em ${diasAVencer} dias · ${formatarMoeda(totalAVencer)}`,
      );
    }

    return linhas.join("\n");
  }

  if (canal === "SMS") {
    // SMS: texto curto, com remetente e sem acentos (compatibilidade GSM-7).
    const partes = [`MagicBox: Ola, ${nome}!`];
    if (vencidas.length > 0) {
      partes.push(
        `Voce tem ${vencidas.length} divida(s) vencida(s) no total de ${formatarMoeda(totalVencidas)}.`,
      );
    }
    if (aVencer.length > 0) {
      partes.push(
        `${aVencer.length} divida(s) vencendo nos proximos dias (${formatarMoeda(totalAVencer)}).`,
      );
    }
    partes.push("Acesse a plataforma para regularizar.");
    return partes.join(" ");
  }

  if (canal === "WHATSAPP" || canal === "TELEGRAM") {
    // WhatsApp/Telegram suportam markdown e mensagens um pouco mais ricas.
    const linhas = [
      `*MagicBox Notificações*`,
      "",
      `Olá, *${nome}*!`,
      "",
      "Identificamos pendências financeiras na sua conta:",
      "",
    ];

    if (vencidas.length > 0) {
      linhas.push("🔴 *Vencidas (Atrasadas):*");
      vencidas.forEach((d) =>
        linhas.push(`• ${d.nome} - *${formatarMoeda(d.valor)}*`),
      );
      linhas.push(`Total atrasado: *${formatarMoeda(totalVencidas)}*`, "");
    }

    if (aVencer.length > 0) {
      linhas.push(`🟡 *A Vencer (Próximos ${diasAVencer} dias):*`);
      aVencer.forEach((d) =>
        linhas.push(
          `• ${d.nome} - *${formatarMoeda(d.valor)}* (vence ${textoDia(d.dias)})`,
        ),
      );
      linhas.push(`Total a vencer: *${formatarMoeda(totalAVencer)}*`, "");
    }

    linhas.push(
      "Acesse seu painel no MagicBox para efetuar os pagamentos ou registrar os aportes de amortização.",
    );
    return linhas.join("\n");
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
                    <p style="font-size: 18px; color: #1e293b; margin: 0 0 10px 0; font-weight: 600;">Olá, ${nome},</p>
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
                            <td style="padding: 10px 4px; color: #1e293b; font-size: 14px; font-weight: 700; text-align: right;">${formatarMoeda(d.valor)}</td>
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
      const dias = d.dias === 0 ? "Hoje" : `Em ${d.dias} dias`;
      emailHtml += `
                          <tr style="border-bottom: 1px solid #ffedd5;">
                            <td style="padding: 10px 4px; color: #475569; font-size: 14px; font-weight: 500;">${d.nome}</td>
                            <td style="padding: 10px 4px; color: #d97706; font-size: 13px; font-weight: 600; text-align: center;">${dias}</td>
                            <td style="padding: 10px 4px; color: #1e293b; font-size: 14px; font-weight: 700; text-align: right;">${formatarMoeda(d.valor)}</td>
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
}
