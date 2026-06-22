// Exclui uma notificação in-app (somente do próprio usuário).
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { notificacoesService } from "@/core/notificacoes/service";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = errorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const authUser = await getAuthUser(req);
    const id = Number(params.id);
    await notificacoesService.excluir(id, authUser.userId);
    return NextResponse.json({ success: true });
  },
);
