import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { BreRetriggerRequest, BreRetriggerResponse } from "../../types/drs.types";

export const breRetriggerThunk = createApiThunk<BreRetriggerResponse, BreRetriggerRequest>(
  "drs/breRetrigger",
  { url: url("breRetrigger"), method: "POST" },
);
