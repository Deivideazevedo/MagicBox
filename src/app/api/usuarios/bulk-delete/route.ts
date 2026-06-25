import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/core/users/service";
import { bulkDeleteSchema } from "@/core/users/user.dto";
import { getAuthUser } from "@/lib/server-auth";

export async function DELETE(request: NextRequest) {
  const authUser = await getAuthUser(request);
  const body = await request.json();

  const validatedData = bulkDeleteSchema.parse(body);

  await authService.bulkExcluir(validatedData.ids, { role: authUser.role! });

  return NextResponse.json(
    { message: "Usuários removidos com sucesso" },
    { status: 200 }
  );
}
