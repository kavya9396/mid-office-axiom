import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { RiskDetailsRequest, RiskDetailsResponse } from "../../types/drs.types";

export const riskDetailsThunk = createApiThunk<RiskDetailsResponse, RiskDetailsRequest>(
  "drs/riskDetails",
  { url: url("riskDetails"), method: "POST" },
);
