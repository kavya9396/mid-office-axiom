import { createApiThunk } from "./createApiThunk";
import { apiEndpoints } from "../../services/endpoints";
import type {
  GrievanceApplicationSubmitRequest,
  GrievanceApplicationSubmitResponse,
} from "../../types/drs.types";

export const grievanceApplicationSubmitThunk = createApiThunk<
  GrievanceApplicationSubmitResponse,
  GrievanceApplicationSubmitRequest
>("grievance/application/submit", {
  url: apiEndpoints.grievanceApplicationSubmit,
  method: "POST",
  fallbackUrl: "/mock/drs/grievanceApplicationSubmit.mock.json",
});
