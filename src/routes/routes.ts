import { PATHS } from "./paths";

const VALID_BUSINESS_TYPES = ["retail", "group"] as const;

export const normalizeBusinessType = (businessType?: string | null) => {
  const normalized = (businessType ?? "").trim().toLowerCase();
  return VALID_BUSINESS_TYPES.includes(normalized as (typeof VALID_BUSINESS_TYPES)[number])
    ? normalized
    : undefined;
};

//Create other paths
export const getInboxPath = (businessType: string) =>
  `/${normalizeBusinessType(businessType) ?? "retail"}/${PATHS.INBOX}`;

export const getSearchApplicationPath = () => `/${PATHS.SEARCH_APPLICATION}`;

export const getDRSPath = (businessType: string, appNo: string) =>
  `/${normalizeBusinessType(businessType) ?? "retail"}/app/${appNo}/drs`;

export const getAuditTrailPath = (businessType: string, appNo: string) =>
  `/${normalizeBusinessType(businessType) ?? "retail"}/app/${appNo}/drs/auditTrail`;

export const getOpenTasksPath = (businessType: string, appNo: string) =>
  `/${normalizeBusinessType(businessType) ?? "retail"}/app/${appNo}/drs/openTasks`;

export const getRiskDetailsPath = (businessType: string, appNo: string) =>
  `/${normalizeBusinessType(businessType) ?? "retail"}/app/${appNo}/drs/riskDetails`;

export const getPreviousPoliciesPath = (businessType: string, appNo: string) =>
  `/${normalizeBusinessType(businessType) ?? "retail"}/app/${appNo}/drs/previousPolicies`;

export const getMedicalPath = (businessType: string, appNo: string) =>
  `/${normalizeBusinessType(businessType) ?? "retail"}/app/${appNo}/drs/medical`;

export const getFinancialPath = (businessType: string, appNo: string) =>
  `/${normalizeBusinessType(businessType) ?? "retail"}/app/${appNo}/drs/financial`;

export const getGrievanceRaisePath = (businessType: string, appNo: string) =>
  `/${normalizeBusinessType(businessType) ?? "retail"}/app/${appNo}/grievance/raise`;
export const getGrievanceApplicationPath = (businessType: string, appNo: string) =>
  `/${normalizeBusinessType(businessType) ?? "retail"}/app/${appNo}/grievance/application`;