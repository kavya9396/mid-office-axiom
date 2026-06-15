import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../services/api";

export function createApiThunk<TResponse, TBody = unknown>(
  typePrefix: string
) {
  return createAsyncThunk<
    TResponse,
    TBody,
    { rejectValue: string }
  >(typePrefix, async (payload, { rejectWithValue }) => {
    try {
      return await apiRequest<TResponse, TBody>({
        url: typePrefix,
        method: "POST",
        body: payload,
      });
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    }
  });
}