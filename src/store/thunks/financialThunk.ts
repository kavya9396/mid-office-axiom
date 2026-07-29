import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { FinancialResponse, FinancialViewRequest } from "../../types/drs.types";

export const financialThunk = createApiThunk<FinancialResponse, FinancialViewRequest>(
  "financial/view",
  { url: url("financialView"), method: "POST" },
);
