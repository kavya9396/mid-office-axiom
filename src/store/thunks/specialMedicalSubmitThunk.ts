import { createApiThunk } from "./createApiThunk";
import { apiEndpoints } from "../../services/endpoints";
import type { MerSubmitRequest, MerSubmitResponse } from "../../types/drs.types";

export const specialMedicalSubmitThunk = createApiThunk<
  MerSubmitResponse,
  MerSubmitRequest
>("medical/special/submit", {
  url: apiEndpoints.specialMedicalSubmit,
  method: "POST",
  fallbackUrl: "/mock/drs/specialMedicalSubmit.mock.json",
});
