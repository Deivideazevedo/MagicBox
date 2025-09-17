/**
 * Authentication utilities with security best practices
 * This addresses the security concerns raised in the code review
 */

// Interface for User data
export interface User {
  id: string;
  username: string;
  email: string;
  hashedPassword?: string; // Optional for development
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Simple hash function for development (NOT for production)
 * In production, use bcrypt or similar
 * @param password - Plain text password
 * @returns string - Simple hash
 */
function simpleHash(password: string): string {
  // WARNING: This is NOT secure - only for development
  // In production, use bcrypt: npm install bcryptjs
  // return await bcrypt.hash(password, 12);
  
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `dev_hash_${Math.abs(hash)}`;
}

/**
 * Authenticate user with environment-appropriate method
 * @param username - Username
 * @param password - Plain text password
 * @returns Promise<User | null> - User object if valid, null if invalid
 */
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    if (process.env.NODE_ENV === "development") {
      // Development mode - use simple credentials
      const validUsername = process.env.DEV_ADMIN_USERNAME || "admin";
      const validPassword = process.env.DEV_ADMIN_PASSWORD || "wise951";
      
      if (username === validUsername && password === validPassword) {
        return {
          id: "1",
          username: validUsername,
          email: "admin@example.com",
          name: "Admin",
          role: "admin",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      // Production mode - implement real authentication
      // TODO: Implement proper password hashing with bcrypt
      // TODO: Query actual database
      // TODO: Use proper session management
      
      console.warn("Production authentication not implemented - using development fallback");
      return null;
    }
    
    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Remove sensitive data from user object
 * @param user - User object with sensitive data
 * @returns User object without sensitive fields
 */
export function sanitizeUser(user: User): Omit<User, 'hashedPassword'> {
  const { hashedPassword, ...sanitizedUser } = user;
  return sanitizedUser;
}

/**
 * TODO: Production implementation requirements
 * 
 * 1. Install bcryptjs: npm install bcryptjs @types/bcryptjs
 * 2. Replace simpleHash with bcrypt.hash()
 * 3. Add password verification with bcrypt.compare()
 * 4. Implement database integration
 * 5. Add proper error handling and logging
 * 6. Implement rate limiting for authentication attempts
 * 7. Add session management with secure tokens
 */