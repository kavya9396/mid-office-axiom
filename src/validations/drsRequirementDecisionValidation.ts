import type { AdditionalRequirementRow } from "../types/drs.types";
import { getErrorMessage } from "../config/errorMessages";

const DRS_LOCAL_REQUIREMENTS_KEY_PREFIX = "drsLocalRequirementRows";

type RequirementStatusRow = Pick<AdditionalRequirementRow, "status">;

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toText = (value: unknown): string => String(value ?? "").trim();

const getSelectedCaseApplicationNo = (): string => {
  try {
    const raw = localStorage.getItem("selectedCaseContext");
    const parsed = raw ? JSON.parse(raw) : null;
    return toText(toRecord(parsed).applicationNo);
  } catch {
    return "";
  }
};

export const getRequirementStorageKey = (drsData: unknown): string => {
  const root = toRecord(drsData);
  const nestedData = toRecord(root.data);
  const appInfo = toRecord(root.applicationInfo);
  const nestedAppInfo = toRecord(nestedData.applicationInfo);

  const applicationNo =
    toText(root.applicationNo) ||
    toText(root.appNo) ||
    toText(nestedData.applicationNo) ||
    toText(nestedData.appNo) ||
    toText(appInfo.applicationNo) ||
    toText(appInfo.appNo) ||
    toText(nestedAppInfo.applicationNo) ||
    toText(nestedAppInfo.appNo) ||
    toText(localStorage.getItem("applicationNumber")) ||
    getSelectedCaseApplicationNo();

  return applicationNo
    ? `${DRS_LOCAL_REQUIREMENTS_KEY_PREFIX}:${applicationNo}`
    : DRS_LOCAL_REQUIREMENTS_KEY_PREFIX;
};

const getRequirementUnsavedStorageKey = (drsData: unknown): string =>
  `${getRequirementStorageKey(drsData)}:unsaved`;

export const saveLocalRequirementRows = (
  drsData: unknown,
  visibleRows: RequirementStatusRow[],
  hasUnsavedChanges = false,
): void => {
  const rowsToSave = visibleRows.map((row) => ({
    status: toText(row.status),
  }));

  localStorage.setItem(
    getRequirementStorageKey(drsData),
    JSON.stringify(rowsToSave),
  );
  localStorage.setItem(
    getRequirementUnsavedStorageKey(drsData),
    String(hasUnsavedChanges),
  );
};

const getStoredRequirementRows = (
  drsData: unknown,
): RequirementStatusRow[] | null => {
  try {
    const raw = localStorage.getItem(getRequirementStorageKey(drsData));
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((row) => ({
      status: toText(toRecord(row).status),
    }));
  } catch {
    return null;
  }
};

export const getRequirementRows = (
  drsData: unknown,
  visibleRows?: RequirementStatusRow[],
): RequirementStatusRow[] => {
  if (visibleRows !== undefined) {
    return visibleRows.map((row) => ({ status: toText(row.status) }));
  }

  const storedRows = getStoredRequirementRows(drsData);
  if (storedRows !== null) return storedRows;

  const root = toRecord(drsData);
  const nestedData = toRecord(root.data);
  const externalApis = toRecord(root.externalAPIs);
  const nestedExternalApis = toRecord(nestedData.externalAPIs);
  const breOutput = toRecord(externalApis.breOutput);
  const nestedBreOutput = toRecord(nestedExternalApis.breOutput);

  const directRequirements = Array.isArray(root.requirements)
    ? root.requirements
    : Array.isArray(nestedData.requirements)
      ? nestedData.requirements
      : [];

  const requirementManagement = Array.isArray(root.requirementManagement)
    ? root.requirementManagement
    : Array.isArray(nestedData.requirementManagement)
      ? nestedData.requirementManagement
      : [];

  const breRequirements = Array.isArray(breOutput.requirements)
    ? breOutput.requirements
    : Array.isArray(nestedBreOutput.requirements)
      ? nestedBreOutput.requirements
      : [];

  return [
    ...directRequirements,
    ...requirementManagement,
    ...breRequirements,
  ].map((row) => ({ status: toText(toRecord(row).status) }));
};

export const hasUnsavedRequirementRows = (drsData: unknown): boolean => {
  try {
    return (
      localStorage.getItem(getRequirementUnsavedStorageKey(drsData)) === "true"
    );
  } catch {
    return false;
  }
};

const isPendingRequirement = (status: string): boolean => {
  const normalized = status.trim().toLowerCase();
  return normalized === "" || normalized === "pending" || normalized === "pen";
};

export const hasPendingRequirementRows = (
  drsData: unknown,
  visibleRows?: RequirementStatusRow[],
): boolean =>
  getRequirementRows(drsData, visibleRows).some((row) =>
    isPendingRequirement(toText(row.status)),
  );

export const validateRequirementDecision = (
  drsData: unknown,
  decisionLabel: string,
  visibleRows?: RequirementStatusRow[],
): { isValid: boolean; message: string } => {
  if (hasUnsavedRequirementRows(drsData)) {
    return {
      isValid: false,
      message: getErrorMessage("drsUnsavedRequirementChanges"),
    };
  }

  if (hasPendingRequirementRows(drsData, visibleRows)) {
    const normalizedDecision = toText(decisionLabel).toLowerCase();

    if (normalizedDecision.includes("raise")) {
      return { isValid: true, message: "" };
    }

    return {
      isValid: false,
      message: getErrorMessage("drsPendingRequirements"),
    };
  }

  return { isValid: true, message: "" };
};
