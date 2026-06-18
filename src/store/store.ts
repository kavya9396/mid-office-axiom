import { configureStore } from "@reduxjs/toolkit";
import apiReducer from "./slices/apiSlice";
import drsReducer from "./slices/drsSlice";
import referralUsersReducer from "./slices/referralUsersSlice";
import decisionCodeReducer from "./slices/decisionCodeSlice";

export const store = configureStore({
  reducer: {
    api: apiReducer,
    drs: drsReducer,
    referralUsers: referralUsersReducer,
    decisionCodes: decisionCodeReducer,
  },
});

export type RootState = ReturnType<
  typeof store.getState
>;
export type AppDispatch = typeof store.dispatch;