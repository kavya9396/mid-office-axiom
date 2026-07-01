import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { MerSubmitRequest, MerSubmitResponse } from "../../types/drs.types";

export const merSubmitThunk = createApiThunk<
  MerSubmitResponse,
  MerSubmitRequest
>("medical/mer/submit", { url: url("merSubmit"), method: "POST" });
