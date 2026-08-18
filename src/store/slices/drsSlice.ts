import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  DRSData,
  DRSBreOutput,
  DRSExternalAPIs,
  MastersData,
} from "../../types/drs.types";

import { drsThunk } from "../thunks/drsThunk";
import { mastersThunk } from "../thunks/mastersThunk";

import {
  getSessionMasters,
  normalizeMastersData,
} from "../../utils/masterDataSession";

interface DrsState {
  data: DRSData | null;
  masters: MastersData;
  mastersLoading: "idle" | "loading" | "failed";
  mastersError: string | null;
  loading: "idle" | "loading" | "failed";
  error: string | null;
}

type BreExternalApiOutputs = Partial<
  Pick<
    DRSExternalAPIs,
    | "breOutput"
    | "initialBreOutput"
    | "breRetriggerStatus"
    | "medicalBreOutput"
    | "financialBreOutput"
  >
>;

const initialState: DrsState = {
  data: null,
  masters: getSessionMasters() ?? {},
  mastersLoading: "idle",
  mastersError: null,
  loading: "idle",
  error: null,
};

const drsSlice = createSlice({
  name: "drs",

  initialState,

  reducers: {
    setDrsData: (
      state,
      action: PayloadAction<DRSData>,
    ) => {
      state.data = action.payload;
      state.loading = "idle";
      state.error = null;
    },

    setBreOutput: (
      state,
      action: PayloadAction<DRSBreOutput>,
    ) => {
      const externalAPIs =
        state.data?.externalAPIs;

      if (!externalAPIs) {
        return;
      }

      externalAPIs.breOutput = action.payload;
    },

    setBreExternalApiOutputs: (
      state,
      action: PayloadAction<BreExternalApiOutputs>,
    ) => {
      const externalAPIs =
        state.data?.externalAPIs;

      if (!externalAPIs) {
        return;
      }

      const {
        breOutput,
        initialBreOutput,
        breRetriggerStatus,
        medicalBreOutput,
        financialBreOutput,
      } = action.payload;

      if (breOutput !== undefined) {
        externalAPIs.breOutput = breOutput;
      }

      if (initialBreOutput !== undefined) {
        externalAPIs.initialBreOutput =
          initialBreOutput;
      }

      if (breRetriggerStatus !== undefined) {
        externalAPIs.breRetriggerStatus =
          breRetriggerStatus;
      }

      if (medicalBreOutput !== undefined) {
        externalAPIs.medicalBreOutput =
          medicalBreOutput;
      }

      if (financialBreOutput !== undefined) {
        externalAPIs.financialBreOutput =
          financialBreOutput;
      }
    },

    setProductFaceValue: (
      state,
      action: PayloadAction<string>,
    ) => {
      if (!state.data) {
        return;
      }

      const nextFaceValue = action.payload;

      const dataRecord =
        state.data as unknown as Record<
          string,
          unknown
        >;

      const applicationOverview =
        dataRecord.applicationOverview as
          | Record<string, unknown>
          | undefined;

      const applicationOverviewProducts =
        Array.isArray(
          applicationOverview?.productDetail,
        )
          ? (applicationOverview.productDetail as Array<
              Record<string, unknown>
            >)
          : [];

      if (applicationOverviewProducts.length > 0) {
        applicationOverviewProducts[0] = {
          ...applicationOverviewProducts[0],
          faceValue: nextFaceValue,
        };
      }

      if (
        Array.isArray(state.data.productDetail) &&
        state.data.productDetail.length > 0
      ) {
        state.data.productDetail[0] = {
          ...state.data.productDetail[0],
          faceValue: nextFaceValue,
        };
      }
    },

    setMastersData: (
      state,
      action: PayloadAction<MastersData>,
    ) => {
      state.masters = normalizeMastersData(
        action.payload,
      );
      state.mastersLoading = "idle";
      state.mastersError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(drsThunk.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })

      .addCase(
        drsThunk.fulfilled,
        (state, action) => {
          state.loading = "idle";
          state.error = null;
          state.data = action.payload.data;
        },
      )

      .addCase(
        drsThunk.rejected,
        (state, action) => {
          state.loading = "failed";
          state.error =
            (action.payload as string) ??
            action.error.message ??
            null;
        },
      )

      .addCase(mastersThunk.pending, (state) => {
        state.mastersLoading = "loading";
        state.mastersError = null;
      })

      .addCase(
        mastersThunk.fulfilled,
        (state, action) => {
          state.mastersLoading = "idle";
          state.mastersError = null;

          state.masters = normalizeMastersData(
            action.payload.data ?? {},
          );
        },
      )

      .addCase(
        mastersThunk.rejected,
        (state, action) => {
          state.mastersLoading = "failed";

          state.mastersError =
            (action.payload as string) ??
            action.error.message ??
            null;
        },
      );
  },
});

export const {
  setDrsData,
  setBreOutput,
  setBreExternalApiOutputs,
  setProductFaceValue,
  setMastersData,
} = drsSlice.actions;

export default drsSlice.reducer;