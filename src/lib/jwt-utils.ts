import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { User } from "next-auth";

/**
 * Gera um JWT assinado (JWS) customizado para o usuário
 * 
 * ✅ Mais seguro para APIs externas (assinado, não apenas criptografado)
 * ✅ Padrão da indústria (RFC 7519)
 * ✅ Pode ser validado por qualquer biblioteca JWT
 * ✅ Menor overhead que JWE
 * 
 * Este token pode ser usado por sistemas externos para autenticação
 */
export async function generateAccessToken(user: Omit<User, 'password'>) {
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7 dias

  const token = await new SignJWT({
    user,  // Dados completos do usuário (sem senha)
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(String(user.id))   // Subject: ID do usuário (convertido para string no JWT)
    .setIssuedAt(iat)              // Emitido em
    .setExpirationTime(exp)        // Expira em 7 dias
    .setIssuer("magicbox-api")     // Emissor
    .setAudience("magicbox-client") // Audiência
    .sign(secret);

  return token;
}

/**
 * Verifica e decodifica um JWT assinado (JWS)
 * 
 * ✅ Valida assinatura (garante integridade)
 * ✅ Valida expiração automaticamente
 * ✅ Valida issuer e audience
 * 
 * Usado para validar tokens de sistemas externos
 * Retorna todos os dados do usuário incluídos no token
 */
export async function verifyAccessToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    
    const { payload } = await jwtVerify(token, secret, {
      issuer: "magicbox-api",
      audience: "magicbox-client",
    });
    
    return payload;
  } catch (error) {
    console.error("Token inválido:", error);
    return null;
  }
}

/**
 * Extrai o token do header Authorization
 * Suporta formato: "Bearer TOKEN"
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}
