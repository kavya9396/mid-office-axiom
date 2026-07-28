import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type {
  ApplicantProfileSubmitRequest,
  ApplicantProfileSubmitResponse,
} from "../../types/drs.types";

export const applicantProfileSubmitThunk = createApiThunk<
  ApplicantProfileSubmitResponse,
  ApplicantProfileSubmitRequest
>("drs/applicantProfileSubmit", { url: url("applicantProfileSubmit"), method: "PUT" });
