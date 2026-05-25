import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import {
  persistReducer,
  persistStore,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import CustomizerReducer from "./customizer/CustomizerSlice";
import LancamentoUiReducer from "./apps/lancamentos/LancamentoSlice";
import RelatorioUiReducer from "./apps/relatorios/RelatoriosSlice";
import { api } from "../services/api";

/**
 * Remove requisições em estado 'pending' (loading) antes da persistência para evitar 
 * que o RTK Query inicie reidratado em um estado de carregamento infinito.
 */
const apiTransform = createTransform(
  // Inbound: Filtra e remove queries/mutations inacabadas antes de gravar no Storage
  (inboundState: any, key) => {
    if (key === api.reducerPath) {
      return {
        ...inboundState,
        queries: Object.fromEntries(
          Object.entries(inboundState.queries).filter(
            ([_, value]: [string, any]) => value?.status !== 'pending'
          )
        ),
        mutations: Object.fromEntries(
          Object.entries(inboundState.mutations).filter(
            ([_, value]: [string, any]) => value?.status !== 'pending'
          )
        ),
      };
    }
    return inboundState;
  },
  // Outbound: Recupera o estado filtrado sem alterações adicionais
  (outboundState) => outboundState,
  // Aplica esta lógica exclusivamente ao reducer da API
  { whitelist: [api.reducerPath] }
);

const persistConfig = {
  key: "root",
  storage,
  transforms: [apiTransform],
};

const rootReducer = combineReducers({
  customizer: CustomizerReducer,
  lancamentoUi: LancamentoUiReducer,
  relatorioUi: RelatorioUiReducer,
  [api.reducerPath]: api.reducer,
});

// Aplica persist global com sessionStorage
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      immutableCheck: false,
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

// 1. Tipagem baseada no rootReducer (contém todos os slices)
export type RootState = ReturnType<typeof rootReducer>;

// 2. Tipagem do Dispatch vinda da store configurada
export type AppDispatch = typeof store.dispatch;

// 3. Opcional: Se precisar do estado incluindo os campos do persist (_persist)
export type AppState = ReturnType<typeof store.getState>;
