import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";

import type {
  SpecialMedicalSaveRequest,
  SpecialMedicalSaveResponse,
} from "../../modules/DRS/Medical Final/Special Medical/specialMedical.types";

export const saveSpecialMedicalThunk = createApiThunk<
  SpecialMedicalSaveResponse,
  SpecialMedicalSaveRequest
>("medical/saveSpecialMedical", {
  url: url("medicalSaveAndCalculate"),
  method: "POST",
});