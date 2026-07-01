import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { DRSRequest, FinancialResponse } from "../../types/drs.types";

export const financialThunk = createApiThunk<FinancialResponse, DRSRequest>(
  "financial/view",
  { url: url("financialView"), method: "POST" },
);
