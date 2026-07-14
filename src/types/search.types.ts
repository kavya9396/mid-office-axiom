import type { AdditionalRequirementRow, ApplicationDetails, ApplicationOverview, AuditTrail, RiderDetail, SummaryResponse } from "./drs.types";

export type SearchRequest = {
  applicationNo: string;
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