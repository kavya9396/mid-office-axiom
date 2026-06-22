import type { AdditionalRequirementRow, ApplicationDetails, ApplicationOverview, AuditTrail, RiderDetail, SummaryResponse } from "./drs.types";

export type SearchRequest = {
  applicationId: string;
};

export type SearchResponse = {
    applicationDetails:ApplicationDetails;
  applicationOverview: ApplicationOverview;
  summary: SummaryResponse[];
  riderDetails: RiderDetail[];
  requirements: AdditionalRequirementRow[];
  auditTrail:AuditTrail;
  udsLink:string;
};