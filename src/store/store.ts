import { configureStore } from "@reduxjs/toolkit";
import apiReducer from "./slices/apiSlice";
import drsReducer from "./slices/drsSlice";
import referralUsersReducer from "./slices/referralUsersSlice";
import decisionCodeReducer from "./slices/decisionCodeSlice";
import breReducer from "./slices/breSlice";
import masterReducer from "./slices/masterSlice";
import inboxReducer from "./slices/inboxSlice";
import preloginReducer from "./slices/preloginSlice";

export const store = configureStore({
  reducer: {
    api: apiReducer,
    inbox:inboxReducer,
    drs: drsReducer,
    referralUsers: referralUsersReducer,
    decisionCodes: decisionCodeReducer,
    bre:breReducer,
    masterData:masterReducer,
    prelogin:preloginReducer
  },
});

export type RootState = ReturnType<
  typeof store.getState
>;
export type AppDispatch = typeof store.dispatch;