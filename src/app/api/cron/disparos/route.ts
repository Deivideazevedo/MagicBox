// src/app/api/cron/disparos/route.ts
// Cron diário de lembretes de dívidas. Invocado pela Vercel Cron (GET) e protegido
// pelo header Authorization: Bearer ${CRON_SECRET} que a Vercel injeta automaticamente.
import { disparosService } from "@/core/disparos/service";
import { NextRequest, NextResponse } from "next/server";

// Fluid Compute (Hobby) permite até 300s — tempo de sobra para o envio em lotes.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Disparo e retenção são independentes (a limpeza só apaga lotes com +1 mês; o
  // disparo só cria novos), então rodam EM PARALELO para reduzir o tempo total e o
  // risco de timeout. A cadência está em src/core/disparos/cadencia.ts (fonte de
  // verdade). limparLogsAntigos trata o próprio erro, então nunca rejeita o Promise.all.
  const [resumo, limpeza] = await Promise.all([
    disparosService.dispararCadenciaDividas("CRON"),
    disparosService.limparLogsAntigos(1),
  ]);

  return NextResponse.json({ success: true, resumo, limpeza });
}
