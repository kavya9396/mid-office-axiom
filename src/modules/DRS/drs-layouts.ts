//import BreDecision from "./DRS_Accordions/BreDecision_";
//import CVTDecision from "./DRS_Accordions/CVTDecision";
//import DVTDecision from "./DRS_Accordions/DVTDecision";
import ExceptionDecision from "./DRS_Accordions/ExceptionDecision";
import OpenOtherTasksAccordion from "./DRS_Accordions/OpenOtherTasks";
import PIVVSection from "./DRS_Accordions/PIVVSection";
import PIVVDecision from "./DRS_Accordions/PIVVDecision";
import PreIssuanceRequestChange from "./DRS_Accordions/PreIssuanceRequestChange";
import RequirementManagement from "./DRS_Accordions/RequirementManagement";
// import Summary from "./DRS_Accordions/Summary";
//import SupportingDocuments from "./DRS_Accordions/SupportingDocuments";
import UACChecklist from "./DRS_Accordions/UACChecklist";
import UWChecklist from "./DRS_Accordions/UWChecklist";
import UWDecision from "./DRS_Accordions/UWDecision";
import HoDDecision from "./DRS_Accordions/HoDDecision";
import SrUWDecision from "./DRS_Accordions/SrUWDecision";
import HoCMODecision from "./DRS_Accordions/HoCMODecision";
import ReinsureDecision from "./DRS_Accordions/ReinsureDecision";
import ReconsiderationPoolDecision from "./DRS_Accordions/ReconsiderationPoolDecision";
import DecisionHistory from "./DRS_Accordions/DecisionHistory";
import ClaimSection from "./DRS_Accordions/ClaimSection";
import AccuityDecision from "./DRS_Accordions/AccuityDecision";
import RiskDecision from "./DRS_Accordions/RiskDecision";
import QuickLinks from "./QuickLinks";
import UWToolkit from "./UWToolkit";
import GrievanceApplication from "../Grievance/GrievanceApplication";
import GroupPolicyDetails from "./DRS_Accordions/GroupPolicyDetails";
import CustomerProfile from "./DRS_Accordions/CustomerProfile";
import MedicalInsuranceDetails from "./DRS_Accordions/MedicalInsuranceDetails";
import DocumentRequired from "./DRS_Accordions/DocumentRequired";
import PreLogin from "./DRS_Accordions/PreLogin";
//import BreDecision1 from "./DRS_Accordions/BreDecision";
import ApplicationOverview from "./DRS_Accordions/ApplicationOverview";
import Decision from "./DRS_Accordions/decision";
import BreDecision from "./DRS_Accordions/BreDecision";
import ApplicantProfile from "./DRS_Accordions/ApplicantProfile";
import ITDRS from "./DRS_Accordions/ITDRS";

export const accordionRegistry = {
  //breDecision1:BreDecision1,
  breDecision: BreDecision,
  //applicationOverview: ApplicationOverview,
  applicationOverview: ApplicationOverview,
  requirementManagement: RequirementManagement,
  uwDecision: UWDecision,
  pivvSection: PIVVSection,
  pivvDecision: PIVVDecision,
  //cvtDecision: CVTDecision,
  exceptionDecision: ExceptionDecision,
  openOtherTasks: OpenOtherTasksAccordion,
  preIssuanceRequestChange: PreIssuanceRequestChange,
  summary: ApplicantProfile,
  quickLinks: QuickLinks,
  uwToolkit: UWToolkit,
  //dvtDecision: DVTDecision,
  uacChecklist: UACChecklist,
  uwChecklist: UWChecklist,
  hodDecision: HoDDecision,
  sruwDecision: SrUWDecision,
  hoCMODecision: HoCMODecision,
  reinsurerDecision: ReinsureDecision,
  reconsiderationPoolDecision: ReconsiderationPoolDecision,
  claimSection: ClaimSection,
  accuityDecision: AccuityDecision,
  riskDecision: RiskDecision,
  greivance: GrievanceApplication,
  decisionHistory: DecisionHistory,
  groupPolicyDetails: GroupPolicyDetails,
  customerProfile: CustomerProfile,
  medicalInsuranceDetails: MedicalInsuranceDetails,
  documentRequired: DocumentRequired,
  preLogin: PreLogin,
  decision: Decision,
  // applicantProfile:ApplicantProfile
  itdrs: ITDRS,
} as const;

type AccordionKey = keyof typeof accordionRegistry;

type DrsDataRecord = Record<string, unknown>;

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const hasNonEmptyArray = (value: unknown): boolean =>
  Array.isArray(value) && value.length > 0;

const hasObjectContent = (value: unknown): boolean => {
  const record = toRecord(value);
  return Object.keys(record).length > 0;
};

const sectionAvailabilityCheck: Partial<
  Record<AccordionKey, (data: DrsDataRecord) => boolean>
