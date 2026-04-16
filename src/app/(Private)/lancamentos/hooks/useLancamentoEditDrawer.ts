"use client";

import { useState, useCallback } from "react";
import { Despesa } from "@/core/despesas/types";
import { Receita } from "@/core/receitas/types";

type DrawerTipo = "despesa" | "receita";

/**
 * Hook para controlar a abertura do Drawer de Despesa ou Receita
 * a partir da lista de lançamentos (e futuramente do Resumo).
 *
 * Usa estados individuais para evitar problemas de referência de objeto no React.
 *
 * Fluxo:
 *   - Lista de lançamentos: passa lancamento.despesa | lancamento.receita diretamente
 *   - Resumo (projeções): mapear os dados da projeção para o shape de Despesa | Receita
 */
export function useLancamentoEditDrawer() {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<DrawerTipo | null>(null);
  const [item, setItem] = useState<Despesa | Receita | null>(null);

  const abrirParaEdicao = useCallback(
    (novoItem: Despesa | Receita, novoTipo: DrawerTipo) => {
      setItem(novoItem);
      setTipo(novoTipo);
      setOpen(true);
    },
    [],
  );

  const fechar = useCallback(() => {
    setOpen(false);
    // Limpa após a animação de fechamento
    setTimeout(() => {
      setItem(null);
      setTipo(null);
    }, 300);
  }, []);

  return {
    open,
    tipo,
    item,
    abrirParaEdicao,
    fechar,
  };
}
