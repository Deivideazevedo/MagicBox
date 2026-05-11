import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RelatoriosState {
  sectionsOrder: string[];
  showOverview: boolean;
  showTable: boolean;
}

const initialState: RelatoriosState = {
  sectionsOrder: ['overview', 'table'],
  showOverview: true,
  showTable: true,
};

export const RelatoriosSlice = createSlice({
  name: "relatoriosUi",
  initialState,
  reducers: {
    setSectionsOrder: (state, action: PayloadAction<string[]>) => {
      state.sectionsOrder = action.payload;
    },
    toggleOverview: (state) => {
      state.showOverview = !state.showOverview;
    },
    toggleTable: (state) => {
      state.showTable = !state.showTable;
    },
    setShowOverview: (state, action: PayloadAction<boolean>) => {
      state.showOverview = action.payload;
    },
    setShowTable: (state, action: PayloadAction<boolean>) => {
      state.showTable = action.payload;
    },
  },
});

export const { 
  setSectionsOrder, 
  toggleOverview, 
  toggleTable,
  setShowOverview,
  setShowTable
} = RelatoriosSlice.actions;

export default RelatoriosSlice.reducer;
