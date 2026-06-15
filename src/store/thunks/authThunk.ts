import { createApiThunk } from "./createApiThunk";
import type {
  LoginRequest,
  LoginResponse,
} from "../../types/auth";

export const loginThunk = createApiThunk<
  LoginResponse,
  LoginRequest
>("auth/login");