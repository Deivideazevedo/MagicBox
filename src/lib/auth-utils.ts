import { readFileSync } from "fs";
import { join } from "path";

// Interface para User
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Caminho do arquivo de usuários
const usersFilePath = join(process.cwd(), "src/data/users.json");

// Função para ler usuários
function readUsers(): User[] {
  try {
    const data = readFileSync(usersFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler users.json:", error);
    return [];
  }
}

// Função para autenticação (verificar credenciais)
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const users = readUsers();
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return null;
  }
}

// Função para buscar usuário por username ou email
export async function findUserByUsernameOrEmail(username?: string, email?: string): Promise<User | null> {
  try {
    const users = readUsers();
    const user = users.find(u => 
      (username && u.username === username) || 
      (email && u.email === email)
    );
    return user || null;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
}