> = {
  applicationOverview: (data) => hasObjectContent(data.applicationOverview),
  summary: (data) =>
    hasNonEmptyArray(data.summary) || hasNonEmptyArray(data.customerDetails),
  pivvSection: (data) => hasObjectContent(data.pivvSection),
  requirementManagement: (data) => hasNonEmptyArray(data.requirementManagement),
  breDecision: (data) =>
    hasObjectContent(data.breDecision) ||
    hasObjectContent(toRecord(data.externalAPIs).breOutput),
  quickLinks: (data) => hasObjectContent(data.quickLinks),
  customerProfile: (data) =>
    hasNonEmptyArray(data.summary) || hasNonEmptyArray(data.customerDetails),
  medicalInsuranceDetails: (data) =>
    hasObjectContent(data.medicalInsuranceDetails) ||
    hasNonEmptyArray(toRecord(data.quickLinks).previousPolicies),
  documentRequired: (data) => hasObjectContent(data.documentRequired),
  preLogin: (data) =>
    hasObjectContent(data.preLogin) ||
    hasNonEmptyArray(data.summary) ||
    hasNonEmptyArray(data.customerDetails) ||
    hasObjectContent(data.medicalInsuranceDetails) ||
    hasObjectContent(data.documentRequired) ||
    hasNonEmptyArray(toRecord(data.quickLinks).previousPolicies),
};

// export const getPoolWiseAvailableAccordions = (
//   layoutKey: string | undefined,
//   data?: unknown,
// ): AccordionKey[] => {
//   const baseAccordions = layoutKey ? (DRS_LAYOUTS[layoutKey] ?? []) : [];

//   const accordionsWithQuickLinks = baseAccordions.includes("quickLinks")
//     ? baseAccordions
//     : [...baseAccordions, "quickLinks"];

//   return accordionsWithQuickLinks.filter(
//     (accordion): accordion is AccordionKey => {
//       if (!(accordion in accordionRegistry)) {
//         return false;
//       }

//       const checker = sectionAvailabilityCheck[accordion as AccordionKey];
//       if (!checker || !data) {
//         return true;
//       }

//       return checker((data as DrsDataRecord) ?? {});
//     },
//   );
// };

export const getPoolWiseAvailableAccordions = (
  layoutKey: string | undefined,
  data?: unknown,
): AccordionKey[] => {
  const baseAccordions = layoutKey
    ? DRS_LAYOUTS[layoutKey] ?? []
    : [];

  return baseAccordions.filter(
    (accordion): accordion is AccordionKey => {
      if (!(accordion in accordionRegistry)) {
        return false;
      }

      const checker =
        sectionAvailabilityCheck[
          accordion as AccordionKey
        ];

      if (!checker || !data) {
        return true;
      }

      return checker(
        (data as DrsDataRecord) ?? {},
      );
    },
  );
};

