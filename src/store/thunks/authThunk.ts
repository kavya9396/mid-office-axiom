import { createApiThunk } from "./createApiThunk";
import type {
  LoginRequest,
  LoginResponse,
} from "../../types/auth";

export const loginThunk = createApiThunk<
  LoginResponse,
  LoginRequest
>("/mock/auth/login.json", {
    url: "/mock/auth/login.json",
    method: "POST",
  });