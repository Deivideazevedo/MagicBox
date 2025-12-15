import { randomUUID } from "crypto";
import { User } from "next-auth";
import { UserPayload } from "./types";

export class UserModel implements User {
  id: string;
  email: string | null;
  name: string | null;
  username: string;
  password: string;
  image?: string | null;
  role?: string | null;
  updatedAt?: string;
  createdAt?: string;


  constructor(props: UserPayload, id?: string) {
    this.id = id ?? randomUUID();
    this.name = props.name;
    this.email = props.email;
    this.username = props.username;
    this.password = props.password;
    this.image = props.image ?? null;
    this.role = props.role ?? null;


    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
  }
}
