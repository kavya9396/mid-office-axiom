import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { PreLoginRequest, PreLoginResponse } from "../../types/prelogin.type";

export const preloginThunk = createApiThunk<PreLoginResponse, PreLoginRequest>(
  "prelogin/prelogin",
  { url: url("prelogin"), method: "POST" },
);
