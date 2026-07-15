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
    real: "/mock/auth/login.json",
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
    real: "http://172.30.74.182:8094/api/v1/drs/ui/search-application",
    mock: "/mock/inbox/search-application.json",
  },
 
   // DRS
  drs: {
    real: "http://172.30.74.182:8094/api/v1/drs/ui/drs-data",
    mock: "/mock/drs/drs.mock.json",
  },
  masters: {
    real: "/mock/drs/masters.mock.json",
    mock: "/mock/drs/masters.mock.json",
  },
  decisionCodes: {
    real: "/api/drs/decision-codes",
    mock: "/mock/drs/decisionCodes.json",
  },
  breRetrigger: {
    real: "/mock/drs/breRetrigger.mock.json",
    mock: "/mock/drs/breRetrigger.mock.json",
  },
  applicantProfileSubmit: {
    real: "/api/drs/applicant-profile/submit",
    mock: "/mock/drs/applicantProfileSubmit.mock.json",
  },
  customerProfileSubmit: {
    real: "/api/drs/customer-profile/submit",
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
  completeTask: {
    real: "http://172.30.74.182:8112/icic-drs-landing-service/v1/bpm/complete-task/retail",
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
 
 
 