import { createApiThunk } from "./createApiThunk";
import type {
  DecisionCodeRequest,
  DecisionCodeResponse,
} from "../../types/drs.types";

export const decisionCodeThunk = createApiThunk<
  DecisionCodeResponse,
  DecisionCodeRequest
>(
  "/mock/drs/decisionCodes.json",
  {
    url: "/mock/drs/decisionCodes.json",
    method: "POST",
  }
);