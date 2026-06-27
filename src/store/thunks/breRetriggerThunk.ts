import { createApiThunk } from "./createApiThunk";
import type { BreRetriggerRequest, BreRetriggerResponse } from "../../types/drs.types";

export const breRetriggerThunk = createApiThunk<BreRetriggerResponse, BreRetriggerRequest>(
  "/mock/drs/breRetrigger.mock.json",
  {
    url: "/mock/drs/breRetrigger.mock.json",
    method: "POST",
  },
);
