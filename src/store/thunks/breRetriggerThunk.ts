import { url } from "../../services/apiConfig";
import type {
  BreRetriggerRequest,
  BreRetriggerResponse,
} from "../../types/drs.types";
import { createApiThunk } from "./createApiThunk";

type BusinessAwareBreRetriggerRequest = BreRetriggerRequest & {
  businessType: string;
};

export const breRetriggerThunk = createApiThunk<
  BreRetriggerResponse,
  BusinessAwareBreRetriggerRequest
>("drs/breRetrigger", {
  url: (request) => url("breRetrigger", request.businessType),
  method: "POST",
});
