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

  // Dispara a cadência escalonada de dívidas (canais por estágio × preferências do usuário).
  // A regra está em src/core/disparos/cadencia.ts (única fonte de verdade, editável).
  const resumo = await disparosService.dispararCadenciaDividas("CRON");

  return NextResponse.json({ success: true, resumo });
}
