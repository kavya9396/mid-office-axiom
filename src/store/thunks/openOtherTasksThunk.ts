import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { OpenOtherTasksRequest, OpenOtherTasksResponse } from "../../types/drs.types";

export const openOtherTasksThunk = createApiThunk<OpenOtherTasksResponse, OpenOtherTasksRequest>(
  "drs/openOtherTasks",
  { url: url("openOtherTasks"), method: "POST" },
);
