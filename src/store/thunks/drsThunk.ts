import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { DRSRequest, DRSResponse } from "../../types/drs.types";

export const drsThunk = createApiThunk<DRSResponse, DRSRequest>(
  "drs/view",
  { url: url("drs"), method: "POST" },
);
