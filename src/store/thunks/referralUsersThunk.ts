import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { UserRequest, UserResponse } from "../../types/drs.types";

export const referralUsersThunk = createApiThunk<UserResponse, UserRequest>(
  "drs/referralUsers",
  { url: url("referralUsers"), method: "POST" },
);
