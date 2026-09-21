import { addGroupLob, createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type {
  ApplicantProfileSubmitRequest,
  ApplicantProfileSubmitResponse,
} from "../../types/drs.types";

type BusinessAwareApplicantProfileSubmitRequest = ApplicantProfileSubmitRequest & {
  businessType: string;
  lob?: "G";
};

export const applicantProfileSubmitThunk = createApiThunk<
  ApplicantProfileSubmitResponse,
  BusinessAwareApplicantProfileSubmitRequest
>("drs/applicantProfileSubmit", {
  url: (request) => url("applicantProfileSubmit", request.businessType),
  method: "PUT",
  // The shared endpoint requires lob only for Group applicant profile updates.
  transformBody: (request) => {
    const payload = addGroupLob(request);
    // Temporary validation log: remove after the Group payload is confirmed.
    console.log("[Applicant profile request payload]", payload);
    return payload;
  },
});
