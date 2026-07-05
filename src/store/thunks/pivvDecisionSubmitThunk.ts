import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type {
  PivvDecisionSubmitRequest,
  PivvDecisionSubmitResponse,
} from "../../types/drs.types";

export const pivvDecisionSubmitThunk = createApiThunk<
  PivvDecisionSubmitResponse,
  PivvDecisionSubmitRequest
>("drs/pivvDecisionSubmit", {
  url: url("pivvDecisionSubmit"),
  method: "POST",
});
