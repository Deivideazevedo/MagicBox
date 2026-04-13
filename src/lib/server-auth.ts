import { getServerSession, User } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "./authOptions";
import { extractTokenFromHeader, verifyAccessToken } from "./jwt-utils";
import { UnauthorizedError } from "./errors";
import { NextRequest } from "next/server";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";
import { consoleErrorLogger } from "@/utils/formatterLogs/consoleErrorLogger";

/**
 * Determina o ID do usuário efetivo para uma operação.
 * Admins podem atuar em nome de outros usuários se um requestedId for fornecido.
 * Usuários normais são restritos ao seu próprio ID de autenticação.
 */
function getEffectiveUserId(
  authUser: User,
  requestedId?: number | null
): number {
  const authId = Number(authUser.id);

  if (authUser.role === "admin" && requestedId) {
    return requestedId;
  }

  return authId;
}

/**
 * Autentica a requisição e determina o ID do usuário dono da operação.
 *
 * @param req Requisição opcional
 * @param requestedId ID do usuário solicitado (geralmente vindo de filtros)
 * @throws {UnauthorizedError} Lança erro 401 se autenticação falhar
 * @returns {Promise<User & { userId: number }>} Usuário autenticado com o ID efetivo calculado
 */
export async function getAuthUser(req?: NextRequest, requestedId?: number | null): Promise<User & { userId: number }> {
  // 1. Tenta autenticar via NextAuth Session (browser)
  const session = await getServerSession(authOptions);

  let user: User | null = null;
  let bearerToken: string | null = null;

  if (session?.user?.id) {
    user = session.user;

  } else {
    // 2. Tenta autenticar via Bearer Token (API externa)
    const headersList = headers();
    const authHeader = headersList.get("authorization") || req?.headers.get("authorization") || "";
    bearerToken = extractTokenFromHeader(authHeader);

    if (bearerToken) {
      const payload = await verifyAccessToken(bearerToken);
      if (payload?.user?.id) user = payload.user;
    }
  }

  if (!user) {
    // Se chegou aqui, é um erro crítico - middleware deveria ter bloqueado
    const headersList = headers();
    const requestUrl = headersList.get("x-url") || req?.url || "URL não disponível";
    const requestMethod = headersList.get("x-method") || req?.method || "Método não disponível";

    const formattedLog =
      "\n" +
      "═══════════════════════════════════════════════════════════════════\n" +
      "❌ ERRO CRÍTICO: Autenticação Inválida\n" +
      "═══════════════════════════════════════════════════════════════════\n\n" +
      "⚠️  O middleware NÃO está protegendo esta rota!\n\n" +
      "🔍 Detalhes da Requisição:\n" +
      `   • Hora: ${fnFormatDateInTimeZone()}\n` +
      `   • Método: ${requestMethod}\n` +
      `   • URL: ${requestUrl}\n\n` +
      "🔐 Status de Autenticação:\n" +
      `   • Cookie de sessão: ${session ? "✓ Presente (mas inválido)" : "✗ Ausente"
      }\n` +
      `   • Bearer Token: ${bearerToken
        ? `✓ Presente (${bearerToken.substring(0, 30)}...)`
        : "✗ Ausente"
      }\n\n` +
      "🔧 Solução:\n\n" +
      "   Verifique se o middleware está ativo e configurado corretamente.\n\n" +
      "═══════════════════════════════════════════════════════════════════\n";

    consoleErrorLogger({ formattedLog });
    throw new UnauthorizedError("Autenticação necessária");
  }

  return {
    ...user,
    userId: getEffectiveUserId(user, requestedId),
  };
}
