import { z } from "zod";

export const getNotificacoesSchema = z.object({
  dias: z.coerce.number().int().positive().optional().default(7),
});

export const dispararNotificacoesSchema = z
  .object({
    canais: z
      .array(z.enum(["EMAIL", "SMS", "WHATSAPP", "TELEGRAM", "IN_APP"]))
      .min(1, "Selecione ao menos um canal de envio."),
    dias: z.coerce.number().int().positive().optional().default(7),
    // "Enviar teste para mim": envia somente para o admin logado (server-driven).
    apenasAdmin: z.boolean().optional().default(false),
    // Disparo para um subconjunto selecionado de usuários.
    usuarioIds: z.array(z.number().int().positive()).optional(),
  })
  .strict()
  .refine((d) => d.apenasAdmin || (d.usuarioIds?.length ?? 0) > 0, {
    message: "Selecione ao menos um destinatário.",
    path: ["usuarioIds"],
  });

export type GetNotificacoesDTO = z.infer<typeof getNotificacoesSchema>;
export type DispararNotificacoesDTO = z.infer<typeof dispararNotificacoesSchema>;
