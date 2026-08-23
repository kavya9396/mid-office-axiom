import type {
  AdditionalRequirementRow,
  ApplicationOverview,
  AuditTrail,
  BreDecisionResponse,
  RiderDetail,
  SummaryResponse,
} from "./drs.types";

export interface ApplicationDetails {
  dob: string;
  proposerName: string;
  lifeAssuredName: string;
  productOpted: string;
  planOpted: string;
  appliedSA: number | string;
  premium: number | string;
  clientType: string;
  lastBucket: string;
  lastUser: string;
}

export interface SearchRequest {
  applicationNo: string;
}

export interface SearchResponse {
  applicationDetails: ApplicationDetails;
  applicationOverview?: ApplicationOverview;
  breDecision?: BreDecisionResponse;
  latestBreDecision?: BreDecisionResponse;
  summary: SummaryResponse[];
  riderDetails: RiderDetail[];
  requirementManagement: AdditionalRequirementRow[];
  auditTrail: AuditTrail[];
  udsLink: string;
  drsLink?: string;
  roleType?: string;
}

export interface SearchApiResponse {
  success: boolean;
  message?: string;
  data: SearchResponse;
}