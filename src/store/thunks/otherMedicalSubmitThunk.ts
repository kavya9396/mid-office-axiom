import { createApiThunk } from "./createApiThunk";
import { apiEndpoints } from "../../services/endpoints";
import type { MerSubmitRequest, MerSubmitResponse } from "../../types/drs.types";

export const otherMedicalSubmitThunk = createApiThunk<
  MerSubmitResponse,
  MerSubmitRequest
>("medical/other/submit", {
  url: apiEndpoints.otherMedicalSubmit,
  method: "POST",
  fallbackUrl: "/mock/drs/otherMedicalSubmit.mock.json",
});
