import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/core/users/service";
import { bulkDeleteSchema } from "@/core/users/user.dto";

export async function DELETE(request: NextRequest) {
  const body = await request.json();

  const validatedData = bulkDeleteSchema.parse(body);

  await authService.bulkExcluir(validatedData.ids);

  return NextResponse.json(
    { message: "Usuários removidos com sucesso" },
    { status: 200 }
  );

}
