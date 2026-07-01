import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { GrievanceSubmitRequest, GrievanceSubmitResponse } from "../../types/drs.types";

export const grievanceSubmitThunk = createApiThunk<GrievanceSubmitResponse, GrievanceSubmitRequest>(
  "grievance/submit",
  { url: url("grievanceSubmit"), method: "POST" },
);
