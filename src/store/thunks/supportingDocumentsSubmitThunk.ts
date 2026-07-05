import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type {
  SupportingDocumentsSubmitRequest,
  SupportingDocumentsSubmitResponse,
} from "../../types/drs.types";

export const supportingDocumentsSubmitThunk = createApiThunk<
  SupportingDocumentsSubmitResponse,
  SupportingDocumentsSubmitRequest
>("drs/supportingDocumentsSubmit", {
  url: url("supportingDocumentsSubmit"),
  method: "POST",
});
