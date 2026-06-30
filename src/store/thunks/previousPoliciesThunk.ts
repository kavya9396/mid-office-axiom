import { createApiThunk } from "./createApiThunk";
import { apiEndpoints } from "../../services/endpoints";
import type { DRSRequest, PreviousPoliciesResponse } from "../../types/drs.types";

export const previousPoliciesThunk = createApiThunk<PreviousPoliciesResponse, DRSRequest>(
  "previousPolicies/view",
  {
    url: apiEndpoints.previousPoliciesView,
    method: "POST",
    fallbackUrl: "/mock/drs/previousPolicies.mock.json",
  },
);
