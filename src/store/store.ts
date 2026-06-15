import { configureStore } from "@reduxjs/toolkit";
import apiReducer from "./slices/apiSlice";
import drsReducer from "./slices/drsSlice";

export const store = configureStore({
  reducer: {
    api: apiReducer,
    drs: drsReducer
  },
});

export type RootState = ReturnType<
  typeof store.getState
>;
export type AppDispatch = typeof store.dispatch;