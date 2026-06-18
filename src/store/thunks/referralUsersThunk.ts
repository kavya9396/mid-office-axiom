import { createApiThunk } from "./createApiThunk";
import type { UserRequest, UserResponse } from "../../types/drs.types";

export const referralUsersThunk = createApiThunk<UserResponse, UserRequest>(
  "/mock/ms/userList.json",
  {
    url: "/mock/drs/userList.json",
    method: "POST",
  },
);
