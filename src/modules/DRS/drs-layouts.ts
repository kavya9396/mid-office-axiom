import ApplicationOverview from "./DRS_Accordions/ApplicationOverview";
import BreDecision from "./DRS_Accordions/BreDecision";
import CVTDecision from "./DRS_Accordions/CVTDecision";
import DVTDecision from "./DRS_Accordions/DVTDecision";
import PIVVSection from "./DRS_Accordions/PIVVSection";
import RequirementManagement from "./DRS_Accordions/RequirementManagement";
import Summary from "./DRS_Accordions/Summary";
import UWDecision from "./DRS_Accordions/UWDecision";
import QuickLinks from "./QuickLinks";
import UWToolkit from "./UWToolkit";

export const accordionRegistry = {
  breDecision: BreDecision,
  applicationOverview: ApplicationOverview,
  requirementManagement: RequirementManagement,
  uwDecision: UWDecision,
  pivvSection: PIVVSection,
  cvtDecision: CVTDecision,
  summary: Summary,
  quickLinks: QuickLinks,
  uwToolkit: UWToolkit,
  dvtDecision: DVTDecision,
} as const;

type AccordionKey = keyof typeof accordionRegistry;

export const DRS_LAYOUTS: Record<string, AccordionKey[]> = {
  RETAIL_CVT_POOL: [
    "breDecision",
    "summary",
    "applicationOverview",
    "pivvSection",
    "cvtDecision",
    "quickLinks",
  ],
  RETAIL_CPT_POOL: ["applicationOverview", "quickLinks", "uwToolkit"],
  RETAIL_PRE_ISSUANCE_SERVICING_POOL: ["applicationOverview"],
  RETAIL_EXCEPTIONAL_POOL: ["applicationOverview"],
  RETAIL_PIVV_POOL: [
    "applicationOverview",
    "requirementManagement",
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
  ],
  RETAIL_AMR_NON_MEDICAL: ["applicationOverview", "requirementManagement"],
  RETAIL_RECONSIDERATION_POOL: [
    "breDecision",
    "applicationOverview",
    "summary",
    "requirementManagement",
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
  GROUP_DVT_POOL: [
    "breDecision",
    "summary",
    "applicationOverview",
    "requirementManagement",
    "dvtDecision",
    "quickLinks",
  ],
  GROUP_GUW_POOL: ["quickLinks"],
  GROUP_GOPS_POOL: ["quickLinks"],
};
