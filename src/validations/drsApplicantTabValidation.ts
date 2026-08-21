type ValidationResult = {
  isValid: boolean;
  message?: string;
};

type SummaryMember = {
  memberType?: string;
};

const STORAGE_KEY_PREFIX = "applicantTabsVisited";

const APPLICANT_TAB_VALIDATION_EXCLUDED_ROLES = new Set([
  "PIVV_TASK",
  "CPT_DATA_ENTRY_NMR_TASK",
  "CPT_DATA_ENTRY_MR_TASK",
  "RECONSIDERATION_TASK"
]);

const normalizeMemberType = (value?: string): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const normalizeRoleType = (value?: string): string =>
  String(value ?? "").trim().toUpperCase();

const getStorageKey = (
  applicationNumber: string,
  roleType: string,
): string =>
  `${STORAGE_KEY_PREFIX}:${applicationNumber.trim()}:${normalizeRoleType(
    roleType,
  )}`;

const readVisitedTabs = (
  applicationNumber: string,
  roleType: string,
): Set<string> => {
  const normalizedApplicationNumber = applicationNumber.trim();
  const normalizedRoleType = normalizeRoleType(roleType);

  if (!normalizedApplicationNumber || !normalizedRoleType) {
    return new Set();
  }

  try {
    const value = sessionStorage.getItem(
      getStorageKey(normalizedApplicationNumber, normalizedRoleType),
    );
    const parsed: unknown = value ? JSON.parse(value) : [];

    return new Set(
      Array.isArray(parsed)
        ? parsed
            .map((item) => normalizeMemberType(String(item)))
            .filter(Boolean)
        : [],
    );
  } catch {
    return new Set();
  }
};

export const markApplicantTabVisited = (
  applicationNumber: string,
  roleType: string,
  memberType: string,
): void => {
  const normalizedApplicationNumber = applicationNumber.trim();
  const normalizedRoleType = normalizeRoleType(roleType);
  const normalizedMemberType = normalizeMemberType(memberType);

  if (
    !normalizedApplicationNumber ||
    !normalizedRoleType ||
    !normalizedMemberType
  ) {
    return;
  }

  if (
    APPLICANT_TAB_VALIDATION_EXCLUDED_ROLES.has(normalizedRoleType)
  ) {
    return;
  }

  const visitedTabs = readVisitedTabs(
    normalizedApplicationNumber,
    normalizedRoleType,
  );

  visitedTabs.add(normalizedMemberType);

  sessionStorage.setItem(
    getStorageKey(normalizedApplicationNumber, normalizedRoleType),
    JSON.stringify([...visitedTabs]),
  );
};

export const validateApplicantTabsVisited = (
  drsData: unknown,
  applicationNumber = "",
  roleType = "",
): ValidationResult => {
  const root =
    drsData && typeof drsData === "object"
      ? (drsData as Record<string, unknown>)
      : {};

  const resolvedRoleType = normalizeRoleType(
    roleType || String(root.roleType ?? ""),
  );

  // These pools do not display Applicant Profile.
  if (
    APPLICANT_TAB_VALIDATION_EXCLUDED_ROLES.has(resolvedRoleType)
  ) {
    return { isValid: true };
  }

  const summary = Array.isArray(root.summary)
    ? (root.summary as SummaryMember[])
    : [];

  const requiredTabs = new Set(
    summary
      .map((member) => normalizeMemberType(member.memberType))
      .filter(Boolean),
  );

  // Cross-tab validation is unnecessary with zero or one applicant tab.
  if (requiredTabs.size <= 1) {
    return { isValid: true };
  }

  const resolvedApplicationNumber = String(
    applicationNumber ||
      root.applicationNumber ||
      root.applicationNo ||
      "",
  ).trim();

  if (!resolvedApplicationNumber || !resolvedRoleType) {
    return {
      isValid: false,
      message:
        "Application or task information is missing. Please reopen the case from Inbox.",
    };
  }

  const visitedTabs = readVisitedTabs(
    resolvedApplicationNumber,
    resolvedRoleType,
  );

  const allTabsVisited = [...requiredTabs].every((tab) =>
    visitedTabs.has(tab),
  );

  return allTabsVisited
    ? { isValid: true }
    : {
        isValid: false,
        message:
          "Please visit both Proposer and Life Assured tabs in Applicant Profile before submitting the decision.",
      };
};
