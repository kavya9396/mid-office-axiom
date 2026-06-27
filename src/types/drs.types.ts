export type GrieavanceReport = {
  id: number;
  report: string;
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
  reports: GrieavanceReport[];
};

export type GrievanceSubmitRequest = {
  applicationId: string;
  roleType?: string;
  remarks: string;
  reports: GrieavanceReport[];
};

export type GrievanceSubmitResponse = {
  success: boolean;
  message: string;
};

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
  breDecision: BreDecisionResponse;
  applicationOverview: ApplicationOverview;
  summary: SummaryResponse[];
  riderDetails: RiderDetail[];
  requirements: AdditionalRequirementRow[];
  auditTrail: AuditTrail;
  pivvSection: PivvSection;
};

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
  decision: "Refer to IT";
};

export type ReferToITResponse = {
  success: boolean;
  message: string;
};

export type BreRetriggerRequest = {
  applicationId: string;
  roleType: string;
};

export type BreRetriggerResponse = {
  breDecision: BreDecisionResponse & {
    medicalDecision?: string | null;
    medicalDecisionDate?: string | null;
    medicalDiscrepancy?: string | null;
    medicalRemarks?: string | null;
    financialDecision?: string | null;
    financialDecisionDate?: string | null;
    financialDiscrepancy?: string | null;
    financialRemarks?: string | null;
  };
};

export interface BreDecisionResponse {
  decision: string | null;
  status: string | null;
  remarks: string | null;
  discrepancy: string | null;
  timestamp: string | null;
  retrigger: boolean | null;
}

export interface ApplicationOverview {
  product: Product;
  distribution: Distribution;
  agent: Agent;
  customer: Customer;
  policyDetails: PolicyDetails;
}

export interface Product {
  name: string;
  sumAssured: number;
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

export interface PolicyDetails {
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
  label: string;
  value: string;
};

export type MasterKey =
  | "gender"
  | "nationality"
  | "idProof"
  | "addressProof"
  | "state"
  | "country";

export type MastersData = Partial<Record<MasterKey, MasterOption[]>>;

export type MastersRequest = {
  masters: MasterKey[];
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

export type ApplicantTab = "proposer" | "lifeassured1" | "lifeassured2";

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
  policyDetails: PolicyDetails;
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
}

export interface ProposerSummary {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  profileImage: string;
  caseStatus: string;
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
  tfesa: number;
}

export interface PolicyDetails {
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
}

export interface KycDetails {
  panNumber: string;
  identityProofType: string;
  identityProofNumber: string;
  addressProof: string;
  incomeProof: string;
  existingCkycNumber: string;
  pep: boolean;
  criminalProceedings: string;
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
  mobileNumber: string;
  emailId: string;
  alternateMobile: string;
  landlineNumber: string;
  emailPref: string;
  smsPref: string;
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
  | "personalKyc"
  | "contactAddress"
  | "financialProfession"
  | "medicalLifestyle"
  | "nominee"
  | "generic"
  | "eia";

export type NomineeRow = Nominee;

export type FieldProps = {
  label: string;
  value: string;
};

export interface ApplicantEditForm {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  nationality: string;

  panNumber: string;
  identityProofType: string;
  identityProofNumber: string;
  addressProof: string;

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
  applicationId: string;
  roleType: string;
  memberType: ApplicantTab;
  updatedDetails: Partial<ApplicantEditForm>;
}

export interface ApplicantProfileSubmitResponse {
  success: boolean;
  message: string;
  updatedDetails?: Partial<ApplicantEditForm>;
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
};

export type AuditTrail = AuditTrailRow[];

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
