import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { LoginRequest, LoginResponse } from "../../types/auth";

export const loginThunk = createApiThunk<LoginResponse, LoginRequest>(
  "auth/login",
  { url: url("login"), method: "POST" },
);
