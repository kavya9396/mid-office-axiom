import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  apiRequest,
  type ApiRequest,
} from "../../services/api";

type ThunkConfig = {
  rejectValue: string;
};

type BusinessAwarePayload = {
  businessType: string;
  lob?: "G";
};

// Shared-endpoint APIs use lob to distinguish Group requests from Retail requests.
export const addGroupLob = <TPayload extends BusinessAwarePayload>(
  payload: TPayload,
): TPayload => (
  payload.businessType.trim().toLowerCase() === "group"
    ? { ...payload, lob: "G" as const }
    : payload
);

type DynamicRequestConfig<TPayload> = Omit<
  ApiRequest<TPayload>,
  "body" | "url"
> & {
  url: string | ((payload: TPayload) => string);
  fallbackUrl?: string;
  // Lets a specific API adjust its outgoing body without changing other thunks.
  transformBody?: (payload: TPayload) => TPayload;
};

export function createApiThunk<
  TResponse,
  TPayload = unknown,
>(
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
          transformBody,
          ...remainingConfig
        } = requestConfig;

        const requestUrl =
          typeof configuredUrl === "function"
            ? configuredUrl(payload)
            : configuredUrl;

        return await apiRequest<TResponse, TPayload>({
          ...remainingConfig,
          url: requestUrl,
          body:
            remainingConfig.method === "GET"
              ? undefined
              : transformBody
                ? transformBody(payload)
                : payload,
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
