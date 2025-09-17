import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
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

// Caminhos dos arquivos
const usersFilePath = join(process.cwd(), "src/data/users.json");

// Funções utilitárias
function readUsers(): User[] {
  try {
    const data = readFileSync(usersFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler users.json:", error);
    return [];
  }
}

function writeUsers(users: User[]): void {
  try {
    writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Erro ao escrever users.json:", error);
  }
}

function generateId(): string {
  return Date.now().toString();
}

// GET - Buscar usuário por username/email (usado para autenticação)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const email = searchParams.get("email");

    if (!username && !email) {
      return NextResponse.json({ error: "Username ou email é obrigatório" }, { status: 400 });
    }

    const users = readUsers();
    const user = users.find(u => 
      (username && u.username === username) || 
      (email && u.email === email)
    );

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Retornar sem a senha por segurança
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Criar novo usuário (registro)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, name } = body;

    if (!username || !email || !password || !name) {
      return NextResponse.json(
        { error: "Username, email, password e name são obrigatórios" }, 
        { status: 400 }
      );
    }

    const users = readUsers();

    // Verificar se usuário já existe
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Usuário ou email já existe" }, 
        { status: 409 }
      );
    }

    // Criar novo usuário
    const newUser: User = {
      id: generateId(),
      username,
      email,
      password, // Em produção, hash a senha!
      name,
      role: "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    // Retornar sem a senha
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}