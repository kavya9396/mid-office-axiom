import type { AdditionalRequirementRow } from "../types/drs.types";
import { getErrorMessage } from "../config/errorMessages";

const DRS_LOCAL_REQUIREMENTS_KEY_PREFIX = "drsLocalRequirementRows";

type RequirementStatusRow = Pick<AdditionalRequirementRow, "status">;

type SelectedCaseContext = {
  applicationNo?: string;
  applicationNumber?: string;
  roleType?: string;
};

const toRecord = (
  value: unknown,
): Record<string, unknown> =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toText = (value: unknown): string =>
  String(value ?? "").trim();

const normalizeRoleType = (value: unknown): string =>
  toText(value).toUpperCase();

const getSelectedCaseContext = (): SelectedCaseContext => {
  try {
    const raw = localStorage.getItem("selectedCaseContext");
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    const record = toRecord(parsed);

    return {
      applicationNo:
        toText(record.applicationNo) ||
        toText(record.applicationNumber),
      roleType: normalizeRoleType(record.roleType),
    };
  } catch {
    return {};
  }
};

const resolveApplicationNumber = (
  drsData: unknown,
): string => {
  const root = toRecord(drsData);
  const applicationInfo = toRecord(root.applicationInfo);
  const applicationOverview = toRecord(
    root.applicationOverview,
  );
  const selectedCaseContext = getSelectedCaseContext();

  return (
    toText(root.applicationNumber) ||
    toText(root.applicationNo) ||
    toText(root.appNo) ||
    toText(applicationInfo.applicationNumber) ||
    toText(applicationInfo.applicationNo) ||
    toText(applicationInfo.appNo) ||
    toText(applicationOverview.applicationNumber) ||
    toText(applicationOverview.applicationNo) ||
    toText(applicationOverview.appNo) ||
    toText(localStorage.getItem("applicationNumber")) ||
    toText(localStorage.getItem("applicationNo")) ||
    toText(selectedCaseContext.applicationNo)
  );
};

const resolveRoleType = (drsData: unknown): string => {
  const root = toRecord(drsData);
  const applicationInfo = toRecord(root.applicationInfo);
  const selectedCaseContext = getSelectedCaseContext();

  return (
    normalizeRoleType(root.roleType) ||
    normalizeRoleType(applicationInfo.roleType) ||
    normalizeRoleType(selectedCaseContext.roleType) ||
    normalizeRoleType(localStorage.getItem("roleType"))
  );
};

export const getRequirementStorageKey = (
  drsData: unknown,
): string => {
  const applicationNumber =
    resolveApplicationNumber(drsData);

  const roleType = resolveRoleType(drsData);

  if (!applicationNumber) {
    return DRS_LOCAL_REQUIREMENTS_KEY_PREFIX;
  }

  return roleType
    ? `${DRS_LOCAL_REQUIREMENTS_KEY_PREFIX}:${applicationNumber}:${roleType}`
    : `${DRS_LOCAL_REQUIREMENTS_KEY_PREFIX}:${applicationNumber}`;
};

const getRequirementUnsavedStorageKey = (
  drsData: unknown,
): string =>
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

export const markLocalRequirementRowsUnsaved = (
  drsData: unknown,
): void => {
  localStorage.setItem(
    getRequirementUnsavedStorageKey(drsData),
    "true",
  );
};

const getStoredRequirementRows = (
  drsData: unknown,
): RequirementStatusRow[] | null => {
  try {
    const raw = localStorage.getItem(
      getRequirementStorageKey(drsData),
    );

    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.map((row) => ({
          status: toText(toRecord(row).status),
        }))
      : [];
  } catch {
    return null;
  }
};

export const getRequirementRows = (
  drsData: unknown,
): RequirementStatusRow[] => {
  const root = toRecord(drsData);

  const directRequirements = Array.isArray(
    root.requirements,
  )
    ? root.requirements
    : [];

  const requirementManagement = Array.isArray(
    root.requirementManagement,
  )
    ? root.requirementManagement
    : [];

  const externalApis = toRecord(root.externalAPIs);
  const breOutput = toRecord(externalApis.breOutput);

  const breRequirements = Array.isArray(
    breOutput.requirements,
  )
    ? breOutput.requirements
    : [];

  const storedRows = getStoredRequirementRows(drsData);

  if (storedRows !== null) {
    return storedRows;
  }

  return [
    ...directRequirements,
    ...requirementManagement,
    ...breRequirements,
  ].map((row) => ({
    status: toText(toRecord(row).status),
  }));
};

export const hasUnsavedRequirementRows = (
  drsData: unknown,
): boolean => {
  try {
    return (
      JSON.parse(
        localStorage.getItem(
          getRequirementUnsavedStorageKey(drsData),
        ) ?? "false",
      ) === true
    );
  } catch {
    return false;
  }
};

const hasSavedRequirementRows = (
  drsData: unknown,
): boolean =>
  getStoredRequirementRows(drsData) !== null;

const isPendingRequirement = (
  status: string,
): boolean => {
  const normalized = status.trim().toLowerCase();

  return normalized === "" || normalized === "pending";
};

export const hasPendingRequirementRows = (
  drsData: unknown,
): boolean =>
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
      message: getErrorMessage(
        "drsUnsavedRequirementChanges",
      ),
    };
  }

  if (hasPendingRequirementRows(drsData)) {
    /*
     * Pending is valid only when Requirement Management
     * was saved for the current application and role.
     */
    if (hasSavedRequirementRows(drsData)) {
      return {
        isValid: true,
        message: "",
      };
    }

    const normalizedDecision =
      toText(decisionLabel).toLowerCase();

    if (normalizedDecision.includes("raise")) {
      return {
        isValid: true,
        message: "",
      };
    }

    return {
      isValid: false,
      message: getErrorMessage(
        "drsPendingRequirements",
      ),
    };
  }

  return {
    isValid: true,
    message: "",
  };
};