import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  apiRequest,
  type ApiRequest,
} from "../../services/api";

type ThunkConfig = {
  rejectValue: string;
};

type DynamicRequestConfig<TPayload> = Omit<
  ApiRequest<TPayload>,
  "body" | "url"
> & {
  url: string | ((payload: TPayload) => string);
  fallbackUrl?: string;
};

export function createApiThunk<TResponse, TPayload = unknown>(
  typePrefix: string,
  requestConfig: DynamicRequestConfig<TPayload>,
) {
  return createAsyncThunk<
    TResponse,
    TPayload,
    ThunkConfig
  >(
    typePrefix,
    async (payload, { rejectWithValue }) => {
      try {
        const {
          url: configuredUrl,
          ...remainingConfig
        } = requestConfig;

        const requestUrl =
          typeof configuredUrl === "function"
            ? configuredUrl(payload)
            : configuredUrl;

        return await apiRequest<TResponse, TPayload>({
          ...remainingConfig,
          url: requestUrl,
          body: payload,
        });
      } catch (error) {
        return rejectWithValue(
          error instanceof Error
            ? error.message
            : "Something went wrong.",
        );
      }
    },
  );
}