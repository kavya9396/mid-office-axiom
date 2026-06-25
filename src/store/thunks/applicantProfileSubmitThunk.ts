import { createApiThunk } from "./createApiThunk";
import type {
  ApplicantProfileSubmitRequest,
  ApplicantProfileSubmitResponse,
} from "../../types/drs.types";

export const applicantProfileSubmitThunk = createApiThunk<
  ApplicantProfileSubmitResponse,
  ApplicantProfileSubmitRequest
>("/mock/drs/applicantProfileSubmit.mock.json", {
  url: "/mock/drs/applicantProfileSubmit.mock.json",
  method: "POST",
});
