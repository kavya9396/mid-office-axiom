// ============================================================
//  CENTRAL API CONFIGURATION
//  Toggle USE_MOCK to switch between mock JSON files and real
//  API endpoints across the entire application.
//  When USE_MOCK = true  → every thunk hits its mock JSON file.
//  When USE_MOCK = false → every thunk hits the real API URL.
// ============================================================
export const USE_MOCK = false; // <-- flip this one flag to switch modes

export type BusinessType = "retail" | "group";

type BusinessSpecificUrls = Readonly<Record<BusinessType, string>>;

// --------------- URL registry --------------------------------
// Add or edit URLs here; thunk files only need to pass businessType
// for endpoints that differ between Retail and Group.
// -------------------------------------------------------------

const apiUrls = {
  // Auth
  login: {
    real: "http://172.30.74.182:8103/icic-iam-user-service/v1/auth/login",
    mock: "/mock/auth/login.json",
  },
 
  // Inbox
  roleList: {
    real: "http://172.30.74.182:8112/icic-drs-landing-service/v1/role-list",
    mock: "/mock/inbox/roleList.json",
  },
  poolData: {
    real: "/api/inbox/pool-data",
    mock: "/mock/inbox/poolData.json",
  },
  searchApplication: {
    real: {
      retail: "http://172.30.74.182:8094/api/v1/drs/ui/search-application",
      group: "http://172.30.84.196:8165/api/v1/drs/ui/group/search-application",
    },
    mock: "/mock/inbox/search-application.json",
  },
  columnConfigSave: {
    real: "http://172.30.74.182:8112/icic-drs-landing-service/v1/pool-columns/save",
    mock: "/mock/inbox/columnConfigSave.json",
  },
  columnConfigFetch: {
    real: "http://172.30.74.182:8112/icic-drs-landing-service/v1/pool-columns",
    mock: "/mock/inbox/columnConfigFetch.json",
  },

  // DRS
  drs: {
    real: {
      retail: "http://172.30.74.182:8094/api/v1/drs/ui/drs-data",
      group: "http://172.30.84.196:8165/api/v1/drs/ui/group/drs-data",
    },
    mock: "/mock/drs/drs.mock.json",
  },
  masters: {
    real: "http://172.30.74.182:8154/icic-master-data-service/v1/masters",
    mock: "/mock/drs/masters.mock.json",
  },
  decisionCodes: {
    real: "http://172.30.74.182:8080/api/v1/underwriting/decision-master/options?decisionType=STD&dataEntry=Medical",
    mock: "/mock/drs/decisionCodes.json",
  },
  bre: {
    real: {
      retail: "http://172.30.74.182:8157/icic-bre-wrapper-orchestrator/v1/events",
      group: "http://172.30.84.196:8132/icic-group-bpm-service/v1/group/events",
    },
    mock: "/mock/drs/breRetrigger.mock.json",
  },
  breRetrigger: {
    real: {
      retail: "http://172.30.74.182:8157/icic-bre-wrapper-orchestrator/v1/events",
      group: "http://172.30.84.196:8132/icic-group-bpm-service/v1/group/events",
    },
    mock: "/mock/drs/breRetrigger.mock.json",
  },
  applicantProfileSubmit: {
    real: {
      retail: "http://172.30.74.182:8094/api/v1/drs/ui/drs-data",
      group: "http://172.30.84.196:8165/api/v1/drs/ui/group/drs-data",
    },
    mock: "/mock/drs/applicantProfileSubmit.mock.json",
  },
  customerProfileSubmit: {
    real: {
      retail: "http://172.30.74.182:8094/api/v1/drs/ui/drs-data",
      group: "http://172.30.84.196:8165/api/v1/drs/ui/group/drs-data",
    },
    mock: "/mock/drs/customerProfileSubmit.mock.json",
  },
  referToIt: {
    real: "/api/drs/refer-to-it",
    mock: "/mock/drs/referToIt.mock.json",
  },
  supportingDocumentsSubmit: {
    real: "/api/drs/supporting-documents/submit",
    mock: "/mock/drs/supportingDocumentsSubmit.mock.json",
  },
  pivvDecisionSubmit: {
    real: "/api/drs/pivv-decision/submit",
    mock: "/mock/drs/pivvDecisionSubmit.mock.json",
  },
  preIssuanceRequestChangeSubmit: {
    real: "/api/drs/pre-issuance-request-change/submit",
    mock: "/mock/drs/preIssuanceRequestChangeSubmit.mock.json",
  },
  requirementManagementSave: {
    real: {
      retail: "http://172.30.74.182:8094/api/v1/drs/ui/drs-data",
      group: "http://172.30.84.196:8165/api/v1/drs/ui/group/drs-data",
    },
    mock: "/mock/drs/requirementManagementSubmit.mock.json",
  },
  completeTask: {
    real: {
      retail: "http://172.30.74.182:8112/icic-drs-landing-service/v1/bpm/complete-task/retail",
      group: "http://172.30.74.182:8112/icic-drs-landing-service/v1/bpm/complete-task/group",
    },
    mock: "/mock/drs/completeTask.mock.json",
  },
  referralUsers: {
    real: "/api/drs/user-list",
    mock: "/mock/drs/userList.json",
  },
  auditTrail: {
    real: "/api/drs/audit-trail",
    mock: "/mock/inbox/auditTrail.json",
  },
  openOtherTasks: {
    real: "/api/drs/open-other-tasks",
    mock: "/mock/drs/drs.mock.json",
  },
  riskDetails: {
    real: "/api/drs/risk-details",
    mock: "/mock/drs/drs.mock.json",
  },

  //Claim Task
  claimTask: {
    real: "http://172.30.74.182:8112/icic-drs-landing-service/v1/bpm/user-tasks/claim",
    mock: "/mock/inbox/claimTask.mock.json",
  },

  // Medical
  medicalView: {
    real: "/api/medical/view",
    mock: "/mock/drs/medical.mock.json",
  },
  medicalFetch: {
    real: "http://172.30.74.182:8155/icic-medical-service/v1/medical-data/fetch",
    mock: "/mock/drs/medical.mock.json",
  },
  merSubmit: {
    real: "/api/medical/mer/submit",
    mock: "/mock/drs/merSubmit.mock.json",
  },
  otherMedicalSubmit: {
    real: "/api/medical/other/submit",
    mock: "/mock/drs/otherMedicalSubmit.mock.json",
  },
  specialMedicalSubmit: {
    real: "/api/medical/special/submit",
    mock: "/mock/drs/specialMedicalSubmit.mock.json",
  },
  medicalSaveAndCalculate: {
    real: "http://172.30.74.182:8155/icic-medical-service/v1/medical-data/save",
    mock: "/mock/drs/medicalSaveAndCalculate.mock.json",
  },
  medicalMerSaveAndCalculate: {
    real: "http://172.30.74.182:8155/icic-medical-service/v1/medical-data/save",
    mock: "/mock/drs/medicalSaveAndCalculate.mock.json",
  },
  medicalSubmit: {
    real: "http://172.30.74.182:8155/icic-medical-service/v1/medical-data/save",
    mock: "/mock/drs/medicalSaveAndCalculate.mock.json",
  },

  // Financial
  financialView: {
    real: "http://172.30.74.182:8156/icic-finance-service/v1/fetch",
    mock: "/mock/drs/financial.mock.json",
  },
  financialSubmit: {
    real: "http://172.30.74.182:8156/icic-finance-service/v1/save",
    mock: "/mock/drs/financial.mock.json",
  },
  financialSaveAndCalculate: {
    real: "http://172.30.74.182:8156/icic-finance-service/v1/save",
    mock: "/mock/drs/financialSaveAndCalculate.mock.json",
  },
  financialCommissionCalculate: {
    real: "http://172.30.74.182:8156/icic-finance-service/v1/save",
    mock: "/mock/drs/financialCommissionCalculate.mock.json",
  },

  // Previous Policies
  previousPoliciesView: {
    real: "/api/previousPolicies/view",
    mock: "/mock/drs/previousPolicies.mock.json",
  },

  // Grievance
  raiseGrievance: {
    real: "/api/grievance/view",
    mock: "/mock/drs/grievance.mock.json",
  },
  grievanceSubmit: {
    real: "/api/grievance/submit",
    mock: "/mock/drs/grievanceSubmit.mock.json",
  },
  grievanceApplicationView: {
    real: "/api/grievance/application/view",
    mock: "/mock/drs/grievanceApplication.mock.json",
  },
  grievanceApplicationSubmit: {
    real: "/api/grievance/application/submit",
    mock: "/mock/drs/grievanceApplicationSubmit.mock.json",
  },

  // Pre-login
  prelogin: {
    real: " http://172.30.74.182:8142/icic-prelogin-service/v1/applications/fetch",
    mock: "/mock/drs/prelogin.mock.json",
  },
  userRoleName: {
    real: "http://172.30.74.182:8103/icic-iam-user-service/v1/users/by-role/{roleName}",
    mock: "/mock/drs/userRoleName.mock.json",
  },
} as const;

export type ApiKey = keyof typeof apiUrls;

const normalizeBusinessType = (businessType?: string): BusinessType =>
  businessType?.trim().toLowerCase() === "group" ? "group" : "retail";

/**
 * Returns the resolved URL based on USE_MOCK and businessType.
 * Shared endpoints ignore businessType. Business-specific endpoints default
 * to Retail when businessType is missing or is not "group".
 */
export const url = (key: ApiKey, businessType?: string): string => {
  const endpoint = apiUrls[key];

  if (USE_MOCK) {
    return endpoint.mock;
  }

  const realUrl: string | BusinessSpecificUrls = endpoint.real;

  return typeof realUrl === "string"
    ? realUrl
    : realUrl[normalizeBusinessType(businessType)];
};
