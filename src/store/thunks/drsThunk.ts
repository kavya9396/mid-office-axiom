import { createApiThunk } from "./createApiThunk";
import type { DRSRequest, DRSResponse } from "../../types/drs.types";

export const drsThunk = createApiThunk<DRSResponse, DRSRequest>(
  "/mock/ms/drs.mock.json",
  {
    url: "/mock/drs/drs.mock.json",
    method: "POST",
  },
);
