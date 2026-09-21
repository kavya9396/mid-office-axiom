import { url } from "../../services/apiConfig";
import type {
  BreRetriggerRequest,
  BreRetriggerResponse,
} from "../../types/drs.types";
import { createApiThunk } from "./createApiThunk";

type BusinessAwareBreRetriggerRequest = BreRetriggerRequest & {
  businessType: string;
  lob?: "G";
};

const addGroupLob = (
  request: BusinessAwareBreRetriggerRequest,
): BusinessAwareBreRetriggerRequest => {
  // The shared BRE retrigger endpoint uses lob instead of a separate Group URL.
  const payload = request.businessType.trim().toLowerCase() === "group"
    ? { ...request, lob: "G" as const }
    : request;

  // Temporary validation log: remove after the Group payload is confirmed.
  console.log("[BRE retrigger request payload]", payload);

  return payload;
};

export const breRetriggerThunk = createApiThunk<
  BreRetriggerResponse,
  BusinessAwareBreRetriggerRequest
>("drs/breRetrigger", {
  url: (request) => url("breRetrigger", request.businessType),
  method: "POST",
  transformBody: addGroupLob,
});
