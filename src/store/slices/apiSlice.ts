import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { loginThunk } from "../thunks/authThunk";
import type { LoginResponse } from "../../types/auth";

interface AppState {
  auth: {
    user: LoginResponse | null;
    credentials: {
      username: string;
      password: string;
      token: string;
      refreshToken: string;
      roles: string[];
    } | null;
    loading: boolean;
    error: string | null;
  };
}

const getStoredCredentials = () => {
  try {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    const storedRoles = localStorage.getItem("roles");

    if (!token || !username) {
      return null;
    }

    return {
      username,
      password: password ?? "",
      token,
      refreshToken: refreshToken ?? "",
      roles: storedRoles ? JSON.parse(storedRoles) : [],
    };
  } catch (error) {
    console.error("Failed to restore credentials", error);
    return null;
  }
};

const initialState: AppState = {
  auth: {
    user: null,
    credentials: getStoredCredentials(),
    loading: false,
    error: null,
  },
};


const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        username: string;
    password: string;
    token: string;
    refreshToken: string;
    roles: string[];
      }>
    ) => {
      state.auth.credentials = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
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

export const { setCredentials } = appSlice.actions;
export default appSlice.reducer;


