import ApplicationOverview from "./DRS_Accordions/ApplicationOverview";
import BreDecision from "./DRS_Accordions/BreDecision";
import CVTDecision from "./DRS_Accordions/CVTDecision";
import DVTDecision from "./DRS_Accordions/DVTDecision";
import ExceptionDecision from "./DRS_Accordions/ExceptionDecision";
import OpenOtherTasksAccordion from "./DRS_Accordions/OpenOtherTasks";
import PIVVSection from "./DRS_Accordions/PIVVSection";
import PIVVDecision from "./DRS_Accordions/PIVVDecision";
import PreIssuanceRequestChange from "./DRS_Accordions/PreIssuanceRequestChange";
import RequirementManagement from "./DRS_Accordions/RequirementManagement";
import Summary from "./DRS_Accordions/Summary";
//import SupportingDocuments from "./DRS_Accordions/SupportingDocuments";
import UACChecklist from "./DRS_Accordions/UACChecklist";
import UWChecklist from "./DRS_Accordions/UWChecklist";
import UWDecision from "./DRS_Accordions/UWDecision";
import HoDDecision from "./DRS_Accordions/HoDDecision";
import SrUWDecision from "./DRS_Accordions/SrUWDecision";
import HoCMODecision from "./DRS_Accordions/HoCMODecision";
import ReinsureDecision from "./DRS_Accordions/ReinsureDecision";
import DecisionHistory from "./DRS_Accordions/DecisionHistory";
import ClaimSection from "./DRS_Accordions/ClaimSection";
import AccuityDecision from "./DRS_Accordions/AccuityDecision";
import QuickLinks from "./QuickLinks";
import UWToolkit from "./UWToolkit";
import GrievanceApplication from "../Grievance/GrievanceApplication";
import GroupPolicyDetails from "./DRS_Accordions/GroupPolicyDetails";

export const accordionRegistry = {
  breDecision: BreDecision,
  applicationOverview: ApplicationOverview,
  requirementManagement: RequirementManagement,
  uwDecision: UWDecision,
  pivvSection: PIVVSection,
  pivvDecision: PIVVDecision,
  cvtDecision: CVTDecision,
  exceptionDecision: ExceptionDecision,
  openOtherTasks: OpenOtherTasksAccordion,
  preIssuanceRequestChange: PreIssuanceRequestChange,
  summary: Summary,
  quickLinks: QuickLinks,
  uwToolkit: UWToolkit,
  dvtDecision: DVTDecision,
  uacChecklist: UACChecklist,
  uwChecklist: UWChecklist,
  hodDecision: HoDDecision,
  sruwDecision: SrUWDecision,
  hoCMODecision: HoCMODecision,
  reinsurerDecision: ReinsureDecision,
  claimSection: ClaimSection,
  accuityDecision: AccuityDecision,
  greivance: GrievanceApplication,
  decisionHistory: DecisionHistory,
  groupPolicyDetails:GroupPolicyDetails
} as const;

type AccordionKey = keyof typeof accordionRegistry;

type DrsDataRecord = Record<string, unknown>;

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const hasNonEmptyArray = (value: unknown): boolean => Array.isArray(value) && value.length > 0;

const hasObjectContent = (value: unknown): boolean => {
  const record = toRecord(value);
  return Object.keys(record).length > 0;
};

const sectionAvailabilityCheck: Partial<Record<AccordionKey, (data: DrsDataRecord) => boolean>> = {
  applicationOverview: (data) => hasObjectContent(data.applicationOverview),
  summary: (data) => hasNonEmptyArray(data.summary) || hasNonEmptyArray(data.customerDetails),
  pivvSection: (data) => hasObjectContent(data.pivvSection),
  requirementManagement: (data) => hasNonEmptyArray(data.requirementManagement),
  breDecision: (data) => hasObjectContent(data.breDecision) || hasObjectContent(toRecord(data.externalAPIs).breOutput),
  quickLinks: (data) => hasObjectContent(data.quickLinks),
};

export const getPoolWiseAvailableAccordions = (
  layoutKey: string | undefined,
  data?: unknown,
): AccordionKey[] => {
  const baseAccordions = layoutKey ? DRS_LAYOUTS[layoutKey] ?? [] : [];

  const accordionsWithQuickLinks = baseAccordions.includes("quickLinks")
    ? baseAccordions
    : [...baseAccordions, "quickLinks"];

  return accordionsWithQuickLinks.filter((accordion): accordion is AccordionKey => {
    if (!(accordion in accordionRegistry)) {
      return false;
    }

    const checker = sectionAvailabilityCheck[accordion as AccordionKey];
    if (!checker || !data) {
      return true;
    }

    return checker((data as DrsDataRecord) ?? {});
  });
};

