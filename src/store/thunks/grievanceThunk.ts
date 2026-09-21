import { url } from "../../services/apiConfig";

import { addGroupLob, createApiThunk } from "./createApiThunk";

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
  businessType: string;
  lob?: "G";
};

export type RaiseGrievanceResponse = {
  success: boolean;
  message?: string;
};

export const raiseGrievanceThunk = createApiThunk<
  RaiseGrievanceResponse,
  RaiseGrievanceRequest
>("grievance/raise", {
  url: (request) => url("raiseGrievance", request.businessType),
  method: "POST",
  // The shared endpoint requires lob only for Group grievances.
  transformBody: (request) => {
    const payload = addGroupLob(request);
    // Temporary validation log: remove after the Group payload is confirmed.
    console.log("[Raise grievance request payload]", payload);
    return payload;
  },
});
