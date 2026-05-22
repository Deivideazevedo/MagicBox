'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useModalUrl(paramName: string = 'modal') {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // O modal está aberto se o parâmetro existir na URL
  const isOpen = searchParams ? searchParams.has(paramName) : false;

  // Retorna o valor atual do parâmetro na URL (útil para ler IDs, modos, etc.)
  const value = searchParams ? searchParams.get(paramName) : null;

  const openModal = useCallback((val: string = 'abrir') => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, val);

    // O router.push adiciona um novo item no histórico do navegador
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams, paramName]);

  const closeModal = useCallback(() => {
    if (isOpen) {
      // Se houver histórico de navegação (evita mandar o usuário para fora do app se veio de link direto)
      if (typeof window !== "undefined" && window.history.length > 2) {
        router.back();
      } else {
        // Se foi acesso direto, removemos o parâmetro da URL sem criar nova entrada no histórico
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.delete(paramName);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }
  }, [router, isOpen, searchParams, paramName, pathname]);

  return { isOpen, value, openModal, closeModal };
}

