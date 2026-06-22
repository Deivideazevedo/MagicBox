import { NotificationProvider, SendMessageOptions } from "../types";
// import axios from "axios"; // 🔑 DESCOMENTAR ao ativar o envio real (WhatsApp Cloud API)

/**
 * Provider de WhatsApp via Cloud API oficial da Meta (HTTP, roda na Vercel, sem ban).
 *
 * ⚠️ ESTADO: PRONTO PORÉM INERTE. A chamada HTTP real está COMENTADA até a conta
 * WhatsApp Business (WABA) + template de utilidade aprovado + token estarem prontos.
 * Sem `WHATSAPP_TOKEN`, o provider apenas loga (no-op seguro) e retorna sucesso.
 *
 * PARA ATIVAR:
 *  1) Criar/verificar WABA, número dedicado, template "utility" aprovado e opt-in.
 *  2) Inserir WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_TEMPLATE_NAME no .env.
 *  3) Descomentar o bloco marcado com 🔑 abaixo (e o import do axios no topo).
 *
 * Obs.: mensagens proativas exigem TEMPLATE aprovado; `conteudo` vira variável do template.
 */
export class WhatsAppProvider implements NotificationProvider {
  async send(options: SendMessageOptions): Promise<{ success: boolean; error?: string }> {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME;

    if (!token || !phoneNumberId || !templateName) {
      console.log(`[WhatsApp MOCK/Cloud] Enviando para: ${options.destinatario}`);
      console.log(`Conteúdo:\n${options.conteudo}`);
      return { success: true };
    }

    const to = this.formatarNumero(options.destinatario);

    // 🔑 DESCOMENTAR ao inserir WHATSAPP_TOKEN -----------------------------------
    // try {
    //   const response = await axios.post(
    //     `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    //     {
    //       messaging_product: "whatsapp",
    //       to,
    //       type: "template",
    //       template: {
    //         name: templateName,
    //         language: { code: "pt_BR" },
    //         components: [
    //           { type: "body", parameters: [{ type: "text", text: options.conteudo }] },
    //         ],
    //       },
    //     },
    //     { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
    //   );
    //   if (response.data?.messages?.length) {
    //     return { success: true };
    //   }
    //   return { success: false, error: "WhatsApp Cloud API: resposta sem messages." };
    // } catch (err: any) {
    //   console.error("[WhatsApp Error/Cloud] Falha ao enviar:", err.message);
    //   return {
    //     success: false,
    //     error: err.response?.data?.error?.message || err.message || "Erro desconhecido",
    //   };
    // }
    // ---------------------------------------------------------------------------

    // Enquanto a chamada real está comentada, não envia (no-op seguro).
    console.log(`[WhatsApp Cloud INATIVO] (envs presentes, chamada comentada) -> ${to}`);
    return { success: true };
  }

  private formatarNumero(numero: string): string {
    const digits = (numero || "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.startsWith("55") ? digits : `55${digits}`;
  }
}
