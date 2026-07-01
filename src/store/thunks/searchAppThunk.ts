import { url } from "../../services/apiConfig";
import type { SearchRequest, SearchResponse } from "../../types/search.types";
import { createApiThunk } from "./createApiThunk";

export const searchThunk = createApiThunk<SearchResponse, SearchRequest>(
  "inbox/searchApplication",
  { url: url("searchApplication"), method: "POST" },
);
