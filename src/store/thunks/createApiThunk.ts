import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest, type ApiRequest } from "../../services/api";

type ThunkConfig<TResponse> = {
  rejectValue: string;
};

export function createApiThunk<TResponse, TBody = unknown>(
  typePrefix: string,
  requestConfig: Omit<ApiRequest<TBody>, "body">
) {
  return createAsyncThunk<
    TResponse,
    TBody,
    ThunkConfig<TResponse>
  >(typePrefix, async (payload, { rejectWithValue }) => {
    try {
       const isBodyAllowed = requestConfig.method !== "GET" && requestConfig.method !== "DELETE";
      return await apiRequest<TResponse, TBody>({
        ...requestConfig,
        body: isBodyAllowed ? payload : undefined,
      });
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
}