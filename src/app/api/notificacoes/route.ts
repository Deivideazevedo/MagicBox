// src/app/api/notificacoes/route.ts — central in-app (sino) do usuário logado.
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { notificacoesService } from "@/core/notificacoes/service";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(async (req: NextRequest) => {
  const authUser = await getAuthUser(req);
  const data = await notificacoesService.listarMinhas(authUser.userId);
  return NextResponse.json(data);
});
