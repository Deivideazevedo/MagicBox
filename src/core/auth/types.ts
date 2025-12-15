export interface UserPayload {
  email: string | null;
  username: string;
  password: string;
  name: string | null;
  image?: string | null;
  role?: string;
}

export interface AuthPayload {
  email: string | null;
  username: string;
  password: string;
}
