export interface User {
  id: number;
  username: string;
  email: string | null;
  password?: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPayload {
  email: string | null;
  username: string;
  password: string;
  name: string | null;
  image?: string | null;
  role?: string;
}

export interface AuthPayload {
  email?: string;
  username?: string;
  password: string;
}
