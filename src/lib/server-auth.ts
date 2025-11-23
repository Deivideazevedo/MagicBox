import { getServerSession, User } from "next-auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { authOptions } from "./authOptions";
import { extractTokenFromHeader, verifyAccessToken } from "./jwt-utils";

/**
 * Autentica a requisição usando:
 * 1. Cookie de sessão (NextAuth) - para requisições do browser
 * 2. Bearer Token (JWT customizado) - para requisições externas
 *
 * ⚠️ IMPORTANTE: Esta função só deve ser chamada em rotas protegidas pelo middleware
 * O middleware garante que apenas usuários autenticados chegam aqui.
 * Se esta função não encontrar um usuário, é um erro de configuração do sistema.
 *
 * @throws {NextResponse} Retorna 401 Unauthorized se autenticação falhar
 * @returns {Promise<User>} Usuário autenticado (nunca null em rotas protegidas)
 */
export async function getAuthUser(): Promise<User> {
  // 1. Tenta autenticar via NextAuth Session (browser)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user;

  // 2. Tenta autenticar via Bearer Token (API externa)
  const headersList = headers();
  const authHeader = headersList.get("authorization");
  const bearerToken = extractTokenFromHeader(authHeader);

  if (bearerToken) {
    const payload = await verifyAccessToken(bearerToken);
    if (payload?.user?.id) return payload.user;
  }

  // Se chegou aqui, é um erro de configuração do middleware
  const requestUrl = headersList.get("x-url") || headersList.get("referer") || "URL desconhecida";
  const method = headersList.get("x-method") || "Método desconhecido";
  const hasAuthHeader = authHeader ? "Sim (inválido)" : "Não";
  const hasSession = session ? "Sim (inválido)" : "Não";
  const bearerTokenPreview = bearerToken ? `${bearerToken.substring(0, 20)}...` : "N/A";

  // Log detalhado no servidor
  console.error(
    `ERRO DE CONFIGURAÇÃO: getAuthUser() não encontrou autenticação válida.\n` +
    `╔════════════════════════════════════════════════════════════════╗\n` +
    `║ Detalhes da Requisição:                                        ║\n` +
    `║ • URL: ${requestUrl.padEnd(54)} ║\n` +
    `║ • Método: ${method.padEnd(51)} ║\n` +
    `║ • Cookie de sessão: ${hasSession.padEnd(39)} ║\n` +
    `║ • Header Authorization: ${hasAuthHeader.padEnd(35)} ║\n` +
    `║ • Token (preview): ${bearerTokenPreview.padEnd(40)} ║\n` +
    `╠════════════════════════════════════════════════════════════════╣\n` +
    `║ Possíveis causas:                                              ║\n` +
    `║ 1. Rota não está protegida pelo middleware                     ║\n` +
    `║ 2. Token expirado ou inválido                                  ║\n` +
    `║ 3. Sessão NextAuth corrompida                                  ║\n` +
    `║ 4. Middleware authenticate() falhou silenciosamente            ║\n` +
    `║ 5. Estrutura do payload JWT incorreta (veja logs acima)        ║\n` +
    `╚════════════════════════════════════════════════════════════════╝`
  );

  throw new Error("Falha crítica de autenticação");
}
