import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { chatService } from "@/core/chat/service";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export const POST = errorHandler(enviarMensagem);

async function enviarMensagem(requisicao: NextRequest): Promise<NextResponse> {
  const { id: authId } = await getAuthUser();
  const { messages } = await requisicao.json();

  const result = await chatService.executarChat({
    messages,
    userId: Number(authId),
  });

  return result.toUIMessageStreamResponse() as unknown as NextResponse;
}