export const DRS_LAYOUTS: Record<string, Array<AccordionKey | string>> = {
  RETAIL_COPS_POOL: [
    "breDecision",
    "applicationOverview",
    "summary",
    "pivvSection",
    "requirementManagement",
    "cvtDecision",
    "quickLinks",
  ],
  CVT_TASK: [
    //"breDecision",
    // "applicantProfile",
    //"summary",
    //"applicationOverview",
    "pivvSection",
    //"requirementManagement",
    "decision",
    "quickLinks",
  ],
  // RETAIL_CPT_POOL: [
  //   "applicationOverview",
  //   "requirementManagement",
  //   "quickLinks",
  //   "uwToolkit",
  // ],
  CPT_DATA_ENTRY_NMR_TASK: [
    "applicationOverview",
    "requirementManagement",
    "quickLinks",
  ],
  CPT_DATA_ENTRY_MR_TASK: [
    "applicationOverview",
    "requirementManagement",
    "quickLinks",
    "uwToolkit",
  ],
  RETAIL_PRE_ISSUANCE_SERVICING_POOL: [
    "openOtherTasks",
    "applicationOverview",
    "preIssuanceRequestChange",
    "quickLinks",
  ],
  RETAIL_EXCEPTIONAL_POOL: [
    "breDecision",
    "applicationOverview",
    "requirementManagement",
    "decision",
  ],
  PIVV_TASK: [
    "applicationOverview",
    "requirementManagement",
    "decision",
    "quickLinks",
  ],
  RETAIL_READY_FOR_ISSUANCE_POOL: [
    "breDecision",
    "applicationOverview",
    "requirementManagement",
  ],
  RETAIL_SYSTEM_WAIT_POOL_AMR_MEDICAL: [
    "applicationOverview",
    "requirementManagement",
  ],
  RETAIL_SYSTEM_WAIT_POOL_AMR_NON_MEDICAL: [
    "applicationOverview",
    "requirementManagement",
  ],
  RETAIL_RECONSIDERATION_POOL: [
    "breDecision",
    "applicationOverview",
    "requirementManagement",
    "decision",
  ],
  RETAIL_CUW_CLAIM_AUDIT: ["applicationOverview", "claimSection", "quickLinks"],
  RETAIL_REINSTATEMENT_SUW: [
    "applicationOverview",
    "postIssuanceServicing",
    "pdrSection",
    "requirementManagement",
    "suwDecision",
    "quickLinks",
  ],
  POST_ISSUANCE_TASK: [
    "applicationOverview",
    "postIssuanceServicing",
    "pdrSection",
    "requirementManagement",
    "suwDecision",
    "quickLinks",
  ],
  RETAIL_ACCUITY_USER: [
    "applicationOverview",
    "summary",
    "requirementManagement",
    "accuityDecision",
  ],
  ACCUITY_TASK: [
    "applicationOverview",
    "summary",
    "requirementManagement",
    "accuityDecision",
  ],
  RETAIL_REQUIREMENT_REVIEW_POOL: [
    "applicationOverview",
    "requirementManagement",
    "quickLinks",
  ],
  RETAIL_TELE_VIDEO_POOL: [
    "applicationOverview",
    "requirementManagement",
    "quickLinks",
  ],
  ISSUANCE_TASK: [
    "breDecision",
    "applicationOverview",
    "requirementManagement",
    "quickLinks",
  ],
  RETAIL_REJECT_POOL: [
    "applicationOverview",
    "requirementManagement",
    "reconsiderationDecision",
    "quickLinks",
  ],
  RETAIL_SUW_POOL: [
    "breDecision",
    "applicationOverview",
    "summary",
    "requirementManagement",
    "uwDecision",
    "quickLinks",
  ],
  RETAIL_CUW_POOL: [
    // "breDecision",
    // "applicationOverview",
    // "summary",
    //"requirementManagement",
    "uwDecision",
    //"decisionHistory",
    "quickLinks",
  ],
  // RETAIL_SWISS_RE_POOL: ["applicationOverview","quickLinks"],
  // RETAIL_RGA_POOL: ["quickLinks"],
  // RETAIL_MUNICH_RE_POOL: ["quickLinks"],
  // RETAIL_SCORE_RE_POOL: ["quickLinks"],
  // RETAIL_HANNOVER_RE_POOL: ["quickLinks"],
  RETAIL_HOD_POOL: [
    "breDecision",
    "applicationOverview",
    "summary",
    "requirementManagement",
    "decision",
    "decisionHistory",
    "quickLinks",
  ],
  RETAIL_SR_UW_POOL: [
    "breDecision",
    "applicationOverview",
    "summary",
    "requirementManagement",
    "decision",
    "quickLinks",
  ],
  RETAIL_RISK_POOL: ["quickLinks"],
  RETAIL_CMO_POOL: [
    "breDecision",
    "applicationOverview",
    "summary",
    "requirementManagement",
    "decision",
    "decisionHistory",
    "quickLinks",
  ],
  RETAIL_ACCUITY_POOL: ["quickLinks"],
  RETAIL_REINSURER_POOL: [
    "breDecision",
    "applicationOverview",
    "summary",
    "requirementManagement",
    "reinsurerDecision",
    "decisionHistory",
    "quickLinks",
  ],
  RETAIL_IT_POOL: [
   "itdrs"
  ],
  RETAIL_VENDOR_CMO_POOL: [
    "breDecision",
    "applicationOverview",
    "summary",
    "requirementManagement",
    "decision",
    "quickLinks",
  ],

  RETAIL_ECG_POOL: ["quickLinks"],
  RETAIL_TMT_POOL: ["quickLinks"],
  RETAIL_GRIEVANCE_POOL: ["greivance"],
  PRE_LOGIN_CUW_TASK: [
    "breDecision",
    "preLogin",
    "requirementManagement",
    "uwDecision",
  ],
  AMR_MEDICAL_TASK: [
    "applicationOverview",
    "requirementManagement",
    "quickLinks",
  ],
  AMR_NON_MEDICAL_TASK: [
    "applicationOverview",
    "requirementManagement",
    "quickLinks",
  ],

  GROUP_DVT_POOL: [
    "breDecision",
    "applicationOverview",
    "groupPolicyDetails",
    "summary",
    "requirementManagement",
    "decision",
    "quickLinks",
  ],
  GROUP_GUW_POOL: [
    "breDecision",
    "summary",
    "applicationOverview",
    "requirementManagement",
    "uwChecklist",
    "uacChecklist",
    "uwDecision",
    "quickLinks",
  ],
  GROUP_GOPS_POOL: [
    "breDecision",
    "summary",
    "requirementManagement",
    "uwDecision",
    "applicationOverview",
    "quickLinks",
  ],
  GROUP_MMT_POOL: [
    "applicationOverview",
    "summary",
    "requirementManagement",
    "quickLinks",
  ],
  GUW_FORMAL_TASK: [
    "breDecision",
    "applicationOverview",
    "summary",
    "requirementManagement",
    "uwDecision",
    "decisionHistory",
    "quickLinks",
  ],
  DVT_FORMAL_TASK: [
    "breDecision",
    "applicationOverview",
    "summary",
    "requirementManagement",
    "quickLinks",
  ],
  RISK_TASK: [
    "applicationOverview",
    "summary",
    "riskDecision",
    "riskReports",
    "quickLinks",
  ],
};
