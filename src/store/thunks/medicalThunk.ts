import { createApiThunk } from "./createApiThunk";
import { apiEndpoints } from "../../services/endpoints";
import type { DRSRequest, MedicalResponse } from "../../types/drs.types";

export const medicalThunk = createApiThunk<MedicalResponse, DRSRequest>(
  "medical/view",
  {
    url: apiEndpoints.medicalView,
    method: "POST",
    fallbackUrl: "/mock/drs/medical.mock.json",
  },
);
