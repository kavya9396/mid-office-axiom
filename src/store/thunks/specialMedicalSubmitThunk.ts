import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { MerSubmitRequest, MerSubmitResponse } from "../../types/drs.types";

export const specialMedicalSubmitThunk = createApiThunk<
  MerSubmitResponse,
  MerSubmitRequest
>("medical/special/submit", { url: url("specialMedicalSubmit"), method: "POST" });
