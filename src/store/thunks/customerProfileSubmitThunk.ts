import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type {
  CustomerProfileSubmitRequest,
  CustomerProfileSubmitResponse,
} from "../../types/drs.types";

export const customerProfileSubmitThunk = createApiThunk<
  CustomerProfileSubmitResponse,
  CustomerProfileSubmitRequest
>("drs/customerProfileSubmit", { url: url("customerProfileSubmit"), method: "POST" });
