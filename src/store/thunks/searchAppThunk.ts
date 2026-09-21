import { url } from "../../services/apiConfig";
import type {
  SearchApiResponse,
  SearchRequest,
} from "../../types/search.types";
import { addGroupLob, createApiThunk } from "./createApiThunk";

type BusinessAwareSearchRequest = SearchRequest & {
  businessType: string;
  lob?: "G";
};

export const searchThunk = createApiThunk<
  SearchApiResponse,
  BusinessAwareSearchRequest
>("inbox/searchApplication", {
  url: (request) => url("searchApplication", request.businessType),
  method: "POST",
  // The shared endpoint requires lob only for Group searches.
  transformBody: (request) => {
    const payload = addGroupLob(request);
    // Temporary validation log: remove after the Group payload is confirmed.
    console.log("[Search application request payload]", payload);
    return payload;
  },
});
