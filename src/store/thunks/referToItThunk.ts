import { createApiThunk } from "./createApiThunk";
import type { ReferToITRequest, ReferToITResponse } from "../../types/drs.types";

export const referToItThunk = createApiThunk<ReferToITResponse, ReferToITRequest>(
  "/mock/drs/referToIt.mock.json",
  {
    url: "/mock/drs/referToIt.mock.json",
    method: "POST",
  },
);
