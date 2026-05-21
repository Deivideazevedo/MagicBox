'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useModalUrl(paramName: string = 'modal') {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // O modal está aberto se o parâmetro existir na URL
  const isOpen = searchParams ? searchParams.has(paramName) : false;

  const openModal = useCallback(() => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, 'true');
    
    // O router.push adiciona um novo item no histórico do navegador
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams, paramName]);

  const closeModal = useCallback(() => {
    // Se fechar manualmente, apenas voltamos no histórico (router.back)
    if (isOpen) {
      router.back();
    }
  }, [router, isOpen]);

  return { isOpen, openModal, closeModal };
}
