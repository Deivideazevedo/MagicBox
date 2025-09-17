import { NextRequest, NextResponse } from "next/server";

// Example of environment-based mock vs real API implementation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (process.env.NODE_ENV === "development") {
      // Simulated API call in development
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Dados enviados (mock):", body);
      
      return NextResponse.json({
        success: true,
        message: "Ação realizada com sucesso (modo desenvolvimento)",
        data: body
      });
    } else {
      // TODO: Implement real API call in production
      // Example:
      // const response = await fetch(process.env.API_ENDPOINT + "/quick-action", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(body),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error("API request failed");
      // }
      // 
      // const data = await response.json();
      // return NextResponse.json(data);
      
      return NextResponse.json({
        success: false,
        message: "API de produção não implementada ainda"
      }, { status: 501 });
    }
  } catch (error) {
    console.error("Erro na API quick-action:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}