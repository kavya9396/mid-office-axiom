import { createApiThunk } from "./createApiThunk";
import { apiEndpoints } from "../../services/endpoints";
import type {
  GrievanceApplicationRequest,
  GrievanceApplicationResponse,
} from "../../types/drs.types";

export const grievanceApplicationThunk = createApiThunk<
  GrievanceApplicationResponse,
  GrievanceApplicationRequest
>("grievance/application/view", {
  url: apiEndpoints.grievanceApplicationView,
  method: "POST",
  fallbackUrl: "/mock/drs/grievanceApplication.mock.json",
});
