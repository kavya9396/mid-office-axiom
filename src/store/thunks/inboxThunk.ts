import { createApiThunk } from "./createApiThunk";
import type { InboxRequest, UserContextResponse } from "../../types/inbox";

export const fetchInboxThunk = createApiThunk<
  UserContextResponse,
  InboxRequest
>("mock/inbox/roleList.json",{
    url: "/mock/inbox/roleList.json",
    method: "POST",
  });