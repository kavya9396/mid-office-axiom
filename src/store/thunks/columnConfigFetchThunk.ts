import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";

export interface ColumnConfigFetchRequest {
  username: string;
  poolKey: string;
}

export interface ColumnConfigFetchResponse {
  selectedFields: string[];
}

const columnConfigFetchUrl = url("columnConfigFetch");

export const columnConfigFetchThunk = createApiThunk<
  ColumnConfigFetchResponse,
  ColumnConfigFetchRequest
>("inbox/columnConfigFetch", {
  method: "GET",

  url: ({
    username,
    poolKey,
  }: ColumnConfigFetchRequest): string => {
    const query = new URLSearchParams({
      username,
      poolKey,
    });

    return `${columnConfigFetchUrl}?${query.toString()}`;
  },
});