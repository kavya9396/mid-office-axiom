export type RiderRow = {
  riderName: string;
  riderOption: string;
  riderPT: number;
  riderSumAssured: number;
  riderModalPremium: number;
  riderPPT: number;
};

export interface CVTRequirementRow {
  [key: string]: unknown;
  team: string;
  profile: string;
  category: string;
  subCategory: string;
  document: string;
  specialTest: string;
  reason: string;
  fupCode: string;
  description: string;
  status: string;
  raisedDate: string;
  raisedBy: string;
  receivedDate: string;
  receivedBy: string;
  validity: string;
  userId: string;
  remarks: string;
  udsLink: string;
};

export type DRSRequest = {
  applicationId: string;
  roleType: string;
};

export type DRSResponse = {
  breDecision: BreDecisionResponse | null;
  applicationOverview: ApplicationOverview | null;
  riderDetails: RiderDetail[] | null;
  requirements: AdditionalRequirementRow[] | null;
};

export interface BreDecisionResponse {
  decision: string | null;
  status: string | null;
  remarks: string | null;
  discrepancy: string | null;
  timestamp: string | null;
  retrigger: boolean | null;
};

export interface ApplicationOverview {
  product: Product;
  distribution: Distribution;
  agent: Agent;
  customer: Customer;
  policyDetails: PolicyDetails;
};

export interface Product {
  name: string;
  sumAssured: number;
};

export interface Distribution {
  channel: string;
  subChannel: string;
};

export interface Agent {
  agentCode: string;
  agentName: string;
};

export interface Customer {
  customerType: string;
  policyType: string;
};

export interface PolicyDetails {
  modalPremium: number;
  policyTerm: number;
  premiumPaymentTerm: number;
  paymentMode: string;
};

export interface RiderDetail {
  riderName: string;
  option: string;
  policyTerm: number;
  sumAssured: number;
  modalPremium: number;
  premiumPaymentTerm: number;
};

export type AdditionalRequirementRow = {
  team: string;
  profile: string;
  category: string;
  subCategory: string;
  document: string;
  specialTest: string;
  reason: string;
  fupCode: string;
  description: string;
  status: string;
  raisedDate: string;
  raisedBy: string;
  receivedDate: string;
  receivedBy: string;
  validity: string;
  userId: string;
  remarks: string;
  udsLink: string;
};

export type UserRequest = {
  role: string
};

export type UserResponse = {
  users: User[];
};

export interface User {
  userId: string;
  userName: string;
  role: string;
  ticketsInPool: number;
};

export interface DecisionCode {
  label: string;
  value: string;
}

export type DecisionCodeRequest = {
  decision: string;
};

export type DecisionCodeResponse = {
  decisionCodes: DecisionCode[];
};