export const DRS_LAYOUTS: Record<string, Array<AccordionKey | string>> = {
  RETAIL_COPS_POOL: [
    "breDecision",
    "applicationOverview",
    "summary",
    "pivvSection",
    "requirementManagement",
    "cvtDecision",
    "quickLinks"
  ],RETAIL_CVT_POOL: [
    "breDecision",
    "applicationOverview",
    "summary",
    "pivvSection",
    "requirementManagement",
    "cvtDecision",
    "quickLinks"
  ],
  RETAIL_CPT_POOL: [
    "applicationOverview",
    "requirementManagement",
    "quickLinks",
    "uwToolkit",
  ],
  RETAIL_PRE_ISSUANCE_SERVICING_POOL: [
    "breDecision",
    "summary",
    "applicationOverview",
    "pivvSection",
    "openOtherTasks",
    "preIssuanceRequestChange",
    "quickLinks",
  ],
  RETAIL_EXCEPTIONAL_POOL: [
    "breDecision",
    "summary",
    "applicationOverview",
    "requirementManagement",
    "exceptionDecision"
  ],
  RETAIL_PIVV_POOL: [
    "applicationOverview",
    "requirementManagement",
    "pivvDecision",
    "quickLinks",
    "uwToolkit",
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
    "summary",
    "requirementManagement",
    "reconsiderationPoolDecision"
  ],
  RETAIL_CUW_CLAIM_AUDIT: [
    "applicationOverview", 
    "claimSection",
    "quickLinks"
  ],
  RETAIL_REINSTATEMENT_SUW: [
    "applicationOverview",
    "postIssuanceServicing",
    "pdrSection",
    "requirementManagement",
    "suwDecision",
    "quickLinks",
  ],
  RETAIL_POST_ISSUANCE_SUW: [
    "applicationOverview",
    "postIssuanceServicing",
    "pdrSection",
    "requirementManagement",
    "suwDecision",
    "quickLinks",
  ],
  RETAIL_ACCUITY_USER:["applicationOverview","summary","accuityDecision"],
  RETAIL_REQUIREMENT_REVIEW_POOL: ["applicationOverview","requirementManagement","quickLinks"],
  RETAIL_TELE_VIDEO_POOL: ["applicationOverview","requirementManagement","quickLinks"],
  RETAIL_ISSUANCE_POOL: ["breDecision","applicationOverview","requirementManagement","uwDecision","quickLinks"],
  RETAIL_REJECT_POOL: ["applicationOverview","requirementManagement","reconsiderationDecision","quickLinks"],
  RETAIL_SUW_POOL: ["breDecision","applicationOverview","summary","requirementManagement","uwDecision","uwToolkit","quickLinks"],
  RETAIL_CUW_POOL: ["breDecision","applicationOverview","summary","requirementManagement","uwDecision","decisionHistory","uwToolkit","quickLinks"],
  // RETAIL_SWISS_RE_POOL: ["applicationOverview","quickLinks"],
  // RETAIL_RGA_POOL: ["quickLinks"],
  // RETAIL_MUNICH_RE_POOL: ["quickLinks"],
  // RETAIL_SCORE_RE_POOL: ["quickLinks"],
  // RETAIL_HANNOVER_RE_POOL: ["quickLinks"],
  RETAIL_HOD_POOL: ["breDecision","applicationOverview","summary","requirementManagement","hodDecision","decisionHistory","uwToolkit","quickLinks"],
  RETAIL_SR_UW_POOL: ["breDecision","applicationOverview","summary","requirementManagement","sruwDecision","uwToolkit","quickLinks"],
  RETAIL_RISK_POOL: ["quickLinks"],
  RETAIL_CMO_POOL: ["breDecision","applicationOverview","summary","requirementManagement","hoCMODecision","decisionHistory","uwToolkit","quickLinks"],
  RETAIL_ACCUITY_POOL: ["quickLinks"],
  RETAIL_REINSURER_POOL: ["breDecision","applicationOverview","summary","requirementManagement","reinsurerDecision","decisionHistory","quickLinks"],
  RETAIL_IT_POOL:["breDecision","applicationOverview","summary","requirementManagement","uwDecision","uwToolkit","quickLinks"],
  RETAIL_VENDOR_CMO_POOL:["breDecision","applicationOverview","summary","requirementManagement","uwDecision","uwToolkit","quickLinks"],
  
  RETAIL_ECG_POOL: ["quickLinks"],
  RETAIL_TMT_POOL: ["quickLinks"],
  RETAIL_GRIEVANCE_POOL: ["greivance"],
  

  GROUP_DVT_POOL: [
    "breDecision",
    "applicationOverview",
    "groupPolicyDetails",
    "summary",
    "requirementManagement",
    "dvtDecision",
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
  GROUP_MMT_POOL:[
    "applicationOverview",
    "summary",
    "requirementManagement",
    "quickLinks"
  ], 
  GUW_FORMAL_TASK: [
    "breDecision",
    "applicationOverview",
    "summary",
    "requirementManagement",
    "uwDecision",
    "decisionHistory",
    "quickLinks"
  ],
  DVT_FORMAL_TASK: [
    "breDecision",
    "applicationOverview",
    "summary",
    "requirementManagement",
    "quickLinks"
  ]
};
