import { url } from "../../services/apiConfig";
import type { BreRequest, BreResponse } from "../../types/drs.types";
import { createApiThunk } from "./createApiThunk";

type BusinessAwareBreRequest = BreRequest & {
  businessType: string;
};

export const breThunk = createApiThunk<BreResponse, BusinessAwareBreRequest>(
  "drs/bre",
  {
    url: (request) => url("bre", request.businessType),
    method: "POST",
  },
);
