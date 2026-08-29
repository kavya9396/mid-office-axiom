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

        const existingResponse = state.data;
        const incomingResponse = action.payload;

        /*
         * Login returns the complete master response:
         * {
         *   data: {
         *     misc: [...],
         *     reason: [...],
         *     gender: [...],
         *     requirement_mst: {...}
         *   }
         * }
         *
         * Requirement lookup returns a partial response:
         * {
         *   data: {
         *     requirement_mst: {...}
         *   }
         * }
         *
         * Merge the nested data object so requirement_mst is updated
         * without removing misc, reason and other login-time masters.
         */
        state.data = {
          ...(existingResponse ?? {}),
          ...incomingResponse,
          data: {
            ...(existingResponse?.data ?? {}),
            ...(incomingResponse.data ?? {}),
          },
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