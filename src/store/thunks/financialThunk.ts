import { createApiThunk } from "./createApiThunk";
import { apiEndpoints } from "../../services/endpoints";
import type { DRSRequest, FinancialResponse } from "../../types/drs.types";

export const financialThunk = createApiThunk<FinancialResponse, DRSRequest>(
  "financial/view",
  {
    url: apiEndpoints.financialView,
    method: "POST",
    fallbackUrl: "/mock/drs/financial.mock.json",
  },
);
