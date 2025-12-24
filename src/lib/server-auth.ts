import { getServerSession, User } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "./authOptions";
import { extractTokenFromHeader, verifyAccessToken } from "./jwt-utils";
import { UnauthorizedError } from "./errors";
import { NextRequest } from "next/server";
import { consoleErrorLog } from "./error-handler";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";

/**
 * Autentica a requisição usando:
 * 1. Cookie de sessão (NextAuth) - para requisições do browser
 * 2. Bearer Token (JWT customizado) - para requisições externas
 *
 * ⚠️ IMPORTANTE: Esta função só deve ser chamada em rotas protegidas pelo middleware
 * O middleware garante que apenas usuários autenticados chegam aqui.
 * Se esta função não encontrar um usuário, é um erro de configuração do sistema.
 *
 * @throws {UnauthorizedError} Lança erro 401 se autenticação falhar
 * @returns {Promise<User>} Usuário autenticado (nunca null em rotas protegidas)
 */
export async function getAuthUser(req?: NextRequest): Promise<User> {
  // 1. Tenta autenticar via NextAuth Session (browser)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user;

  // 2. Tenta autenticar via Bearer Token (API externa)
  const headersList = headers();

  const authHeader =
    headersList.get("authorization") || req?.headers.get("authorization") || "";

  const bearerToken = extractTokenFromHeader(authHeader);

  if (bearerToken) {
    const payload = await verifyAccessToken(bearerToken);
    if (payload?.user?.id) return payload.user;
  }

  // Se chegou aqui, é um erro crítico - middleware deveria ter bloqueado
  const requestUrl = headersList.get("x-url") || req?.url || "URL não disponível";
  const requestMethod =
    headersList.get("x-method") || req?.method || "Método não disponível";

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
    `   • Cookie de sessão: ${
      session ? "✓ Presente (mas inválido)" : "✗ Ausente"
    }\n` +
    `   • Bearer Token: ${
      bearerToken
        ? `✓ Presente (${bearerToken.substring(0, 30)}...)`
        : "✗ Ausente"
    }\n\n` +
    "🔧 Solução:\n\n" +
    "   Verifique se o middleware está ativo e configurado corretamente.\n\n" +
    "═══════════════════════════════════════════════════════════════════\n";

  consoleErrorLog({ formattedLog });
  throw new UnauthorizedError("Autenticação necessária");
}
