// ============================================================
//  CENTRAL API CONFIGURATION
//  Toggle USE_MOCK to switch between mock JSON files and real
//  API endpoints across the entire application.
//  When USE_MOCK = true  → every thunk hits its mock JSON file.
//  When USE_MOCK = false → every thunk hits the real API URL.
// ============================================================

export const USE_MOCK = true; // <-- flip this one flag to switch modes

// --------------- URL registry --------------------------------
// Add or edit URLs here; thunk files need no further changes.
// -------------------------------------------------------------

const apiUrls = {
  // Auth
  login: {
    real: "/api/auth/login",
    mock: "/mock/auth/login.json",
  },

  // Inbox
  roleList: {
    real: "/api/inbox/role-list",
    mock: "/mock/inbox/roleList.json",
  },
  poolData: {
    real: "/api/inbox/pool-data",
    mock: "/mock/inbox/poolData.json",
  },
  searchApplication: {
    real: "/api/inbox/search",
    mock: "/mock/inbox/search-application.json",
  },

  // DRS
  drs: {
    real: "/api/drs/view",
    mock: "/mock/drs/drs.mock.json",
  },
  masters: {
    real: "/api/drs/masters",
    mock: "/mock/drs/masters.mock.json",
  },
  decisionCodes: {
    real: "/api/drs/decision-codes",
    mock: "/mock/drs/decisionCodes.json",
  },
  breRetrigger: {
    real: "/api/drs/bre-retrigger",
    mock: "/mock/drs/breRetrigger.mock.json",
  },
  applicantProfileSubmit: {
    real: "/api/drs/applicant-profile/submit",
    mock: "/mock/drs/applicantProfileSubmit.mock.json",
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
    real: "/api/inbox/claimTask.mock.json",
    mock: "/mock/inbox/claimTask.mock.json"
  },

  // Medical
  medicalView: {
    real: "/api/medical/view",
    mock: "/mock/drs/medical.mock.json",
  },
  medicalSubmit: {
    real: "/api/medical/submit",
    mock: "/mock/drs/medicalSubmit.mock.json",
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

  // Financial
  financialView: {
    real: "/api/financial/view",
    mock: "/mock/drs/financial.mock.json",
  },

  // Previous Policies
  previousPoliciesView: {
    real: "/api/previousPolicies/view",
    mock: "/mock/drs/previousPolicies.mock.json",
  },

  // Grievance
  grievanceView: {
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
} as const;

export type ApiKey = keyof typeof apiUrls;

/** Returns the resolved URL based on the USE_MOCK flag. */
export const url = (key: ApiKey): string =>
  USE_MOCK ? apiUrls[key].mock : apiUrls[key].real;
