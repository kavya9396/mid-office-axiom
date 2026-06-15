// store/thunks/apiThunk.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest, type ApiRequest } from "../../services/api";

export const commonApiThunk = createAsyncThunk(
  "api/commonApi",
  async (payload: ApiRequest, { rejectWithValue }) => {
    try {
      const data = await apiRequest(payload);
      return data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    }
  }
);