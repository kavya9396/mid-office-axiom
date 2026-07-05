import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { AuditTrailRequest, AuditTrailResponse } from "../../types/drs.types";

export const auditTrailThunk = createApiThunk<AuditTrailResponse, AuditTrailRequest>(
  "drs/auditTrail",
  { url: url("auditTrail"), method: "POST" },
);
