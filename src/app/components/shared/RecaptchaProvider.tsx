'use client';

import { useSession } from 'next-auth/react';
import { Fragment, ReactNode } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

interface RecaptchaProviderProps {
  children: ReactNode;
}

export default function RecaptchaProvider({
  children,
}: RecaptchaProviderProps) {
  const { status, data: session } = useSession();
  const isAuthenticated = status === 'authenticated';

  // Cria uma key única baseada no estado de autenticação
  // Quando o usuário faz logout ou login, o componente remonta para limpar o token anterior
  const remountKey = isAuthenticated
    ? `auth-${session?.user?.id || 'unknown'}`
    : 'guest';

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY não configurado no .env.local');
    return <>{children}</>;
  }

  return (
    <Fragment key={remountKey}>
      <GoogleReCaptchaProvider
        reCaptchaKey={siteKey}
        scriptProps={{
          async: true,
          defer: true,
          appendTo: 'head',
        }}
      >
        {children}
      </GoogleReCaptchaProvider>
    </Fragment>
  );
}
