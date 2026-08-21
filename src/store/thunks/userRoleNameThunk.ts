import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";

import type {
  UserRoleNameRequest,
  UserRoleNameResponse,
} from "../../types/drs.types";

const userRoleNameUrl = url("userRoleName");

export const userRoleNameThunk = createApiThunk<
  UserRoleNameResponse,
  UserRoleNameRequest
>("drs/userRoleName", {
  url: ({ roleName }) =>
    userRoleNameUrl.includes("{roleName}")
      ? userRoleNameUrl.replace(
          "{roleName}",
          encodeURIComponent(roleName),
        )
      : userRoleNameUrl,
  method: "GET",
});