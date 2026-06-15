// store/slices/apiSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import { commonApiThunk } from "../thunks/apiThunk";

interface ApiState {
  loading: boolean;
  data: unknown;
  error: string | null;
}

const initialState: ApiState = {
  loading: false,
  data: null,
  error: null,
};

const apiSlice = createSlice({
  name: "api",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(commonApiThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(commonApiThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(commonApiThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default apiSlice.reducer;