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
  grievanceNumber: string;
  grievanceRemarks: string;
  grievanceDetails: string;
  grievanceCreatedBy: string;
  grievanceResolvedBy: string;
  grievanceStatus: string;
  applicationNumber: string;
};

export type RaiseGrievanceResponse = {
  success: boolean;
  message?: string;
};

export const raiseGrievanceThunk = createApiThunk<
  RaiseGrievanceResponse,
  RaiseGrievanceRequest
>("grievance/raise", {
  url: url("raiseGrievance"),
  method: "POST",
});
