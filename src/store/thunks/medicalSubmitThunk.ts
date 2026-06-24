import { createApiThunk } from "./createApiThunk";
import type { MedicalSubmitRequest, MedicalSubmitResponse } from "../../types/drs.types";

export const medicalSubmitThunk = createApiThunk<
  MedicalSubmitResponse,
  MedicalSubmitRequest
>("/mock/drs/medicalSubmit.mock.json", {
  url: "/mock/drs/medicalSubmit.mock.json",
  method: "POST",
});
