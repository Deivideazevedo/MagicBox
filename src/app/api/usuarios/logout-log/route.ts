import { authService as servico } from "@/core/users/service";
import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export const POST = errorHandler(registrarLogout);

async function registrarLogout(requisicao: NextRequest): Promise<NextResponse> {
  const authUser = await getAuthUser(requisicao);
  
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const latitude = headersList.get("x-vercel-ip-latitude") || null;
  const longitude = headersList.get("x-vercel-ip-longitude") || null;
  const city = headersList.get("x-vercel-ip-city") || null;
  const country = headersList.get("x-vercel-ip-country") || null;

  // Executa a escrita no banco Neon em segundo plano (sem await)
  // para retornar 200 OK na hora e não travar a experiência de logout do usuário
  servico.registrarLogoutUsuario(authUser.userId, {
    email: authUser.email || "",
    ip,
    latitude,
    longitude,
    city,
    country,
  }).catch((err: Error) => {
    console.error("[AUDIT_ERROR] Falha assíncrona ao persistir log de logout:", err);
  });

  return NextResponse.json({ success: true });
}
