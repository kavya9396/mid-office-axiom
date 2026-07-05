import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type {
  PreIssuanceRequestChangeSubmitRequest,
  PreIssuanceRequestChangeSubmitResponse,
} from "../../types/drs.types";

export const preIssuanceRequestChangeSubmitThunk = createApiThunk<
  PreIssuanceRequestChangeSubmitResponse,
  PreIssuanceRequestChangeSubmitRequest
>("drs/preIssuanceRequestChangeSubmit", {
  url: url("preIssuanceRequestChangeSubmit"),
  method: "POST",
});
