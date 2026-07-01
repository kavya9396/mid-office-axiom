import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { PoolRequest, PoolResponse } from "../../types/inbox";

export const poolThunk = createApiThunk<PoolResponse, PoolRequest>(
  "inbox/poolData",
  { url: url("poolData"), method: "POST" },
);
