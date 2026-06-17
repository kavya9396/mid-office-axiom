import { createApiThunk } from "./createApiThunk";
import type { PoolRequest, PoolResponse } from "../../types/inbox";

export const poolThunk = createApiThunk<PoolResponse,PoolRequest>(
  "/mock/inbox/poolData.json",
  {
    url: "/mock/inbox/poolData.json",
    method: "POST",
  },
);
