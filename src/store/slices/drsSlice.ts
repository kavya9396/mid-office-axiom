import { createSlice } from "@reduxjs/toolkit";
import type {
  AdditionalRequirementRow,
  ApplicationOverview,
  AuditTrail,
  BreDecisionResponse,
  MastersData,
  PivvSection,
  RiderDetail,
  SummaryResponse,
} from "../../types/drs.types";
import { drsThunk } from "../thunks/drsThunk";
import { mastersThunk } from "../thunks/mastersThunk";

interface DrsState {
  breDecision: BreDecisionResponse | null;
  summary: SummaryResponse[] | null;
  applicationOverview: ApplicationOverview | null;
  riderDetails: RiderDetail[] | null;
  requirements: AdditionalRequirementRow[] | null;
  auditTrail: AuditTrail | null;
  pivvSection: PivvSection | null;
  masters: MastersData;
  mastersLoading: "idle" | "loading" | "failed";
  mastersError: string | null;
  loading: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: DrsState = {
  breDecision: null,
  applicationOverview: null,
  summary: null,
  riderDetails: null,
  pivvSection: null,
  requirements: [],
  auditTrail: null,
  masters: {},
  mastersLoading: "idle",
  mastersError: null,
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
        state.summary = action.payload.summary;
        state.applicationOverview = action.payload.applicationOverview;
        state.riderDetails = action.payload.riderDetails;
        state.requirements = action.payload.requirements;
        state.auditTrail = action.payload.auditTrail;
        state.pivvSection = action.payload.pivvSection;
      })
      .addCase(drsThunk.rejected, (state, action) => {
        state.loading = "failed";
        state.error =
          (action.payload as string) || action.error.message || null;
      })
      .addCase(mastersThunk.pending, (state) => {
        state.mastersLoading = "loading";
        state.mastersError = null;
      })
      .addCase(mastersThunk.fulfilled, (state, action) => {
        state.mastersLoading = "idle";
        state.mastersError = null;
        state.masters = action.payload.data ?? {};
      })
      .addCase(mastersThunk.rejected, (state, action) => {
        state.mastersLoading = "failed";
        state.mastersError =
          (action.payload as string) || action.error.message || null;
      });
  },
});

export default drsSlice.reducer;
