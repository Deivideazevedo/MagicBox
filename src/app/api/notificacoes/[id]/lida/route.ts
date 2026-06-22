// Marca uma notificação in-app como lida (somente do próprio usuário).
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { notificacoesService } from "@/core/notificacoes/service";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = errorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const authUser = await getAuthUser(req);
    const id = Number(params.id);
    await notificacoesService.marcarLida(id, authUser.userId);
    return NextResponse.json({ success: true });
  },
);
