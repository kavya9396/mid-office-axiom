import { url } from "../../services/apiConfig";
import type { DRSResponse } from "../../types/drs.types";
import type { SearchRequest } from "../../types/search.types";
import { createApiThunk } from "./createApiThunk";

export const searchThunk = createApiThunk<DRSResponse, SearchRequest>(
  "inbox/searchApplication",
  { url: url("searchApplication"), method: "POST" },
);
