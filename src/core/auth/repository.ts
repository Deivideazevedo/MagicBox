// src/core/auth/repository.ts
import { fnApplyFilters } from "@/utils/functions/fnApplyFilters";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { fnReadFile, fnWriteFile } from "@/utils/functions/fnFile";
import { User } from "next-auth";
import { join } from "path";
import { UserModel } from "./model";
import { AuthPayload, UserPayload } from "./types";

const DATA_PATH = join(process.cwd(), "src/data/users.json");

export const authRepository = {
  findAll(filters: Partial<User>) {
    const users = fnReadFile<User>(DATA_PATH);

    if (Object.keys(filters).length === 0) return users;    

    return fnApplyFilters(users, filters);
  },

  findById(id: string): User | null {
    const users = fnReadFile<User>(DATA_PATH);
    const index = users.findIndex((item) => item.id === id);

    return index === -1 ? null : users[index];
  },

  create(user: UserPayload) {
    const users = fnReadFile<User>(DATA_PATH);
    const newUser = new UserModel(user);
    
    users.push(newUser);    
    fnWriteFile<User>(DATA_PATH, users);

    return newUser;
  },

  remove(id: string) {
    let users = fnReadFile<User>(DATA_PATH);
    users = users.filter((c) => c.id !== id);

    fnWriteFile<User>(DATA_PATH, users);
    return true;
  },

  update(id: string, payload: UserPayload) {
    const users = fnReadFile<User>(DATA_PATH);
    const index = users.findIndex((item) => item.id === id);

    const payloadCleaned = fnCleanObject({
      dataForm: payload,
    });


    const updatedUser = {
      ...users[index],
      ...payloadCleaned,
      updatedAt: new Date().toISOString(),
    };

    // substitui o item na posição index com novo objeto na posição encontrada
    users[index] = updatedUser;

    fnWriteFile<User>(DATA_PATH, users);
    return updatedUser;
  },

  findByCredentials(payload: AuthPayload ): User | null {
    if (!payload.password) return null;
    
    const users = fnReadFile<User>(DATA_PATH);
    return users.find(
      (user) =>
        (user.username === payload.username || user.email === payload.email) &&
        user.password === payload.password
    ) || null;
  },

  findByUsernameOrEmail(username?: string, email?: string): User | null {
    const users = fnReadFile<User>(DATA_PATH);
    return users.find(
      (user) =>
        (username && user.username === username) || 
        (email && user.email === email)
    ) || null;
  },
};
