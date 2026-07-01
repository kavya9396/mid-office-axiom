import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { DRSRequest, PreviousPoliciesResponse } from "../../types/drs.types";

export const previousPoliciesThunk = createApiThunk<PreviousPoliciesResponse, DRSRequest>(
  "previousPolicies/view",
  { url: url("previousPoliciesView"), method: "POST" },
);
