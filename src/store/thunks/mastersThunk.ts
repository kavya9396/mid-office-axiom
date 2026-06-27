import { createApiThunk } from "./createApiThunk";
import type { MastersRequest, MastersResponse } from "../../types/drs.types";

export const mastersThunk = createApiThunk<MastersResponse, MastersRequest>(
  "/mock/drs/masters.mock.json",
  {
    url: "/mock/drs/masters.mock.json",
    method: "POST",
  }
);
