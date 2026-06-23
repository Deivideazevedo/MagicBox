// Inscrição de Web Push do dispositivo do usuário logado (registrar/cancelar).
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { notificacoesService } from "@/core/notificacoes/service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Formato da PushSubscription serializada (subscription.toJSON()) enviada pelo client.
const inscricaoSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const cancelarSchema = z.object({
  endpoint: z.string().url(),
});

// Registra (ou atualiza) a inscrição de push deste dispositivo/navegador.
export const POST = errorHandler(async (req: NextRequest) => {
  const authUser = await getAuthUser(req);
  const { endpoint, keys } = inscricaoSchema.parse(await req.json());

  await notificacoesService.registrarInscricaoPush({
    userId: authUser.userId,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    dispositivo: req.headers.get("user-agent"),
  });

  return NextResponse.json({ success: true }, { status: 201 });
});

// Cancela a inscrição de push (ao desativar as notificações no dispositivo).
export const DELETE = errorHandler(async (req: NextRequest) => {
  await getAuthUser(req);
  const { endpoint } = cancelarSchema.parse(await req.json());

  await notificacoesService.cancelarInscricaoPush(endpoint);

  return NextResponse.json({ success: true });
});
