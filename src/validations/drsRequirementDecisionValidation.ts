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
  const appInfo = toRecord(root.applicationInfo);
  const applicationNo =
    toText(root.applicationNo) ||
    toText(root.appNo) ||
    toText(appInfo.applicationNo) ||
    toText(appInfo.appNo) ||
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
  rows: RequirementStatusRow[],
  hasUnsavedChanges = false,
): void => {
  localStorage.setItem(
    getRequirementStorageKey(drsData),
    JSON.stringify(rows),
  );
  localStorage.setItem(
    getRequirementUnsavedStorageKey(drsData),
    JSON.stringify(hasUnsavedChanges),
  );
};

export const markLocalRequirementRowsUnsaved = (drsData: unknown): void => {
  localStorage.setItem(getRequirementUnsavedStorageKey(drsData), "true");
};

const getStoredRequirementRows = (
  drsData: unknown,
): RequirementStatusRow[] | null => {
  try {
    const raw = localStorage.getItem(getRequirementStorageKey(drsData));
    if (raw === null) return null;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((row) => ({ status: toText(toRecord(row).status) }))
      : [];
  } catch {
    return null;
  }
};

export const getRequirementRows = (
  drsData: unknown,
): RequirementStatusRow[] => {
  const root = toRecord(drsData);
  const directRequirements = Array.isArray(root.requirements)
    ? root.requirements
    : [];
  const requirementManagement = Array.isArray(root.requirementManagement)
    ? root.requirementManagement
    : [];
  const externalApis = toRecord(root.externalAPIs);
  const breOutput = toRecord(externalApis.breOutput);
  const breRequirements = Array.isArray(breOutput.requirements)
    ? breOutput.requirements
    : [];
  const storedRows = getStoredRequirementRows(drsData);

  if (storedRows !== null) return storedRows;

  return [
    ...directRequirements,
    ...requirementManagement,
    ...breRequirements,
  ].map((row) => ({ status: toText(toRecord(row).status) }));
};

export const hasUnsavedRequirementRows = (drsData: unknown): boolean => {
  try {
    return (
      JSON.parse(
        localStorage.getItem(getRequirementUnsavedStorageKey(drsData)) ??
          "false",
      ) === true
    );
  } catch {
    return false;
  }
};

const hasSavedRequirementRows = (drsData: unknown): boolean =>
  getStoredRequirementRows(drsData) !== null;

const isPendingRequirement = (status: string): boolean => {
  const normalized = status.trim().toLowerCase();
  return normalized === "" || normalized === "pending";
};

export const hasPendingRequirementRows = (drsData: unknown): boolean =>
  getRequirementRows(drsData).some((row) =>
    isPendingRequirement(toText(row.status)),
  );

export const validateRequirementDecision = (
  drsData: unknown,
  decisionLabel: string,
): { isValid: boolean; message: string } => {
  if (hasUnsavedRequirementRows(drsData)) {
    return {
      isValid: false,
      message: getErrorMessage("drsUnsavedRequirementChanges"),
    };
  }

  if (hasPendingRequirementRows(drsData)) {
    // A successful requirement Save records the latest rows locally. Pending
    // is a valid saved status, so it must not block the user's next action.
    if (hasSavedRequirementRows(drsData)) {
      return { isValid: true, message: "" };
    }

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
