import { createSlice } from "@reduxjs/toolkit";
import { decisionCodeThunk } from "../thunks/decisionCodeThunk";
import type { DecisionCode } from "../../types/drs.types";

interface DecisionCodeState {
  decisionCodes: DecisionCode[];
  status: "idle" | "loading" | "success" | "failed";
  error: string | null;
}

const initialState: DecisionCodeState = {
  decisionCodes: [],
  status: "idle",
  error: null,
};

const decisionCodeSlice = createSlice({
  name: "decisionCodes",
  initialState,
  reducers: {
    clearDecisionCodes(state) {
      state.decisionCodes = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(decisionCodeThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(decisionCodeThunk.fulfilled, (state, action) => {
        state.status = "idle";
        state.error = null;
        state.decisionCodes = action.payload.decisionCodes;
      })
      .addCase(decisionCodeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || action.error.message || null;
      });
  },
});

export const { clearDecisionCodes } = decisionCodeSlice.actions;
export default decisionCodeSlice.reducer;