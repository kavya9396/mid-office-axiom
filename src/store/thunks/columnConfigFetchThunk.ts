import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";

export interface ColumnConfigFetchRequest {
  username: string;
  poolKey: string;
}

export interface ColumnConfigFetchResponse {
  selectedFields: string[];
}

export const columnConfigFetchThunk =
  createApiThunk<
    ColumnConfigFetchResponse,
    ColumnConfigFetchRequest
  >("inbox/columnConfigFetch", {
    url: url("columnConfigFetch"),
    method: "GET",

    buildUrl: (
      baseUrl,
      { username, poolKey },
    ) => {
      const query = new URLSearchParams({
        username,
        poolKey,
      });

      return `${baseUrl}?${query.toString()}`;
    },
  });