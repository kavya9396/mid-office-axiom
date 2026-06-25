import { createApiThunk } from "./createApiThunk";
import { apiEndpoints } from "../../services/endpoints";
import type { MerSubmitRequest, MerSubmitResponse } from "../../types/drs.types";

export const merSubmitThunk = createApiThunk<
  MerSubmitResponse,
  MerSubmitRequest
>("medical/mer/submit", {
  url: apiEndpoints.merSubmit,
  method: "POST",
  fallbackUrl: "/mock/drs/merSubmit.mock.json",
});
