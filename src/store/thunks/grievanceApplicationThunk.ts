import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type {
  GrievanceApplicationRequest,
  GrievanceApplicationResponse,
} from "../../types/drs.types";

export const grievanceApplicationThunk = createApiThunk<
  GrievanceApplicationResponse,
  GrievanceApplicationRequest
>("grievance/application/view", { url: url("grievanceApplicationView"), method: "POST" });
