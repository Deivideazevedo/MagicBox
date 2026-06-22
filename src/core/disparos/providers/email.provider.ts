import { NotificationProvider, SendMessageOptions } from "../types";
import axios from "axios";
import nodemailer from "nodemailer";

/**
 * Função utilitária para extrair e validar e-mails de uma string ou array.
 * Suporta e-mails separados por vírgulas, pontos e vírgula ou espaços.
 */
export function extrairEmailsValidos(destinatario: string | string[]): string[] {
  let emailsBrutos: string[] = [];

  if (Array.isArray(destinatario)) {
    emailsBrutos = destinatario;
  } else if (typeof destinatario === "string") {
    emailsBrutos = destinatario.split(/[\s,;]+/);
  }

  // Regex padrão para validação de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const emailsValidos = emailsBrutos
    .map((email) => email.trim())
    .filter((email) => emailRegex.test(email));

  // Retorna uma lista sem duplicados
  return Array.from(new Set(emailsValidos));
}

export class EmailProvider implements NotificationProvider {
  async send(options: SendMessageOptions): Promise<{ success: boolean; error?: string }> {
    const emails = extrairEmailsValidos(options.destinatario);

    if (emails.length === 0) {
      console.warn("[Email Error] Nenhum destinatário válido encontrado na lista:", options.destinatario);
      return {
        success: false,
        error: "Nenhum e-mail de destinatário válido fornecido.",
      };
    }

    // 1. Tenta usar as configurações de SMTP (como Gmail)
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        // O Nodemailer aceita múltiplos e-mails separados por vírgula em uma string
        const info = await transporter.sendMail({
          from: smtpFrom,
          to: emails.join(", "),
          subject: options.assunto || "Notificação de Dívidas - MagicBox",
          html: options.conteudo, // O conteúdo já é formatado em HTML
        });

        console.log(`[Email SMTP] E-mail enviado com sucesso via SMTP para: ${emails.join(", ")}. MessageID: ${info.messageId}`);
        return { success: true };
      } catch (err: any) {
        console.error("[Email Error] Falha ao enviar email via SMTP:", err.message);
        return {
          success: false,
          error: `Erro SMTP: ${err.message}`,
        };
      }
    }

    // 2. Se não houver configurações de SMTP, tenta usar o Resend
    const apiKey = process.env.RESEND_API_KEY;
    const emailRemetente = process.env.EMAIL_FROM || "onboarding@resend.dev";

    if (apiKey) {
      try {
        // Usar a API do Resend via chamada HTTP direta com axios
        const response = await axios.post(
          "https://api.resend.com/emails",
          {
            from: emailRemetente,
            to: emails, // A API do Resend aceita um array de strings
            subject: options.assunto || "Notificação de Dívidas - MagicBox",
            html: options.conteudo,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          console.log(`[Email Resend] E-mail enviado com sucesso via Resend para: ${emails.join(", ")}`);
          return { success: true };
        } else {
          return { success: false, error: `Status da API Resend: ${response.status}` };
        }
      } catch (err: any) {
        console.error("[Email Error] Falha ao enviar email via Resend:", err.message);
        return {
          success: false,
          error: err.response?.data?.message || err.message || "Erro desconhecido",
        };
      }
    }

    // 3. Fallback: Mock (Desenvolvimento sem chaves)
    console.log(`[Email MOCK] Enviando e-mail para: ${emails.join(", ")}`);
    console.log(`Assunto: ${options.assunto}`);
    console.log(`Conteúdo:\n${options.conteudo}`);
    return { success: true };
  }
}

