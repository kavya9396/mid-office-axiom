import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type {
  DecisionCodeRequest,
  DecisionCodeResponse,
} from "../../types/drs.types";

export const decisionCodeThunk = createApiThunk<
  DecisionCodeResponse,
  DecisionCodeRequest
>(
  "drs/decisionCodes",
  { url: url("decisionCodes"), method: "POST" },
);