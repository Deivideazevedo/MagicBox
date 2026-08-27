import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LancamentoResposta } from "@/core/lancamentos/types";
import { ResumoResposta } from "@/core/lancamentos/resumo/types";

export interface LancamentoPagamentoDados {
  origem: "despesa" | "receita" | "meta" | "ajuste";
  origemId?: number;
  valorPrevisto?: number;
  nome?: string;
  data?: string;
}

export type LancamentoDadosDrawer = LancamentoPagamentoDados | LancamentoResposta | ResumoResposta;

interface LancamentoState {
  modo: "novo" | "editar" | "pagar";
  dadosIniciais: LancamentoDadosDrawer | null;
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
        dados?: LancamentoDadosDrawer;
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
