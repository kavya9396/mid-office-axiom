const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const normalizeTaskId = (value: unknown): string => {
  const task = String(value ?? "").trim();
  if (!task) return "";
  return task.includes(".") ? task.split(".").pop() ?? "" : task;
};

const parseInstanceFromCompositeTaskId = (value: unknown): string => {
  const task = String(value ?? "").trim();
  if (!task.includes(".")) return "";

  const [instancePart = ""] = task.split(".");
  return String(instancePart).trim();
};

type SelectedCaseContext = {
  applicationNo?: string;
  taskId?: string;
  instanceId?: string;
  taskCompositeId?: string;
};

const getSelectedCaseContext = (): SelectedCaseContext | null => {
  try {
    const raw = localStorage.getItem("selectedCaseContext");
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SelectedCaseContext;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const getDecisionTaskContext = (
  drsData: Record<string, unknown> | null,
  applicationNumber?: string | null,
) => {
  const selectedCaseContext = getSelectedCaseContext();
  const currentApplicationNumber = String(applicationNumber ?? "").trim();
  const isSelectedCaseSameApplication =
    String(selectedCaseContext?.applicationNo ?? "").trim() === currentApplicationNumber;
  const root = toRecord(drsData);
  const appInfo = toRecord(root.applicationInfo);
  const basicDetails = toRecord(root.basicDetails);

  const compositeTaskId = isSelectedCaseSameApplication
    ? selectedCaseContext?.taskCompositeId
    : localStorage.getItem("taskCompositeId");

  const taskId =
    (isSelectedCaseSameApplication ? String(selectedCaseContext?.taskId ?? "").trim() : "") ||
    String(localStorage.getItem("taskId") ?? "").trim() ||
    normalizeTaskId(compositeTaskId) ||
    String(root.taskId ?? root.taskID ?? "").trim() ||
    String(appInfo.taskId ?? appInfo.taskID ?? "").trim();

  const instanceId =
    (isSelectedCaseSameApplication ? String(selectedCaseContext?.instanceId ?? "").trim() : "") ||
    String(localStorage.getItem("instanceId") ?? "").trim() ||
    parseInstanceFromCompositeTaskId(compositeTaskId) ||
    String(root.instanceId ?? root.instanceID ?? "").trim() ||
    String(appInfo.instanceId ?? appInfo.instanceID ?? "").trim();

  const appNo =
    currentApplicationNumber ||
    String(selectedCaseContext?.applicationNo ?? "").trim() ||
    String(localStorage.getItem("applicationNumber") ?? "").trim() ||
    String(root.applicationNumber ?? basicDetails.applicationNumber ?? "").trim();

  return {
    taskId,
    instanceId,
    appNo,
    userId: String(localStorage.getItem("username") ?? "").trim(),
  };
};