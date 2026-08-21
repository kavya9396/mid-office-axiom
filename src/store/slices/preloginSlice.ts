import { createSlice } from "@reduxjs/toolkit";

import type {
  PreLoginData,
} from "../../types/prelogin.type";

import { preloginThunk } from "../thunks/preloginThunk";

interface PreLoginState {
  data: PreLoginData | null;
  loading:
    | "idle"
    | "loading"
    | "succeeded"
    | "failed";
  error: string | null;
}

const initialState: PreLoginState = {
  data: null,
  loading: "idle",
  error: null,
};

const preloginSlice = createSlice({
  name: "prelogin",

  initialState,

  reducers: {
    clearPreLoginData: (state) => {
      state.data = null;
      state.loading = "idle";
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(preloginThunk.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })

      .addCase(
        preloginThunk.fulfilled,
        (state, action) => {
          state.loading = "succeeded";
          state.error = null;

          /*
           * action.payload is PreLoginResponse:
           * {
           *   success: boolean;
           *   data: PreLoginData;
           * }
           */
          state.data = action.payload.data;
        },
      )

      .addCase(
        preloginThunk.rejected,
        (state, action) => {
          state.loading = "failed";
          state.data = null;

          state.error =
            (action.payload as string) ??
            action.error.message ??
            "Unable to fetch pre-login details.";
        },
      );
  },
});

export const { clearPreLoginData } =
  preloginSlice.actions;

export default preloginSlice.reducer;