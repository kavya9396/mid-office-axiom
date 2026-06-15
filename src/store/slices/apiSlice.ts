import { createSlice } from "@reduxjs/toolkit";
import { loginThunk } from "../thunks/authThunk";
import type { LoginResponse } from "../../types/auth";

interface AppState {
  auth: {
    user: LoginResponse  | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: AppState = {
  auth: {
    user: null,
    loading: false,
    error: null,
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginThunk.pending, (state) => {
        state.auth.loading = true;
        state.auth.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.auth.loading = false;
        state.auth.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.auth.loading = false;
        state.auth.error =
          (action.payload as string) ?? "Login failed";
      });
  },
});

export default appSlice.reducer;