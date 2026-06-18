import { createSlice } from "@reduxjs/toolkit";
import type { User } from "../../types/drs.types";
import { referralUsersThunk } from "../thunks/referralUsersThunk";

interface UserState {
  users: User[];
  status: "idle" | "loading" | "success" | "failed";
  error: string | null;
}

const initialState: UserState = {
  users: [],
  status: "idle",
  error: null,
};

const referralUsersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsers(state) {
      state.users = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(referralUsersThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(referralUsersThunk.fulfilled, (state, action) => {
        state.status = "idle";
        state.error = null;
        state.users = action.payload.users;
      })
      .addCase(referralUsersThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || action.error.message || null;
      });
  },
});

export default referralUsersSlice.reducer;
