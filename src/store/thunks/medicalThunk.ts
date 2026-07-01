import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { DRSRequest, MedicalResponse } from "../../types/drs.types";

export const medicalThunk = createApiThunk<MedicalResponse, DRSRequest>(
  "medical/view",
  { url: url("medicalView"), method: "POST" },
);
