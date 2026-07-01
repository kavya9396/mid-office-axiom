import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { DRSResponse, DRSViewRequest } from "../../types/drs.types";

export const drsThunk = createApiThunk<DRSResponse, DRSViewRequest>(
  "drs/view",
  { url: url("drs"), method: "POST" },
);
