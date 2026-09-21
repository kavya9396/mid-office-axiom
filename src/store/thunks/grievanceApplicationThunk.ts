import { addGroupLob, createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type {
  GrievanceApplicationRequest,
  GrievanceApplicationResponse,
} from "../../types/drs.types";

type BusinessAwareGrievanceApplicationRequest = GrievanceApplicationRequest & {
  businessType: string;
  lob?: "G";
};

export const grievanceApplicationThunk = createApiThunk<
  GrievanceApplicationResponse,
  BusinessAwareGrievanceApplicationRequest
>("grievance/application/view", {
  url: (request) => url("grievanceApplicationView", request.businessType),
  method: "POST",
  // The shared endpoint requires lob only for Group grievance application views.
  transformBody: (request) => {
    const payload = addGroupLob(request);
    // Temporary validation log: remove after the Group payload is confirmed.
    console.log("[Grievance application request payload]", payload);
    return payload;
  },
});
