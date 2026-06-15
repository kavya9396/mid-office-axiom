import { createSlice } from "@reduxjs/toolkit";
import type {
    AdditionalRequirementRow,
  ApplicationOverview,
  BreDecisionResponse,
  RiderDetail,
} from "../../types/drs.types";
import { drsThunk } from "../thunks/drsThunk";

interface DrsState {
  breDecision: BreDecisionResponse | null;
  applicationOverview: ApplicationOverview | null;
  riderDetails: RiderDetail[] | null;
  requirements: AdditionalRequirementRow[] | null;
  loading: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: DrsState = {
  breDecision: null,
  applicationOverview: null,
  riderDetails: null,
  requirements: [],
  loading: "idle",
  error: null,
};

const drsSlice = createSlice({
  name: "drs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(drsThunk.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(drsThunk.fulfilled, (state, action) => {
        state.loading = "idle";
        state.error = null;
        state.breDecision = action.payload.breDecision;
        state.applicationOverview = action.payload.applicationOverview;
        state.riderDetails = action.payload.riderDetails;
        state.requirements = action.payload.requirements;
      })
      .addCase(drsThunk.rejected, (state, action) => {
        state.loading = "failed";
        state.error =
          (action.payload as string) || action.error.message || null;
      });
  },
});

export default drsSlice.reducer;
