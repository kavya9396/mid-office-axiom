import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { ReferToITRequest, ReferToITResponse } from "../../types/drs.types";

export const referToItThunk = createApiThunk<ReferToITResponse, ReferToITRequest>(
  "drs/referToIt",
  { url: url("referToIt"), method: "POST" },
);
