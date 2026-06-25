import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest, type ApiRequest } from "../../services/api";

type ThunkConfig = {
  rejectValue: string;
};

export function createApiThunk<TResponse, TBody = unknown>(
  typePrefix: string,
  requestConfig: Omit<ApiRequest<TBody>, "body"> & { fallbackUrl?: string }
) {
  return createAsyncThunk<
    TResponse,
    TBody,
    ThunkConfig
  >(typePrefix, async (payload, { rejectWithValue }) => {
    const { fallbackUrl, ...apiConfig } = requestConfig;

    try {
      const isBodyAllowed = apiConfig.method !== "GET" && apiConfig.method !== "DELETE";
      return await apiRequest<TResponse, TBody>({
        ...apiConfig,
        body: isBodyAllowed ? payload : undefined,
      });
    } catch (error: unknown) {
      if (fallbackUrl) {
        try {
          const isBodyAllowed = apiConfig.method !== "GET" && apiConfig.method !== "DELETE";
          return await apiRequest<TResponse, TBody>({
            ...apiConfig,
            url: fallbackUrl,
            body: isBodyAllowed ? payload : undefined,
          });
        } catch (fallbackError: unknown) {
          return rejectWithValue(
            fallbackError instanceof Error ? fallbackError.message : "Something went wrong"
          );
        }
      }

      return rejectWithValue(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  });
}