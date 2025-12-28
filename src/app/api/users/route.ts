import { authService } from "@/core/auth/service";
import { registerUserSchema } from "@/core/auth/user.dto";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

// GET - Buscar usuário por username/email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const email = searchParams.get("email");

    if (!username && !email) {
      return NextResponse.json(
        { error: "Username ou email é obrigatório" },
        { status: 400 }
      );
    }

    const user = await authService.findByUsernameOrEmail(
      username || undefined,
      email || undefined
    );

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Retorna usuário sem senha
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação com Zod
    const validatedData = registerUserSchema.parse(body);

    // Verifica se usuário já existe
    const existingUser = await authService.findByUsernameOrEmail(
      validatedData.username,
      validatedData.email || undefined
    );

    if (existingUser) {
      return NextResponse.json(
        { error: "Username ou email já está em uso" },
        { status: 409 }
      );
    }

    // Cria usuário
    const newUser = await authService.create({
      username: validatedData.username,
      email: validatedData.email || null,
      password: validatedData.password,
      name: validatedData.name || null,
      image: validatedData.image || null,
      role: "user", // Default role
    });

    const { password, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
