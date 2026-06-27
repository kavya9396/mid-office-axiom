import { createApiThunk } from "./createApiThunk";
import { apiEndpoints } from "../../services/endpoints";
import type { GrievanceRequest, GrievanceResponse } from "../../types/drs.types";

export const grievanceThunk = createApiThunk<GrievanceResponse, GrievanceRequest>(
  "grievance/view",
  {
    url: apiEndpoints.grievanceView,
    method: "POST",
    fallbackUrl: "/mock/drs/grievance.mock.json",
  },
);
