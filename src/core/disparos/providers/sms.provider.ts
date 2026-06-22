import { NotificationProvider, SendMessageOptions } from "../types";
// import axios from "axios"; // 🔑 DESCOMENTAR ao ativar o envio real (Comtele)

/**
 * Provider de SMS via gateway nacional Comtele (HTTP REST, roda na Vercel).
 *
 * ⚠️ ESTADO: PRONTO PORÉM INERTE. A chamada HTTP real está COMENTADA para evitar
 * erros enquanto a `COMTELE_API_KEY` não estiver configurada. Sem a key, o provider
 * apenas loga (no-op seguro) e retorna sucesso, não quebrando o disparo da cadência.
 *
 * PARA ATIVAR:
 *  1) Inserir COMTELE_API_KEY e COMTELE_SENDER no .env
 *  2) Descomentar o bloco marcado com 🔑 abaixo (e o import do axios no topo)
 *
 * Doc: https://comtele.com.br/sms-via-api/  (POST /api/v2/send, header "auth-key").
 */
export class SmsProvider implements NotificationProvider {
  async send(options: SendMessageOptions): Promise<{ success: boolean; error?: string }> {
    const apiKey = process.env.COMTELE_API_KEY;
    const sender = process.env.COMTELE_SENDER || "MagicBox";

    if (!apiKey) {
      console.log(`[SMS MOCK/Comtele] Enviando SMS para: ${options.destinatario}`);
      console.log(`Conteúdo:\n${options.conteudo}`);
      return { success: true };
    }

    // Número no formato nacional só-dígitos com DDI 55 (ex: 5571989515719)
    const receivers = this.formatarNumero(options.destinatario);

    // 🔑 DESCOMENTAR ao inserir COMTELE_API_KEY ----------------------------------
    // try {
    //   const response = await axios.post(
    //     "https://sms.comtele.com.br/api/v2/send",
    //     { Sender: sender, Receivers: receivers, Content: options.conteudo },
    //     { headers: { "auth-key": apiKey, "Content-Type": "application/json" } },
    //   );
    //   if (response.data?.Success) {
    //     return { success: true };
    //   }
    //   return { success: false, error: response.data?.Message || "Falha no envio Comtele" };
    // } catch (err: any) {
    //   console.error("[SMS Error/Comtele] Falha ao enviar:", err.message);
    //   return {
    //     success: false,
    //     error: err.response?.data?.Message || err.message || "Erro desconhecido",
    //   };
    // }
    // ---------------------------------------------------------------------------

    // Enquanto a chamada real está comentada, não envia (no-op seguro).
    console.log(`[SMS Comtele INATIVO] (key presente, chamada comentada) -> ${receivers}: ${sender}`);
    return { success: true };
  }

  private formatarNumero(numero: string): string {
    const digits = (numero || "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.startsWith("55") ? digits : `55${digits}`;
  }
}
