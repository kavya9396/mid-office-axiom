import { getErrorMessage } from "../config/errorMessages";

export type DrsBreValidationResult = {
  canPerformAction: boolean;
  finalBreFailed: boolean;
  message: string;
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const hasText = (value: unknown): boolean => String(value ?? "").trim().length > 0;

const hasUsableBreOutput = (value: unknown): boolean => {
  const breOutput = toRecord(value);
  const decisionTypes = toRecord(breOutput.decisionTypes);

  return (
    hasText(breOutput.systemDecision) ||
    hasText(breOutput.systemDecisionDateTime) ||
    hasText(breOutput.breRemarks) ||
    hasText(decisionTypes.breDecision) ||
    hasText(decisionTypes.breAction) ||
    hasText(decisionTypes.breRequirement) ||
    (Array.isArray(breOutput.requirements) && breOutput.requirements.length > 0)
  );
};

const hasUsableLegacyBreDecision = (value: unknown): boolean => {
  const breDecision = toRecord(value);

  return (
    hasText(breDecision.decision) ||
    hasText(breDecision.initialDecision) ||
    hasText(breDecision.action) ||
    hasText(breDecision.discrepancy) ||
    hasText(breDecision.remarks)
  );
};


const normalizeBreDecision = (value: unknown): string =>
  String(value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

export const getFinalBreDecision = (drsData: unknown): string => {
  const root = toRecord(drsData);
  const externalApis = toRecord(root.externalAPIs);
  const breOutput = toRecord(externalApis.breOutput);
  const decisionTypes = toRecord(breOutput.decisionTypes);
  const legacyBreDecision = toRecord(root.breDecision);

  return (
    String(decisionTypes.breDecision ?? "").trim() ||
    String(breOutput.systemDecision ?? "").trim() ||
    String(legacyBreDecision.decision ?? "").trim()
  );
};

export const canShowAcceptDecision = (drsData: unknown): boolean => {
  const decision = normalizeBreDecision(getFinalBreDecision(drsData));
  return decision === "ST" || decision === "STP";
};

export const filterAcceptDecisionOptions = <T extends { label: string }>(
  options: T[],
  drsData: unknown,
): T[] => {
  if (canShowAcceptDecision(drsData)) {
    return options;
  }

  return options.filter((option) => option.label.trim().toLowerCase() !== "accept");
};

export const isFinalBreFailed = (drsData: unknown): boolean => {
  const root = toRecord(drsData);
  if (Object.keys(root).length === 0) {
    return false;
  }

  const externalApis = toRecord(root.externalAPIs);
  const hasBreContext =
    "breOutput" in externalApis ||
    "breRetriggerStatus" in externalApis ||
    "breDecision" in root;

  if (!hasBreContext) {
    return false;
  }

  // A failed retrigger attempt shouldn't by itself block all UI actions.
  // Only treat it as a final failure when there is no usable BRE output
  // (either new `breOutput` or legacy `breDecision`).
  if (externalApis.breRetriggerStatus === "failure") {
    if ("breOutput" in externalApis) {
      return !hasUsableBreOutput(externalApis.breOutput);
    }
    return !hasUsableLegacyBreDecision(root.breDecision);
  }

  if ("breOutput" in externalApis) {
    return !hasUsableBreOutput(externalApis.breOutput);
  }

  return !hasUsableLegacyBreDecision(root.breDecision);
};

export const validateDrsFinalBre = (drsData: unknown): DrsBreValidationResult => {
  const finalBreFailed = isFinalBreFailed(drsData);

  // Do not block user actions when BRE APIs fail. Still return the
  // `finalBreFailed` flag and a message so callers can display an
  // informational warning, but always allow actions to proceed.
  return {
    canPerformAction: true,
    finalBreFailed,
    message: finalBreFailed ? getErrorMessage("drsFinalBreFailure") : "",
  };
};