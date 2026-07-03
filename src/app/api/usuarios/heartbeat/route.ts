import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Rota obsoleta. Use /api/usuarios/atividade para heartbeat." },
    { status: 410 }
  );
}
