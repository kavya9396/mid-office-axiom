import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { CompleteTaskRequest, CompleteTaskResponse } from "../../types/drs.types";

export const completeTaskThunk = createApiThunk<CompleteTaskResponse, CompleteTaskRequest>(
  "drs/completeTask",
  {
    url: url("completeTask"),
    method: "POST",
  },
);
