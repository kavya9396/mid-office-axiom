import { createApiThunk } from "./createApiThunk";
import type { DRSRequest, MedicalResponse } from "../../types/drs.types";

export const medicalThunk = createApiThunk<MedicalResponse, DRSRequest>(
  "/mock/drs/medical.mock.json",
  {
    url: "/mock/drs/medical.mock.json",
    method: "POST",
  },
);
