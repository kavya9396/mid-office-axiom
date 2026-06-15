import ApplicationOverview from "./DRS_Accordions/ApplicationOverview";
import BreDecision from "./DRS_Accordions/BreDecision";
import RequirementManagement from "./DRS_Accordions/RequirementManagement";

export const accordionRegistry = {
  breDecision: BreDecision,
  applicationOverview: ApplicationOverview,
  requirementManagement: RequirementManagement,
} as const;

type AccordionKey = keyof typeof accordionRegistry;

export const DRS_LAYOUTS: Record<string, AccordionKey[]> = {
  RETAIL_CVT_ADMIN: [
    "breDecision",
    "applicationOverview",
    "requirementManagement",
  ],
  // GROUP_CVT_ADMIN: ["applicationOverview"]
};
