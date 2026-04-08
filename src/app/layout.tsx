import React from "react";
import { Providers } from "@/store/providers";
import MyApp from "./app";
// 🎯 Importa configuração global do Zod (servidor + cliente)
import "@/lib/zod-config";

export const metadata = {
  title: "MagicBox",
  description: "Sistema de Gestão Financeira",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <Providers>
          <MyApp session={undefined}>{children}</MyApp>
        </Providers>
      </body>
    </html>
  );
}
