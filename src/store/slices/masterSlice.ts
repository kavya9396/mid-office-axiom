import { createSlice } from "@reduxjs/toolkit";

import type { MastersResponse } from "../../types/drs.types";
import { mastersThunk } from "../thunks/mastersThunk";

interface MasterState {
  data: MastersResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: MasterState = {
  data: null,
  loading: false,
  error: null,
};

const masterSlice = createSlice({
  name: "masterData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(mastersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mastersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // A requirement_mst lookup returns only that requested master.
        // Merge it so previously loaded decision masters stay available.
        state.data = {
          ...(state.data ?? {}),
          ...action.payload,
        } as MastersResponse;
      })
      .addCase(mastersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Unable to load master data";
      });
  },
});

export default masterSlice.reducer;
