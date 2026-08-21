import { createSlice } from "@reduxjs/toolkit";

import { searchThunk } from "../thunks/searchAppThunk";
import type { SearchApiResponse } from "../../types/search.types";

interface SearchApplicationState {
  response: SearchApiResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: SearchApplicationState = {
  response: null,
  loading: false,
  error: null,
};

const searchAppSlice = createSlice({
  name: "searchApplication",
  initialState,
  reducers: {
    clearSearchApplication: (state) => {
      state.response = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
        state.error = null;
      })
      .addCase(searchThunk.rejected, (state, action) => {
        state.loading = false;
        state.response = null;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to search application.";
      });
  },
});

export const { clearSearchApplication } =
  searchAppSlice.actions;

export default searchAppSlice.reducer;