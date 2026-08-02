import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { MasterRequest, MasterResponse } from "../../types/drs.types";

export const masterThunk = createApiThunk<MasterResponse, MasterRequest>(
  "drs/masters",
  { url: url("masters"), method: "POST" },
);
