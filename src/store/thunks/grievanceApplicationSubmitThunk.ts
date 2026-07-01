import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type {
  GrievanceApplicationSubmitRequest,
  GrievanceApplicationSubmitResponse,
} from "../../types/drs.types";

export const grievanceApplicationSubmitThunk = createApiThunk<
  GrievanceApplicationSubmitResponse,
  GrievanceApplicationSubmitRequest
>("grievance/application/submit", { url: url("grievanceApplicationSubmit"), method: "POST" });
