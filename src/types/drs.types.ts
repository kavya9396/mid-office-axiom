
export type GrievanceReport = {
  id: number;
  fupCode: string;
  lifeAssured: string;
  remarksUser: string;
  remarksTpa: string;
};

export type GrievanceRequest = {
  applicationId: string;
  roleType?: string;
};

export type GrievanceResponse = {
  applicationId: string;
  policyNumber: string;
  lifeAssuredName: string;
  proposerName: string;
  fupCodes: GrievanceReport[];
};

export type GrievanceSubmitRequest = {
  applicationId: string;
  roleType?: string;
  remarks: string;
  fupCodes: GrievanceReport[];
  attachments?: GrievanceAttachment[];
};

export type GrievanceAttachment = {
  fileName: string;
  mimeType: string;
  size: number;
  contentBase64: string;
};

export type GrievanceSubmitResponse = {
  success: boolean;
  message: string;
};

export type GrievanceApplicationReport = {
  id: number;
  user: string;
  reports: string;
  lifeAssuredProposer: string;
  remarksByUser: string;
  grievanceRaisedDate: string;
  grievanceRaisedRemarks: string;
  grievanceReceivedDate: string;
};

export type GrievanceApplicationRequest = {
  applicationId: string;
  roleType?: string;
};

export type GrievanceApplicationResponse = {
  applicationId: string;
  status: string;
  productOpted: string;
  premium: string;
  sumAssured: string;
  medicalRaisedDate: string;
  medicalsReceivedDate: string;
  reports: GrievanceApplicationReport[];
};

export type GrievanceApplicationSubmitRequest = {
  applicationId: string;
  roleType?: string;
  selectedReportIds: number[];
  attachments: GrievanceAttachment[];
};

export type GrievanceApplicationSubmitResponse = {
  success: boolean;
  message: string;
};

export type RiderRow = {
  name: string;
  type: string;
  term: string;
  sumAssured: string;
  paymentAmount: string;
  ppt: string;
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
}

export type DRSViewRequest = {
  applicationNo: string;
  userId: string;
  roleType: string;
  sections: string[];
};

export type DRSRequest = {
  applicationId: string;
  roleType: string;
};

export type FinancialViewRequest = {
  applicationNumber: string;
  partyId: string;
};

export type DRSResponse = {
  data: DRSData;
};

export interface DRSData {
  applicationNumber: string;
  breDecision:BreDecisionResponse;
  latestBreDecision:BreDecisionResponse;
  submitDate: string;
  totalPremium: number;
  sourceSystem: string;
  applicationOverview:DRSApplicationInfo;
  applicationInfo: DRSApplicationInfo;
  riderDetails?: DRSRiderDetail[];
  sourcingDetail: DRSSourcingDetail;
  groupDetails: DRSGroupDetails;
  productDetail: DRSProductDetail[];
  customerDetails: DRSCustomerDetail[];
  producerDetails: Record<string, string>;
  nominee: DRSNominee[];
  appointee: DRSAppointee[];
  fundDetails: DRSFundDetails;
  payoutDetails: Record<string, string>;
  advisorDetails: Record<string, string>;
  questions: DRSQuestion[];
  externalAPIs: DRSExternalAPIs;
  summary: EditableMember[];
}

export type EditableMember = {
  memberType?: string;
  proposerSummary?: {
    dob?: string;
    gender?: string;
    residentStatus?: string;
    immigrationStatus?: string;
  };
  applicantDetails?: {
    dateOfBirth?: string;
    gender?: string;
  };
  kycDetails?: {
    panNumber?: string;
    pranNo?: string;
    identityProofType?: string;
    addressProof?: string;
    ageProof?: string;
  };
  address?: {
    type?: string;
    pinCode?: string;
  }[];
};

export interface DRSApplicationInfo {
  proposerType: string;
  [key: string]: unknown;
}

export interface DRSSourcingDetail {
  agentCode: string;
  channelCode: string;
  drcChannelCode: string;
  [key: string]: unknown;
}

