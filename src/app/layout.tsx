import React from "react";
import { Providers } from "@/store/providers";
import MyApp from "./app";
// 🎯 Importa configuração global do Zod (servidor + cliente)
import "@/lib/zod-config";

export const metadata = {
  title: "Modernize Demo",
  description: "Modernize kit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <MyApp session={undefined}>{children}</MyApp>
        </Providers>
      </body>
    </html>
  );
}
