export type PreLoginRequest = {
  applicationNumber: string;
};

export interface PreLoginMedicalProfile {
  pastMedicalHistory: string;
  currentMedicalHistory: string;
  remarks: string;
}

export interface PreLoginCustomerDetails {
  type: string;
  name: string;
  dob: string;
  gender: string;
  occupation: string;
  companyName: string;
  website: string;
  linkedinProfile: string;
  designation: string;
  earnedIncome: string;
  pep: string;
  proposerName: string;
  pan: string;
  mobileNo: string;
  emailId: string;
  medicalProfile: PreLoginMedicalProfile;
}

export interface PreLoginCustomerProfile {
  type: string;
  customerDetails: PreLoginCustomerDetails[];
}

export interface PreLoginProductDetail {
  code: string;
  name: string;
  premium: number;
  sumAssured: number;
}

export interface PreLoginSourcingDetail {
  agentCode: string;
  salesChannel: string;
  channelCode: string;
}

export interface PreLoginExistingInsurance {
  policyNumber: string;
  plan: string;
  type: string;
  companyName: string;
  sumAssured: string;
  dateOfCommencement: string;
  acceptanceTerms: string;
  policyStatus: string;
}

export interface PreLoginSimultaneousPolicy {
  companyName: string;
  sumAssured: string;
  type: string;
  plan: string;
  policyStatus: string;
}

export interface PreLoginInsuranceDetail {
  type: string;
  existingInsurance: PreLoginExistingInsurance[];
  simultaneousPolicies: PreLoginSimultaneousPolicy[];
}

export interface PreLoginApprovalRequired {
  financial: boolean;
  medical: boolean;
}

export interface PreLoginData {
  applicationNumber: string;
  submitDate: string;
  sourceSystem: string;
  totalPremium: string;
  caseType: string;
  customerProfile: PreLoginCustomerProfile[];
  productDetail: PreLoginProductDetail;
  sourcingDetail: PreLoginSourcingDetail;
  insuranceDetails: PreLoginInsuranceDetail[];
  approvalReqdFor: PreLoginApprovalRequired;
}

export interface PreLoginResponse {
  success: boolean;
  data: PreLoginData;
}