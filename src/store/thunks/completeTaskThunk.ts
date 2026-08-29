import { url } from "../../services/apiConfig";
import type {
  CompleteTaskRequest,
  CompleteTaskResponse,
} from "../../types/drs.types";
import { createApiThunk } from "./createApiThunk";

type BusinessAwareCompleteTaskRequest = CompleteTaskRequest & {
  businessType: string;
};

export const completeTaskThunk = createApiThunk<
  CompleteTaskResponse,
  BusinessAwareCompleteTaskRequest
>("drs/completeTask", {
  url: (request) => url("completeTask", request.businessType),
  method: "POST",
});
