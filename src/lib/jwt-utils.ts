import { JWTPayload, SignJWT, jwtVerify } from "jose";
/**
 * Gera um JWT token customizado para o usuário
 * Este token pode ser usado por sistemas externos
 */
export async function generateAccessToken(userId: string) {
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d") // Token expira em 30 dias
    .setSubject(userId)
    .sign(secret);

  return token;
}

/**
 * Verifica e decodifica um JWT token
 * Usado para validar tokens de sistemas externos
 */
export async function verifyAccessToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
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
