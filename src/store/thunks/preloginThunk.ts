import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { PreLoginRequest, PreLoginResponse } from "../../types/drs.types";

export const preloginThunk = createApiThunk<PreLoginResponse, PreLoginRequest>(
  "drs/prelogin",
  { url: url("prelogin"), method: "POST" },
);
