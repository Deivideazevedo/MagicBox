"use client";

import { useSession } from "next-auth/react";
import { Fragment, ReactNode } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

interface RecaptchaProviderProps {
  children: ReactNode;
}

export default function RecaptchaProvider({
  children,
}: RecaptchaProviderProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  // Evita montar/desmontar o reCAPTCHA enquanto a sessão está carregando (evita bugs de F5)
  if (status === "loading" || isAuthenticated) {
    return <Fragment>{children}</Fragment>;
  }

  // Limpa aspas simples/duplas e espaços extras da variável do .env.local/env
  const rawKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const siteKey = rawKey.trim().replace(/['"]/g, "") || "6Ldf478UAAAAAN247olh7rU2v1Pn1D4K3V3z258y";

  return (
    <Fragment key="guest">
      <GoogleReCaptchaProvider
        reCaptchaKey={siteKey}
        scriptProps={{
          async: true,
          defer: true,
          appendTo: "head",
        }}
      >
        {children}
      </GoogleReCaptchaProvider>
    </Fragment>
  );
}
