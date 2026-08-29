import { url } from "../../services/apiConfig";
import type {
  SearchApiResponse,
  SearchRequest,
} from "../../types/search.types";
import { createApiThunk } from "./createApiThunk";

type BusinessAwareSearchRequest = SearchRequest & {
  businessType: string;
};

export const searchThunk = createApiThunk<
  SearchApiResponse,
  BusinessAwareSearchRequest
>("inbox/searchApplication", {
  url: (request) => url("searchApplication", request.businessType),
  method: "POST",
});