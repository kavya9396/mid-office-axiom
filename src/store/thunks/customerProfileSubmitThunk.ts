import { addGroupLob, createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type {
  CustomerProfileSubmitRequest,
  CustomerProfileSubmitResponse,
} from "../../types/drs.types";

type BusinessAwareCustomerProfileSubmitRequest = CustomerProfileSubmitRequest & {
  businessType: string;
  lob?: "G";
};

export const customerProfileSubmitThunk = createApiThunk<
  CustomerProfileSubmitResponse,
  BusinessAwareCustomerProfileSubmitRequest
>("drs/customerProfileSubmit", {
  url: (request) => url("customerProfileSubmit", request.businessType),
  method: "POST",
  // The shared endpoint requires lob only for Group customer profile updates.
  transformBody: (request) => {
    const payload = addGroupLob(request);
    // Temporary validation log: remove after the Group payload is confirmed.
    console.log("[Customer profile request payload]", payload);
    return payload;
  },
});
