import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  apiRequest,
  type ApiRequest,
} from "../../services/api";

type ThunkConfig = {
  rejectValue: string;
};

type ApiThunkRequestConfig<TBody> = Omit<
  ApiRequest<TBody>,
  "body"
> & {
  fallbackUrl?: string;
  buildUrl?: (
    baseUrl: string,
    payload: TBody,
  ) => string;
};

export function createApiThunk<
  TResponse,
  TBody = unknown,
>(
  typePrefix: string,
  requestConfig: ApiThunkRequestConfig<TBody>,
) {
  return createAsyncThunk<
    TResponse,
    TBody,
    ThunkConfig
  >(
    typePrefix,
    async (payload, { rejectWithValue }) => {
      const {
        fallbackUrl,
        buildUrl,
        ...apiConfig
      } = requestConfig;

      const isBodyAllowed =
        apiConfig.method !== "GET" &&
        apiConfig.method !== "DELETE";

      const requestUrl = buildUrl
        ? buildUrl(apiConfig.url, payload)
        : apiConfig.url;

      try {
        return await apiRequest<TResponse, TBody>({
          ...apiConfig,
          url: requestUrl,
          body: isBodyAllowed
            ? payload
            : undefined,
        });
      } catch (error: unknown) {
        if (fallbackUrl) {
          try {
            const resolvedFallbackUrl = buildUrl
              ? buildUrl(fallbackUrl, payload)
              : fallbackUrl;

            return await apiRequest<
              TResponse,
              TBody
            >({
              ...apiConfig,
              url: resolvedFallbackUrl,
              body: isBodyAllowed
                ? payload
                : undefined,
            });
          } catch (fallbackError: unknown) {
            return rejectWithValue(
              fallbackError instanceof Error
                ? fallbackError.message
                : "Something went wrong",
            );
          }
        }

        return rejectWithValue(
          error instanceof Error
            ? error.message
            : "Something went wrong",
        );
      }
    },
  );
}