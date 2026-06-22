import type { SearchRequest, SearchResponse } from "../../types/search.types";
import { createApiThunk } from "./createApiThunk";

export const searchThunk = createApiThunk<SearchResponse, SearchRequest>(
  "/mock/inbox/search-application.json",
  {
    url: "/mock/inbox/search-application.json",
    method: "POST",
  },
);