export interface DRSGroupDetails {
  coverageStatus: string;
  coverageOption?: string;
  moratorium?: string;
  loanType?: string;
  bankType?: string;
  loanTerm?: string | number;
  loanAmount?: string | number;
  typeOfLoan?: string;
  dateOfLoanDisbursement?: string;
  shareOfLoan?: string | number;
  applicantStatus?: string;
  shareOfLoanJl?: string | number;
  applicantStatusJl?: string;
  masterPolicyHolder?: string;
  masterPolicyHolderCode?: string;
  [key: string]: unknown;
}

export interface DRSProductDetail {
  type: string;
  code: string;
  name: string;
  term: string | number;
  premiumCessationTerm: string | number;
  paymentAmount: string | number;
  premiumModeFpd: string;
  sumAssured: string | number;
  [key: string]: unknown;
}

export interface DRSRiderDetail {
  name?: string;
  type?: string;
  term?: string | number;
  sumAssured?: string | number;
  paymentAmount?: string | number;
  ppt?: string | number;
  riderName?: string;
  option?: string;
  policyTerm?: string | number;
  modalPremium?: string | number;
  premiumPaymentTerm?: string | number;
  [key: string]: unknown;
}

export interface DRSCustomerDetail {
  lifeType: string;
  personalDetails: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dob: string;
    gender: string;
    maritalStatus?: string;
    nationality?: string;
    [key: string]: unknown;
  };
  communicationDetails?: {
    mobileNo?: string;
    emailId?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface DRSNominee {
  relationWithLA: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  percentage: string;
  proposerNomineeRelation: string;
}

export interface DRSAppointee {
  relationWithLA: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  relationWithNominee: string;
}

export interface DRSFundDetails {
  allocationStrategy: string;
  totalAllocation: string;
  atpOpted: string;
  fundDetail: FundDetail[];
}

export interface DRSQuestion {
  quesCode: string;
  quesFor: string;
  quesType: string;
  quesAns: string;
}

export interface DRSExternalAPIs {
  breOutput: DRSBreOutput;
  initialBreOutput?: DRSBreOutput;
  breRetriggerStatus?: "success" | "failure";
  medicalBreOutput: Record<string, unknown>;
  financialBreOutput: Record<string, unknown>;
  risk: Record<string, unknown>;
  iibOutput: Array<Record<string, unknown>>;
  drcOutput: Record<string, unknown>;
  ptlrOutput: Record<string, unknown>;
  ptllOutput: Record<string, unknown>;
}

export interface DRSBreOutput {
  systemDecision: string;
  decisionTypes: {
    breInitialDecision?: string;
    initialDecision?: string;
    breDecision: string;
    breAction: string;
    breRequirement: string;
  };
  requirements: DRSRequirement[];
  systemDecisionDateTime: string;
  errorResp: string;
  breRemarks: string;
  reTriggerCount?: number;
  retriggerCount?: number;
}

export interface DRSRequirement {
  requirementType: string;
  requirementValue: string;
  ruleId: string;
  ruleName: string;
  isSTP: boolean;
  metaphorName: string;
}

export type MedicalStatus = "normal" | "abnormal";

export type MedicalTestRow = {
  parameter: string;
  value: string;
  unit: string;
  normalRange: string;
  status: MedicalStatus;
};

export type MedicalSection = {
  title: string;
  rows: MedicalTestRow[];
};

export type BreDecisionExtraField = {
  label: string;
  value?: string | null;
  visibleWhen?: "always" | "success" | "failure";
};

export type MedicalApplicantSummary = {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  profileImage: string;
  caseStatus: string;
  occupation?: string;
  annualIncome?: string | number;
  email?: string;
  mobile?: string;
};

export type MedicalSummaryMember = {
  memberType: "proposer" | "lifeassured1" | "lifeassured2";
  proposerSummary?: MedicalApplicantSummary;
  lifeassured1Summary?: MedicalApplicantSummary;
  lifeassured2Summary?: MedicalApplicantSummary;
};

export type MedicalResponse = {
  applicationId: string;
  breDecision: BreDecisionResponse & {
    medicalDecision?: string;
    medicalDecisionDate?: string;
    medicalDiscrepancy?: string;
    medicalRemarks?: string;
  };
  breAdditionalFields?: BreDecisionExtraField[];
  summary: MedicalSummaryMember[];
  sections: MedicalSection[];
};

export type FinancialResponse = {
  applicationId: string;
  breDecision: BreDecisionResponse & {
    financialDecision?: string;
    financialDecisionDate?: string;
    financialDiscrepancy?: string;
    financialRemarks?: string;
  };
  breAdditionalFields?: BreDecisionExtraField[];
  summary: MedicalSummaryMember[];
  sections?: FinancialResponseSection[];
};

export type FinancialResponseField = {
  label: string;
  value?: string | number | boolean | null;
  isMandatory?: boolean;
  mandatoryCondition?: string;
};

export type FinancialResponseSection = {
  key: string;
  title?: string;
  columns?: number;
  items: FinancialResponseField[];
};

export type PreviousPolicyItem = {
  policyNumber?: string;
  productName?: string;
  companyName?: string;
  productType?: string;
  dateOfIssuance?: string;
  dateOfIssue?: string;
  issueDate?: string;
  uwDecision?: string;
  sumAssured?: string | number;
  medicalsReceivedDate?: string;
  medicalReceivedDate?: string;
  validity?: string;
};

export type PreviousPoliciesResponse = {
  applicationId?: string;
  previousPolicies?: PreviousPolicyItem[];
  policies?: PreviousPolicyItem[];
  totalCount?: number;
};

export type MedicalSubmitRequest = {
  applicationId: string;
  roleType: string;
  memberType: ApplicantTab;
  sections: MedicalSection[];
};

export type MedicalSubmitResponse = {
  success: boolean;
  message: string;
};

export type MerFormFieldValue = {
  id: string;
  section: string;
  type: string;
  field: string;
  value: string;
};

export type MerSubmitRequest = {
  applicationId: string;
  roleType: string;
  memberType: ApplicantTab;
  testCode: string;
  fields: MerFormFieldValue[];
};

export type MerSubmitResponse = {
  success: boolean;
  message: string;
};

export type ReferToITRequest = {
  applicationId: string;
  roleType: string;
  decision: string;
};

export type ReferToITResponse = {
  success: boolean;
  message: string;
};

export type SupportingDocumentItem = {
  fileName: string;
  mimeType: string;
  size: number;
};

export type SupportingDocumentsSubmitRequest = {
  applicationId: string;
  roleType: string;
  remarks: string;
  documents: SupportingDocumentItem[];
};

export type SupportingDocumentsSubmitResponse = {
  success: boolean;
  message: string;
};

export type PivvDecisionSubmitRequest = {
  applicationId: string;
  roleType: string;
  taskId: string;
  decision: string;
  remarks: string;
  workflowPool: string;
};

export type PivvDecisionSubmitResponse = {
  success: boolean;
  message: string;
};

export type PreIssuanceRequestChangeAttachment = {
  fileName: string;
  mimeType: string;
  size: number;
};

export type PreIssuanceRequestChangeSubmitRequest = {
  applicationId: string;
  roleType: string;
  taskId: string;
  existingAddressPincode: string;
  changedAddressPincode: string;
  documentProof: string;
  remarks: string;
  additionalFiles: PreIssuanceRequestChangeAttachment[];
};

export type PreIssuanceRequestChangeSubmitResponse = {
  success: boolean;
  message: string;
};

export type CompleteTaskReq = {
  taskId: string;
  userId: string;
  appNo: string;
  instanceId: string;
  remarks: string;
  decision: string;
};
export type CompleteTaskRequest = {
  requestContext: CompleteTaskReq;
};
export type CompleteTaskResponse = {
  success?: boolean;
  message?: string;
  response?: {
    responseHeader?: {
      responseTime?: string;
      source?: string;
      transactionId?: string;
    };
    responseContext?: {
      code?: string;
      message?: string;
      status?: string;
    };
  };
};

export type BreRetriggerRequest = {
  eventName:string;
  applicationNumber:string;
};

export type BreRetriggerResponse = {
  data: {
    breOutput: DRSBreOutput;
    initialBreOutput?: DRSBreOutput;
    medicalBreOutput?: Record<string, unknown>;
    financialBreOutput?: Record<string, unknown>;
  };
};
export type BreRequest = {
  eventName:string;
  applicationNumber?:string;
};

export type BreResponse = {
  data: {
    breOutput: DRSBreOutput;
    initialBreOutput?: DRSBreOutput;
    medicalBreOutput?: Record<string, unknown>;
    financialBreOutput?: Record<string, unknown>;
  };
};

export interface BreDecisionResponse {
  initialDecision: string | null;
  decision: string | null;
  status: string | null;
  remarks: string | null;
  discrepancy: string | null;
  timestamp: string | null;
  retrigger: boolean | null;
  reTriggerCount: number;
}

export interface ApplicationOverview {
  product: Product;
  distribution: Distribution;
  agent: Agent;
  customer: Customer;
  policyDetails: ApplicationOverviewPolicyDetails;
}

export interface Product {
  name: string;
  sumAssured: number;
  productCode: string;
}

export interface Distribution {
  channel: string;
  subChannel: string;
}

export interface Agent {
  agentCode: string;
  agentName: string;
}

export interface Customer {
  customerType: string;
  policyType: string;
}

export interface ApplicationOverviewPolicyDetails {
  modalPremium: number;
  policyTerm: number;
  premiumPaymentTerm: number;
  paymentMode: string;
}

export interface RiderDetail {
  riderName: string;
  option: string;
  policyTerm: number;
  sumAssured: number;
  modalPremium: number;
  premiumPaymentTerm: number;
}

export type AdditionalRequirementRow = {
  requirementId?:number;
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
  

  userId: string;
  remarks: string;
  udsLink: string;
  ocrStatus?:string;
};

export type UserRequest = {
  role: string;
};

export type UserResponse = {
  users: User[];
};

export interface User {
  userId: string;
  userName: string;
  role: string;
  ticketsInPool: number;
}

export interface DecisionCode {
  label: string;
  value: string;
}

export type MasterOption = {
  key?: string;
  label?: string;
  code?: string;
  description?: string;
  value?: string | null;
  disabled?: boolean;
  isActive?: string;
};

export type RequirementMasterOption = {
  team: "Gops" | "UW";
  specialTest?: string;
  profile: string;
  category: string;
  subCategory: string;
  document: string;
  reason: string;
  fupCode: string;
  description: string;
};

export type MasterKey =
  | "title"
  | "gender"
  | "nationality"
  | "idProof"
  | "addressProof"
  | "state"
  | "country"
  | "maritalStatus"
  | "pep"
  | "exceptionDecision"
  | "requirementManagement"
  | "cvtDecision"
  | "dvtDecision"
  | "caseUWDecision"
  | "firstUWDecision"
  | "parallelUWDecision"
  | "reconsiderationDecision"
  | "riskDecision"
  | "srUwDecision"
  | "hodDecision"
  | "hoCmoDecision"
  | "reinsurerDecision"
  | "reinsurerDecisionId"
  | "pivvDecision"
  | "requirementTeam"
  | "requirementProfile"
  | "requirementCategory"
  | "requirementSubCategory"
  | "requirementDocument"
  | "requirementReason"
  | "requirementStatus"
  | "rejectReason"
  | "declineReason"
  | "postponeReason"
  | "postponementPeriod"
  | "riskReferralReason"
  | "accuityReferralReason"
  | "reinsurerReferralReason"
  | "holdReason"
  | "cuwReferralReason"
  | "reasonRemarks"
  | "resident_status"
  | "marital_status"
  | "education"
  | "occupation"
  | "industry_type"
  | "organization_type"
  | "id_proof_type"
  | "impairement_type"
  | "insurance_repository"
  | "product"
  | "rider"
  | "annuity_option"
  | "fund"
  | "portfolio_strategy"
  | "payment_mode"
  | "source_of_fund"
  | "proposal_status"
  | "policy_decision"
  | "agent_mst"
  | "health_question"
  | "requirement_mst"
  | "bre"
  | "ntu_retail"
  | "pre_post_insurance"
  | "uw_decision"
  | "app_status"
  | "misc"
  |"decision_master"
  | "requirement_status_master"
  | "reason_master";

export type MastersData = Partial<
  Record<Exclude<MasterKey, "requirementManagement">, MasterOption[]>
> & {
  requirementManagement?: RequirementMasterOption[];
};

export type MastersRequest = {
  types: MasterKey[];
};

export type MastersResponse = {
  success: boolean;
  data: MastersData;
};

export type DecisionCodeRequest = {
  decision: string;
};

export type DecisionCodeResponse = {
  decisionCodes: DecisionCode[];
};

export interface PivvSection {
  title: string;
  remarks: string;
  decision: string;
  reason: string;
  userId: string;
}

export interface PivvSectionResponse {
  pivvSection: PivvSection;
}

export type ApplicantTab = "proposer" | "lifeassured" | "lifeassured1" | "lifeassured2";

export type RiskCard = {
  title: string;
  desc: string;
  detailedDescTitle: string;
  detailedDesc: string[];
  type: "medical" | "financial" | "other";
  status: "warning" | "success";
};

export interface SummaryResponse {
  memberType: "proposer" | "lifeassured1" | "lifeassured2";
  proposerSummary: ProposerSummary;
  personalDetails: PersonalDetails;
  financialDetails: FinancialDetails;
  policyDetails: SummaryPolicyDetails;
  underwriting: Underwriting;
  applicantDetails: ApplicantDetails;
  kycDetails: KycDetails;
  communicationAddressDetails: AddressDetails;
  permanentAddressDetails: AddressDetails;
  contactDetails: ContactDetails;
  applicantFinancialDetails: ApplicantFinancialDetails;
  healthInformation: HealthInformation;
  lifestyleHabits: LifestyleHabits;
  nominees: Nominee[];
  genericDetails: GenericDetails;
  eiaDetails: EiaDetails;
  fundDetails: FundDetails;
  paymentDetails: PaymentDetails;
  payoutDetails: PayoutDetails;
}

export interface ProposerSummary {
  title?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  profileImage: string;
  caseStatus: string;
  document?: string;
  faceMatchPercentage?: string | number;
  imageQuality?: string;
  documentRemarks?: string;
}

export interface PersonalDetails {
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
  location: Location;
  occupation: Occupation;
}

export interface Location {
  city: string;
  country: string;
}

export interface Occupation {
  type: string;
  designation: string;
  organization: string;
}

export interface FinancialDetails {
  annualIncome: number;
  appliedSumAssured: number;
  trsa: number;
  tfsa: number;
}

export interface SummaryPolicyDetails {
  productName: string;
  productType: string;
  modalPremium: number;
  channel: string;
}

export interface Underwriting {
  remarks: string;
  breDecision: BreDecision;
}

export interface BreDecision {
  status: string;
  category: string;
  coverage: string;
}

export interface ApplicantDetails {
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  countryOfResidence: string;
  education: string;
  residentStatus: string;
  designation: string;
  disabled: string;
  percentageOfImpairment: string;
  typeOfImpairment: string;
  udidNumber: string;
  udsLink?: string;
}

export interface KycDetails {
  panNumber: string;
  identityProofType: string;
  identityProofNumber: string;
  addressProof: string;
  ageProof: string;
  incomeProof: string;
  existingCkycNumber: string;
  pep: boolean;
  criminalProceedings: string;
  panFlag: string;
  panAadharSeedingStatus: string;
  identityProofExpiryDate: string;
  pranNo: string;
  pranNoVerifivation: string;
}

export interface AddressDetails {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface ContactDetails {
  mobileNumber: number;
  emailId: string;
  alternateMobile: number;
  landlineNumber: number;
  emailPref: string;
  smsPref: string;
  std: number;
}

export interface ApplicantFinancialDetails {
  occupation: string;
  annualIncome: number;
  gstin: string;
  organisationType: string;
  organisationName: string;
}

export interface HealthInformation {
  height: string;
  weight: string;
  diabetes: string;
  hypertension: string;
  heartDisease: string;
  cancer: string;
  kidneyDisease: string;
  liverDisease: string;
  lungDisease: string;
  neurologicalDisorder: string;
  mentalDisorder: string;
  hivAids: string;
  anySurgery: string;
  hospitalization: string;
  otherIllness: string;
  familyHeartDisease: string;
  familyCancer: string;
  familyDiabetes: string;
  gynecologicalHistory: string;
  pregnancyHistory: string;
  miscarriageHistory: string;
}

export interface LifestyleHabits {
  alcoholConsumption: string;
  alcoholQuantity: string;
  smoking: string;
  smokingQuantity: string;
  tobaccoGutka: string;
  narcotics: string;
  hazardousOccupation: string;
  aviationActivities: string;
  diving: string;
  mountaineering: string;
  otherHazardousActivities: string;
  racing: string;
}

export interface Nominee {
  nomineeName: string;
  nomineeDOB: string;
  gender: string;
  relationship: string;
  accountNumber: string;
  ifsc: string;
  sharePercentage: number;
  appointeeName: string;
  appointeeGender: string;
  appointeeDOB: string;
  appointeeRelationship: string;
}

export interface GenericDetails {
  existingPolicyNumber: string;
  clientId: string;
  selfProposed: string;
  typeOfProposer: string;
  relationshipWithLifeAssured: string;
  typeOfProposal: string;
}

export interface EiaDetails {
  openEIA: string;
  existingEIANumber: string;
  preferredRepository: string;
  convertPolicies: string;
}

export interface FundDetails {
  allocationStrategy: string;
  totalAllocation: string;
  atpOpted: string;
  fundDetail: FundDetail[];
}

export interface FundDetail {
  name: string;
  amount: string;
  sourceFund: string;
  targetFund: string;
  switchDate: string;
  transferPercentage: string;
}

export interface PaymentDetails {
  isThirdPartyPayment: string;
}

export interface PayoutDetails {
  accountType: string;
  bankType: string;
  branch: string;
  micrCode: string;
  ifscCode: string;
  accountNumber: string;
  paymentOptions: string;
}

export interface ApplicantProfile {
  applicantDetails: ApplicantDetails;
  kycDetails: KycDetails;
  communicationAddressDetails: AddressDetails;
  permanentAddressDetails: AddressDetails;
  contactDetails: ContactDetails;
  applicantfinancialDetails: ApplicantFinancialDetails;
  healthInformation: HealthInformation;
  lifestyleHabits: LifestyleHabits;
  nominees: Nominee[];
  genericDetails: GenericDetails;
  eiaDetails: EiaDetails;
}

export type ApplicantInfoTab =
  | "imageDetails"
  | "personalKyc"
  | "contactAddress"
  | "financialProfession"
  | "medicalLifestyle"
  | "nominee"
  | "generic"
  | "eia"
  | "fundDetails"
  | "paymentPayoutDetails";

export type NomineeRow = Nominee;

export type FieldProps = {
  label: string;
  value: string;
};

export interface ApplicantEditForm {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  nationality: string;
  residentStatus: string;

  panNumber: string;
  pranNo: string;
  identityProofType: string;
  identityProofNumber: string;
  addressProof: string;
  ageProof: string;
  incomeProof: string;

  faceValue: string;

  communicationAddressLine1: string;
  communicationAddressLine2: string;
  communicationAddressLine3: string;
  communicationCity: string;
  communicationState: string;
  communicationCountry: string;
  communicationPincode: string;

  permanentAddressLine1: string;
  permanentAddressLine2: string;
  permanentAddressLine3: string;
  permanentCity: string;
  permanentState: string;
  permanentCountry: string;
  permanentPincode: string;
}

export interface ApplicantProfileSubmitRequest {
  data: DRSData;
  applicationNo: string;
  userId: string;
  roleType: string;
  sections: string[];
  isAcuity?: boolean;
}

export interface ApplicantProfileSubmitResponse {
  success: boolean;
  message: string;
  updatedDetails?: Partial<ApplicantEditForm>;
}

export interface CustomerProfileForm {
  productApplied: string;
  appliedSumAssured: string;
  lifeAssuredName: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  education: string;
  occupation: string;
  designation: string;
  companyName: string;
  earnedIncome: string;
  website: string;
  personalLinkedInProfile: string;
  pep: string;
  criminalHistory: string;
  location: string;
  annualIncome: string;
  modalPremium: string;
}

export interface CustomerProfileSubmitRequest {
  applicationId: string;
  roleType: string;
  userId: string;
  updatedDetails: CustomerProfileForm;
}

export interface CustomerProfileSubmitResponse {
  success: boolean;
  message: string;
  updatedDetails?: Partial<CustomerProfileForm>;
}

export type AuditTrailRow = {
  dateTime: string;
  fromPool: string;
  fromPoolUser: string;
  toPool: string;
  toPoolUser: string;
  subPool: string;
  userId: string;
  uwDecision: string;
  breDecision: string;
  remarks: string;
  userRemarks: string;
};

export type AuditTrail = AuditTrailRow[];

export type AuditTrailRequest = {
  applicationId: string;
  roleType?: string;
};

export type AuditTrailResponse = {
  auditTrail?: AuditTrail;
  auditTrailData?: AuditTrail;
  data?: {
    auditTrail?: AuditTrail;
  };
};

export type OpenOtherTaskRow = {
  serviceID: string;
  ct: string;
  st: string;
  breDate: string;
  breDecision: string;
  breDiscrepancy: string;
  breRemarks: string;
  userPool: string;
};

export type OpenOtherTasks = OpenOtherTaskRow[];

export type OpenOtherTasksRequest = {
  applicationId: string;
  roleType?: string;
};

export type OpenOtherTasksResponse = {
  openOtherTasks?: OpenOtherTasks;
  data?: {
    openOtherTasks?: OpenOtherTasks;
    quickLinks?: {
      openOtherTasks?: OpenOtherTasks;
    };
  };
  quickLinks?: {
    openOtherTasks?: OpenOtherTasks;
  };
};

export type RiskDetailsRow = {
  riskReferralDate: string;
  riskRevertDate: string;
  riskDecision: string;
  riskReportValues: string;
};

export type RiskDetails = RiskDetailsRow[];

export type RiskDetailsRequest = {
  applicationId: string;
  roleType?: string;
};

export type RiskDetailsResponse = {
  riskDetails?: RiskDetails;
  data?: {
    riskDetails?: RiskDetails;
    quickLinks?: {
      riskDetails?: RiskDetails;
    };
  };
  quickLinks?: {
    riskDetails?: RiskDetails;
  };
};

export interface ApplicationDetails {
  applicationId: string;
  dob: string;
  nameOfProposer: string;
  productOpted: string;
  planOpted: string;
  appliedSA: string;
  premium: number;
  clientType: string;
  lastBucket: string;
  lastUser: string;
  roleType: string;
}
export type MasterRequest = {
  types:string[];
};

export interface MiscMaster {
  code: string;
  description: string;
  value: string;
  isActive: string;
  miscMastId: string;
}

export type MasterResponse = {
  data: {
    misc: MiscMaster[];
  };
};