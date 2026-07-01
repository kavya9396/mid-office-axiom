import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { GrievanceRequest, GrievanceResponse } from "../../types/drs.types";

export const grievanceThunk = createApiThunk<GrievanceResponse, GrievanceRequest>(
  "grievance/view",
  { url: url("grievanceView"), method: "POST" },
);
