import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";

export interface ColumnConfigSaveRequest {
  username: string;
  poolKey: string;
  selectedFields: string[];
}

export interface ColumnConfigSaveResponse {
  success?: boolean;
  message?: string;
}

export const columnConfigSaveThunk = createApiThunk<
  ColumnConfigSaveResponse,
  ColumnConfigSaveRequest
>(
  "columnConfig/save",
  {
    url: url("columnConfigSave"),
    method: "POST",
  },
);