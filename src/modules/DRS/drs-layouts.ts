import ApplicationOverview from "./DRS_Accordions/ApplicationOverview";
import BreDecision from "./DRS_Accordions/BreDecision";
import CVTDecision from "./DRS_Accordions/CVTDecision";
import PIVVSection from "./DRS_Accordions/PIVVSection";
import RequirementManagement from "./DRS_Accordions/RequirementManagement";
import Summary from "./DRS_Accordions/Summary";
import UWDecision from "./DRS_Accordions/UWDecision";

export const accordionRegistry = {
  breDecision: BreDecision,
  applicationOverview: ApplicationOverview,
  requirementManagement: RequirementManagement,
  uwDecision: UWDecision,
  pivvSection: PIVVSection,
  cvtDecision: CVTDecision,
  summary: Summary,
} as const;

type AccordionKey = keyof typeof accordionRegistry;

export const DRS_LAYOUTS: Record<string, AccordionKey[]> = {
  RETAIL_CVT_POOL : [
    "breDecision",
     "summary",
    "applicationOverview",
    "pivvSection",
    "cvtDecision"
  ],
  RETAIL_READY_FOR_ISSUANCE_POOL :[
    "breDecision",
    "applicationOverview",
    "requirementManagement"
  ],
  RETAIL_SYSTEM_WAIT_POOL_NON_MEDICAL :[
    "applicationOverview",
    "requirementManagement",
  ],
  RETAIL_NON_MEDICAL:[
    "applicationOverview",
    "requirementManagement",
  ]
  // GROUP_CVT_ADMIN: ["applicationOverview"]
};
