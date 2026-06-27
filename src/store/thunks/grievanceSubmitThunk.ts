import { createApiThunk } from "./createApiThunk";
import { apiEndpoints } from "../../services/endpoints";
import type { GrievanceSubmitRequest, GrievanceSubmitResponse } from "../../types/drs.types";

export const grievanceSubmitThunk = createApiThunk<GrievanceSubmitResponse, GrievanceSubmitRequest>(
  "grievance/submit",
  {
    url: apiEndpoints.grievanceSubmit,
    method: "POST",
    fallbackUrl: "/mock/drs/grievanceSubmit.mock.json",
  },
);
