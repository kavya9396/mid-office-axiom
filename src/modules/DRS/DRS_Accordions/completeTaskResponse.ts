import type { CompleteTaskResponse } from "../../../types/drs.types";

export const getCompleteTaskResult = (response: CompleteTaskResponse) => {
  const responseContext = response.response?.responseContext;
  const status = String(responseContext?.status ?? "").trim().toUpperCase();
  const code = String(responseContext?.code ?? "").trim();
  const success = response.success === true || status === "SUCCESS" || code === "200";
  const message =
    responseContext?.message ||
    response.message ||
    (success ? "Task completed successfully." : "Task completion failed.");

  return {
    success,
    message,
  };
};