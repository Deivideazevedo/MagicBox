export interface CoreUser {
  id: number;
  username: string | null;
  email: string;
  password?: string | null;
  hasPassword?: boolean; // ✅ Indica se a conta permite login via credenciais
  name: string | null;
  image: string | null;
  role: string | null;
  status: string; // "A" ou "I"
  origem: string; // "credenciais", "google", "github", etc.
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
}

export interface UserPayload {
  email: string;
  username?: string | null;
  password?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
  status?: string;
  origem?: string;
}

export interface AuthPayload {
  email?: string;
  username?: string;
  password: string;
}


