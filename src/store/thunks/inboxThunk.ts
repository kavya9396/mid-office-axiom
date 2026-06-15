import { createApiThunk } from "./createApiThunk";
import type { UserContextResponse } from "../../types/inbox";

export const fetchInboxThunk = createApiThunk<
  UserContextResponse,
  void
>("mock/inbox/roleList.json",{
    url: "/mock/inbox/roleList.json",
    method: "POST",
  });