import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { BreRequest, BreResponse } from "../../types/drs.types";

export const breThunk = createApiThunk<BreResponse, BreRequest>(
  "drs/bre",
  { url: url("bre"), method: "POST" },
);
