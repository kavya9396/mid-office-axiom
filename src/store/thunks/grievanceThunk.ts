import { url } from "../../services/apiConfig";
import { createApiThunk } from "./createApiThunk";

export type RaiseGrievanceRow = {
  requirementId: string | number;
  memberType: string;
  fupCode: string;
  memberName: string;
  remarksByUser: string;
  remarksByTpa: string;
};

export type RaiseGrievanceRequest = {
  applicationNumber: string;
  userId: string;
  roleType: string;
  taskId: string;
  instanceId: string;
  grievanceDetails: RaiseGrievanceRow[];
};

export type RaiseGrievanceResponse = { success: boolean; message?: string };

export const raiseGrievanceThunk = createApiThunk<RaiseGrievanceResponse, RaiseGrievanceRequest>(
  "grievance/raise",
  { url: url("raiseGrievance"), method: "POST" },
);
