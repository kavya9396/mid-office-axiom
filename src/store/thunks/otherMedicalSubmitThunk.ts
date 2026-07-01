import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { MerSubmitRequest, MerSubmitResponse } from "../../types/drs.types";

export const otherMedicalSubmitThunk = createApiThunk<
  MerSubmitResponse,
  MerSubmitRequest
>("medical/other/submit", { url: url("otherMedicalSubmit"), method: "POST" });
