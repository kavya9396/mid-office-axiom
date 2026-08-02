import type { MasterResponse } from '../../types/drs.types';
import { masterThunk } from './../thunks/masterThunk';
import { createSlice } from "@reduxjs/toolkit";

// types/drs.types.ts

export interface MiscMaster {
  code: string;
  description: string;
  value: string;
  isActive: string;
  miscMastId: string;
}

interface MasterState {
  data: MasterResponse | null;
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
      .addCase(masterThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(masterThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // or action.payload.data depending on API
      })
      .addCase(masterThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

export default masterSlice.reducer;
