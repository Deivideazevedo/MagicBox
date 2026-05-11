"use client";
import { useEffect } from "react";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistor, store } from "./store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export function Providers({ children }: { children: any }) {
  useEffect(() => {
    return setupListeners(store.dispatch);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
