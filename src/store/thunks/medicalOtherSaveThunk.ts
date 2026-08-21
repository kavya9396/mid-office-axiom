import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type {
  OtherMedicalSaveRequest,
  OtherMedicalSaveResponse,
} from "../../modules/DRS/Medical Final/Other Medicals/otherMedicals.types";

export const saveOtherMedicalThunk = createApiThunk<
  OtherMedicalSaveResponse,
  OtherMedicalSaveRequest
>("medical/saveOtherMedical", {
  url: url("medicalSaveAndCalculate"),
  method: "POST",
});