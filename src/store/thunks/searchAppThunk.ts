import { url } from "../../services/apiConfig";
import type {
  SearchRequest,
  SearchApiResponse,
} from "../../types/search.types";
import { createApiThunk } from "./createApiThunk";

export const searchThunk = createApiThunk<
  SearchApiResponse,
  SearchRequest
>("inbox/searchApplication", {
  url: url("searchApplication"),
  method: "POST",
});