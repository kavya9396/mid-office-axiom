import { url } from "../../services/apiConfig";
import type { BreRequest, BreResponse } from "../../types/drs.types";
import { createApiThunk } from "./createApiThunk";

type BusinessAwareBreRequest = BreRequest & {
  businessType: string;
  lob?: "G";
};

const addGroupLob = (
  request: BusinessAwareBreRequest,
): BusinessAwareBreRequest => {
  // The shared BRE endpoint uses lob instead of a separate Group URL.
  const payload = request.businessType.trim().toLowerCase() === "group"
    ? { ...request, lob: "G" as const }
    : request;

  // Temporary validation log: remove after the Group payload is confirmed.
  console.log("[BRE request payload]", payload);

  return payload;
};

export const breThunk = createApiThunk<BreResponse, BusinessAwareBreRequest>(
  "drs/bre",
  {
    url: (request) => url("bre", request.businessType),
    method: "POST",
    transformBody: addGroupLob,
  },
);
