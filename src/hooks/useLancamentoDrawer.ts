"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  abrirDrawer as reduxAbrirDrawer,
  fecharDrawer as reduxFecharDrawer,
  LancamentoPagamentoDados,
} from "@/store/apps/lancamentos/LancamentoSlice";
import { LancamentoResposta } from "@/core/lancamentos/types";
import { useModalUrl } from "./useModalUrl";

export function useLancamentoDrawer() {
  const dispatch = useDispatch();
  const { isOpen, openModal, closeModal } = useModalUrl("lancamento");

  const { modo, dadosIniciais } = useSelector(
    (state: AppState) => state.lancamentoUi,
  );

  const abrirDrawer = useCallback(
    (modo: "novo" | "editar" | "pagar", dados?: LancamentoPagamentoDados | LancamentoResposta) => {
      // 1. Salva os dados na Store do Redux
      dispatch(reduxAbrirDrawer({ modo, dados }));
      // 2. Sincroniza a URL abrindo o Drawer
      openModal();
    },
    [dispatch, openModal]
  );

  const fecharDrawer = useCallback(() => {
    // Apenas fecha o modal na URL (o Drawer irá escutar a URL e disparar a limpeza do Redux automaticamente)
    closeModal();
  }, [closeModal]);

  return {
    isOpen,
    modo,
    dadosIniciais,
    abrirDrawer,
    fecharDrawer,
  };
}
