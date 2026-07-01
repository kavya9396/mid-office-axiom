import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { MastersRequest, MastersResponse } from "../../types/drs.types";

export const mastersThunk = createApiThunk<MastersResponse, MastersRequest>(
  "drs/masters",
  { url: url("masters"), method: "POST" },
);
