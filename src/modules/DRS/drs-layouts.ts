import ApplicationOverview from "./DRS_Accordions/ApplicationOverview";
import BreDecision from "./DRS_Accordions/BreDecision";
import PIVVSection from "./DRS_Accordions/PIVVSection";
import RequirementManagement from "./DRS_Accordions/RequirementManagement";
import UWDecision from "./DRS_Accordions/UWDecision";

export const accordionRegistry = {
  breDecision: BreDecision,
  applicationOverview: ApplicationOverview,
  requirementManagement: RequirementManagement,
  uwDecision: UWDecision,
  pivvSection:PIVVSection,
} as const;

type AccordionKey = keyof typeof accordionRegistry;

export const DRS_LAYOUTS: Record<string, AccordionKey[]> = {
  RETAIL_CVT_ADMIN: [
    "breDecision",
    "applicationOverview",
    "requirementManagement",
    "uwDecision"
  ],
  RETAIL_CVT_POOL : [
    "breDecision",
    "applicationOverview",
    "pivvSection"
  ]
  // GROUP_CVT_ADMIN: ["applicationOverview"]
};
