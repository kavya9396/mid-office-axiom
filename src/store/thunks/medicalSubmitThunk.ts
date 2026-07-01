import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { MedicalSubmitRequest, MedicalSubmitResponse } from "../../types/drs.types";

export const medicalSubmitThunk = createApiThunk<
  MedicalSubmitResponse,
  MedicalSubmitRequest
>("medical/submit", { url: url("medicalSubmit"), method: "POST" });
