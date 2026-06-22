// src/app/api/notificacoes/preferencias/route.ts — preferências de canais do usuário logado.
import "@/lib/zod-config";

import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { notificacoesService } from "@/core/notificacoes/service";
import { updatePreferenciaSchema } from "@/core/notificacoes/dto";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(async (req: NextRequest) => {
  const authUser = await getAuthUser(req);
  const pref = await notificacoesService.obterMinhasPreferencias(authUser.userId);
  return NextResponse.json(pref);
});

export const PATCH = errorHandler(async (req: NextRequest) => {
  const authUser = await getAuthUser(req);
  const dados = updatePreferenciaSchema.parse(await req.json());
  const pref = await notificacoesService.atualizarMinhasPreferencias(
    authUser.userId,
    dados,
  );
  return NextResponse.json(pref);
});
