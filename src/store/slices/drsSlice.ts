import { createSlice } from "@reduxjs/toolkit";
import type {
  DRSData,
  DRSBreOutput,
  DRSExternalAPIs,
  MastersData,
} from "../../types/drs.types";
import { drsThunk } from "../thunks/drsThunk";
import { mastersThunk } from "../thunks/mastersThunk";

interface DrsState {
  data: DRSData | null;
  masters: MastersData;
  mastersLoading: "idle" | "loading" | "failed";
  mastersError: string | null;
  loading: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: DrsState = {
  data: null,
  masters: {},
  mastersLoading: "idle",
  mastersError: null,
  loading: "idle",
  error: null,
};

const drsSlice = createSlice({
  name: "drs",
  initialState,
  reducers: {
    setBreOutput: (state, action: { payload: DRSBreOutput }) => {
      if (!state.data) return;

      state.data.externalAPIs = {
        ...state.data.externalAPIs,
        breOutput: action.payload,
      };
    },
    setBreExternalApiOutputs: (
      state,
      action: {
        payload: Partial<
          Pick<
            DRSExternalAPIs,
            "breOutput" | "initialBreOutput" | "breRetriggerStatus" | "medicalBreOutput" | "financialBreOutput"
          >
        >;
      },
    ) => {
      if (!state.data) return;

      const { breOutput, initialBreOutput, breRetriggerStatus, medicalBreOutput, financialBreOutput } =
        action.payload;

      state.data.externalAPIs = {
        ...state.data.externalAPIs,
        ...(breOutput ? { breOutput } : {}),
        ...(initialBreOutput ? { initialBreOutput } : {}),
        ...(breRetriggerStatus ? { breRetriggerStatus } : {}),
        ...(medicalBreOutput ? { medicalBreOutput } : {}),
        ...(financialBreOutput ? { financialBreOutput } : {}),
      };
    },
    setProductFaceValue: (state, action: { payload: string }) => {
      if (!state.data) return;

      const nextFaceValue = action.payload;
      const dataRecord = state.data as unknown as Record<string, unknown>;
      const appOverview = dataRecord.applicationOverview as Record<string, unknown> | undefined;
      const appOverviewProducts = Array.isArray(appOverview?.productDetail)
        ? (appOverview!.productDetail as Array<Record<string, unknown>>)
        : [];

      if (appOverviewProducts.length > 0) {
        appOverviewProducts[0] = {
          ...appOverviewProducts[0],
          faceValue: nextFaceValue,
        };
      }

      if (Array.isArray(state.data.productDetail) && state.data.productDetail.length > 0) {
        state.data.productDetail[0] = {
          ...state.data.productDetail[0],
          faceValue: nextFaceValue,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(drsThunk.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(drsThunk.fulfilled, (state, action) => {
        const responseData = action.payload.data;
        state.loading = "idle";
        state.error = null;
        state.data = responseData;
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

export const { setBreOutput, setBreExternalApiOutputs, setProductFaceValue } = drsSlice.actions;
export default drsSlice.reducer;
