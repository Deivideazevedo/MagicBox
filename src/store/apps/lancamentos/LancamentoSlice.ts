import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LancamentoResposta } from "@/core/lancamentos/types";

export interface LancamentoPagamentoDados {
  origem: "despesa" | "receita" | "meta";
  origemId: number;
  valorPrevisto: number;
  nome: string;
  [key: string]: any; // Permite flexibilidade de campos adicionais da entidade de origem
}

interface LancamentoState {
  modo: "novo" | "editar" | "pagar";
  dadosIniciais: LancamentoPagamentoDados | LancamentoResposta | null;
}

const initialState: LancamentoState = {
  modo: "novo",
  dadosIniciais: null,
};

export const LancamentoSlice = createSlice({
  name: "lancamentoUi",
  initialState,
  reducers: {
    abrirDrawer: (
      state,
      action: PayloadAction<{
        modo: "novo" | "editar" | "pagar";
        dados?: LancamentoPagamentoDados | LancamentoResposta;
      }>
    ) => {
      state.modo = action.payload.modo;
      state.dadosIniciais = action.payload.dados || null;
    },
    fecharDrawer: (state) => {
      state.modo = "novo";
      state.dadosIniciais = null;
    },
  },
});

export const { abrirDrawer, fecharDrawer } = LancamentoSlice.actions;

export default LancamentoSlice.reducer;
