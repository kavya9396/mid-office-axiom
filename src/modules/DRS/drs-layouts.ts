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
import SupportingDocuments from "./DRS_Accordions/SupportingDocuments";
import UWDecision from "./DRS_Accordions/UWDecision";
import QuickLinks from "./QuickLinks";
import UWToolkit from "./UWToolkit";

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
  supportingDocuments: SupportingDocuments,
  quickLinks: QuickLinks,
  uwToolkit: UWToolkit,
  dvtDecision: DVTDecision,
} as const;

type AccordionKey = keyof typeof accordionRegistry;

export const DRS_LAYOUTS: Record<string, Array<AccordionKey | string>> = {
  RETAIL_CVT_POOL: [
    "breDecision",
    "summary",
    "applicationOverview",
    "pivvSection",
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
    "supportingDocuments",
    "pivvDecision",
    "quickLinks",
    "uwToolkit",
  ],
  RETAIL_READY_FOR_ISSUANCE_POOL: [
    "breDecision",
    "applicationOverview",
    "requirementManagement",
  ],
  RETAIL_SYSTEM_WAIT_POOL_NON_MEDICAL: [
    "applicationOverview",
    "requirementManagement",
    "supportingDocuments"
  ],
  RETAIL_AMR_NON_MEDICAL: [
    "applicationOverview", 
    "requirementManagement", 
    "supportingDocuments"
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
  RETAIL_REQUIREMENT_REVIEW_POOL: ["quickLinks"],
  RETAIL_TELE_VIDEO_POOL: ["quickLinks"],
  RETAIL_ISSUANCE_POOL: ["quickLinks"],
  RETAIL_REJECT_POOL: ["quickLinks"],
  RETAIL_SUW_POOL: ["quickLinks"],
  RETAIL_CUW_POOL: ["quickLinks"],
  RETAIL_SWISS_RE_POOL: ["quickLinks"],
  RETAIL_RGA_POOL: ["quickLinks"],
  RETAIL_MUNICH_RE_POOL: ["quickLinks"],
  RETAIL_SCORE_RE_POOL: ["quickLinks"],
  RETAIL_HANNOVER_RE_POOL: ["quickLinks"],
  RETAIL_HOD_POOL: ["quickLinks"],
  RETAIL_SR_UW_POOL: ["quickLinks"],
  RETAIL_RISK_POOL: ["quickLinks"],
  RETAIL_CMO_POOL: ["quickLinks"],
  RETAIL_ACCUITY_POOL: ["quickLinks"],
  RETAIL_REINSURER_POOL: ["quickLinks"],
  RETAIL_IT_POOL: ["quickLinks"],
  GROUP_DVT_POOL: [
    "breDecision",
    "summary",
    "applicationOverview",
    "requirementManagement",
    "dvtDecision",
    "quickLinks",
  ],
  GROUP_GUW_POOL: [
    "breDecision",
    "summary",
    "applicationOverview",
    "requirementManagement",
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
};
