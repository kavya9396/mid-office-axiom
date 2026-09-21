import { url } from "../../services/apiConfig";
import type {
  CompleteTaskRequest,
  CompleteTaskResponse,
} from "../../types/drs.types";
import { addGroupLob, createApiThunk } from "./createApiThunk";

type BusinessAwareCompleteTaskRequest = CompleteTaskRequest & {
  businessType: string;
  lob?: "G";
};

export const completeTaskThunk = createApiThunk<
  CompleteTaskResponse,
  BusinessAwareCompleteTaskRequest
>("drs/completeTask", {
  url: (request) => url("completeTask", request.businessType),
  method: "POST",
  // The shared endpoint requires lob only when completing a Group task.
  transformBody: (request) => {
    const payload = addGroupLob(request);
    // Temporary validation log: remove after the Group payload is confirmed.
    console.log("[Complete task request payload]", payload);
    return payload;
  },
});
