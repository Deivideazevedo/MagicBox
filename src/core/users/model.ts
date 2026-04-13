import { CoreUser, UserPayload } from "./types";

export class UserModel implements CoreUser {
  id: number;
  email: string;
  name: string | null;
  username: string | null;
  password?: string | null;
  hasPassword?: boolean;
  image: string | null;
  role: string | null;
  status: string;
  origem: string;
  updatedAt: string | Date;
  createdAt: string | Date;
  deletedAt?: string | Date | null;

  constructor(props: UserPayload, id?: number) {
    this.id = id ?? 0;
    this.name = props.name ?? null;
    this.email = props.email;
    this.username = props.username ?? null;
    this.password = props.password ?? null;
    this.hasPassword = !!props.password;
    this.image = props.image ?? null;
    this.role = props.role ?? "usuario";
    this.status = props.status ?? "A";
    this.origem = props.origem ?? "credenciais";

    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }
}

