import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LancamentoResposta } from "@/core/lancamentos/types";

interface LancamentoState {
  estaAberto: boolean;
  modo: "novo" | "editar" | "pagar";
  dadosIniciais: any;
}

const initialState: LancamentoState = {
  estaAberto: false,
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
        dados?: any;
      }>
    ) => {
      state.estaAberto = true;
      state.modo = action.payload.modo;
      state.dadosIniciais = action.payload.dados || null;
    },
    fecharDrawer: (state) => {
      state.estaAberto = false;
      state.modo = "novo";
      state.dadosIniciais = null;
    },
  },
});

export const { abrirDrawer, fecharDrawer } = LancamentoSlice.actions;

export default LancamentoSlice.reducer;
