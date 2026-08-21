export interface RoleField {
  label: string;
  path: string;
}

export type BusinessType = "retail" | "group" | null;

export type RoleType =
  | "CVT_TASK"
  | "CPT_DATA_ENTRY_NMR_TASK"
  | "CPT_DATA_ENTRY_MR_TASK"
  | "PRE_ISSUANCE_SERVICING_TASK"
  | "POST_ISSUANCE_SERVICING_TASK"
  | "REINSTATEMENT_TASK"
  | "DVT_TASK"
  | "DVT_FORMAL_TASK"
  | "PIVV_TASK"
  | "EXCEPTIONAL_TASK"
  | "SYSTEM_WAIT_POOL_AMR_MEDICAL"
  | "SYSTEM_WAIT_POOL_AMR_NON_MEDICAL"
  | "RECONSIDERATION_TASK"
  | "REJECT_TASK"
  | "READY_FOR_ISSUANCE_TASK"
  | "ISSUANCE_TASK"
  | "REASSIGN_TRANSFER_TASK"
  | "FORCE_CLOSE_TASK"
  | "ALLOCATION_TASK"
  | "LEAVE_MANAGEMENT_TASK"
  | "CUW_TASK"
  | "HOD_TASK"
  | "SR_UW_TASK"
  | "CMO_TASK"
  | "RI_TASK"
  | "RISK_TASK"
  | "REQUIREMENT_POOL"
  | "PRE_LOGIN_CUW_TASK"
  | "MMT_TASK"
  | "GRIEVANCE_TASK"
  | "CUW_CLAIM_AUDIT_TASK"
  | "SUW_TASK"
  | "VENDOR_CMO_TASK"
  | "TELE_VIDEO_TASK"
  | "AMR_MEDICAL_POOL"
  | "IT_TASK"
  | "ACUITY_TASK"
  | "GUW_TASK"
  | "GUW_FORMAL_TASK";

const COMMON_FIELDS: RoleField[] = [
  {
    label: "Product Name",
    path: "productDetail.0.name",
  },
  {
    label: "Agent Code",
    path: "sourcingDetail.agentCode",
  },
  {
    label: "Agent Name",
    path: "sourcingDetail.agentName",
  },
  {
    label: "Sum Assured",
    path: "productDetail.0.sumAssured",
  },
  {
    label: "Customer Type",
    path: "productDetail.0.customerType",
  },
  {
    label: "Channel",
    path: "sourcingDetail.channelCode",
  },
  {
    label: "Sub Channel",
    path: "sourcingDetail.subChannelCode",
  },
  {
    label: "Policy Type",
    path: "productDetail.0.policyType",
  },
];

const PLAN_FIELDS: RoleField[] = [
  {
    label: "Plan Name",
    path: "productDetail.0.planName",
  },
];

const PREMIUM_FIELDS: RoleField[] = [
  {
    label: "Modal Premium",
    path: "productDetail.0.faceValue",
  },
  {
    label: "Policy Term",
    path: "productDetail.0.policyTerm",
  },
  {
    label: "Premium Payment Term",
    path: "productDetail.0.premiumPaymentTerm",
  },
  {
    label: "Payment Mode",
    path: "policyDetails.paymentMode",
  },
  {
    label: "TRSA",
    path: "policyDetails.paymentMode",
  },
  {
    label: "TFESA",
    path: "policyDetails.paymentMode",
  },
];

const RETAIL_COMMON_PLAN_FIELDS: RoleField[] = [
  ...COMMON_FIELDS,
  ...PLAN_FIELDS,
];

const RETAIL_COMMON_PREMIUM_FIELDS: RoleField[] = [
  ...COMMON_FIELDS,
  ...PREMIUM_FIELDS,
];

const GROUP_TASK_FIELDS: RoleField[] = [
  ...COMMON_FIELDS,
  {
    label: "Applied Sum Assured",
    path: "productDetail.0.sumAssured",
  },
  {
    label: "Premium",
    path: "productDetail.0.faceValue",
  },
  {
    label: "Policy Term",
    path: "productDetail.0.policyTerm",
  },
  {
    label: "Premium Payment Term",
    path: "productDetail.0.premiumPaymentTerm",
  },
  {
    label: "Payment Mode",
    path: "policyDetails.paymentMode",
  },
  {
    label: "Master Policy No.",
    path: "policyDetails.masterPolicyNo",
  },
  {
    label: "LAN No.",
    path: "policyDetails.lanNo",
  },
  {
    label: "Login Date",
    path: "policyDetails.loginDate",
  },
];

const GROUP_FORMAL_TASK_FIELDS: RoleField[] = [
  {
    label: "Policy No.",
    path: "productDetail.0.name",
  },
  {
    label: "Agent Code",
    path: "sourcingDetail.agentCode",
  },
  {
    label: "Agent Name",
    path: "sourcingDetail.agentName",
  },
  {
    label: "Applied Sum Assured",
    path: "productDetail.0.sumAssured",
  },
  {
    label: "Channel",
    path: "sourcingDetail.channelCode",
  },
  {
    label: "Sub Channel",
    path: "sourcingDetail.subChannelCode",
  },
  {
    label: "Premium",
    path: "productDetail.0.faceValue",
  },
  {
    label: "Cover Requested",
    path: "productDetail.0.policyTerm",
  },
  {
    label: "Cover Provided",
    path: "productDetail.0.premiumPaymentTerm",
  },
  {
    label: "Free Cover",
    path: "policyDetails.freeCover",
  },
  {
    label: "Cover Above FCL",
    path: "policyDetails.coverAboveFcl",
  },
];

/**
 * Retail configuration
 */
const RETAIL_ROLE_CONFIG: Partial<Record<RoleType, RoleField[]>> = {
  CVT_TASK: [
    ...RETAIL_COMMON_PLAN_FIELDS,
    {
      label: "Face Value",
      path: "productDetail.0.faceValue",
    },
  ],

  CPT_DATA_ENTRY_NMR_TASK: [
    ...RETAIL_COMMON_PREMIUM_FIELDS,
    {
      label: "Proposer Name",
      path: "policyDetails.proposerName",
    },
  ],

  CPT_DATA_ENTRY_MR_TASK: [
    ...RETAIL_COMMON_PREMIUM_FIELDS,
    {
      label: "Application Issued Date",
      path: "application.issuedDate",
    },
  ],

  PRE_ISSUANCE_SERVICING_TASK: [
    ...RETAIL_COMMON_PREMIUM_FIELDS,
    {
      label: "Proposer Name",
      path: "policyDetails.proposerName",
    },
    {
      label: "Life Assured Name",
      path: "policyDetails.lifeAssuredName",
    },
  ],

  POST_ISSUANCE_SERVICING_TASK: [
    ...RETAIL_COMMON_PREMIUM_FIELDS,
    {
      label: "Application Issued Date",
      path: "application.issuedDate",
    },
    {
      label: "UW Decision Date",
      path: "underwriting.decisionDate",
    },
  ],

  REINSTATEMENT_TASK: [
    ...RETAIL_COMMON_PLAN_FIELDS,
    {
      label: "Application Issued Date",
      path: "application.issuedDate",
    },
    {
      label: "UW Decision Date",
      path: "underwriting.decisionDate",
    },
    {
      label: "Policy Status",
      path: "policyDetails.policyStatus",
    },
  ],

  PIVV_TASK: RETAIL_COMMON_PLAN_FIELDS,
  EXCEPTIONAL_TASK: RETAIL_COMMON_PLAN_FIELDS,
  SYSTEM_WAIT_POOL_AMR_MEDICAL: RETAIL_COMMON_PLAN_FIELDS,
  SYSTEM_WAIT_POOL_AMR_NON_MEDICAL: RETAIL_COMMON_PLAN_FIELDS,
  RECONSIDERATION_TASK: RETAIL_COMMON_PLAN_FIELDS,
  REJECT_TASK: RETAIL_COMMON_PLAN_FIELDS,
  READY_FOR_ISSUANCE_TASK: RETAIL_COMMON_PLAN_FIELDS,
  ISSUANCE_TASK: RETAIL_COMMON_PLAN_FIELDS,
  REASSIGN_TRANSFER_TASK: RETAIL_COMMON_PLAN_FIELDS,
  FORCE_CLOSE_TASK: RETAIL_COMMON_PLAN_FIELDS,
  ALLOCATION_TASK: RETAIL_COMMON_PLAN_FIELDS,
  LEAVE_MANAGEMENT_TASK: RETAIL_COMMON_PLAN_FIELDS,
  CUW_TASK: RETAIL_COMMON_PLAN_FIELDS,
  HOD_TASK: RETAIL_COMMON_PLAN_FIELDS,
  SR_UW_TASK: RETAIL_COMMON_PLAN_FIELDS,
  CMO_TASK: RETAIL_COMMON_PLAN_FIELDS,
  RI_TASK: RETAIL_COMMON_PLAN_FIELDS,
  RISK_TASK: RETAIL_COMMON_PLAN_FIELDS,
  REQUIREMENT_POOL: RETAIL_COMMON_PLAN_FIELDS,
  PRE_LOGIN_CUW_TASK: RETAIL_COMMON_PLAN_FIELDS,
  MMT_TASK: RETAIL_COMMON_PLAN_FIELDS,
  GRIEVANCE_TASK: RETAIL_COMMON_PLAN_FIELDS,
  CUW_CLAIM_AUDIT_TASK: RETAIL_COMMON_PLAN_FIELDS,
  SUW_TASK: RETAIL_COMMON_PLAN_FIELDS,
  VENDOR_CMO_TASK: RETAIL_COMMON_PLAN_FIELDS,
  TELE_VIDEO_TASK: RETAIL_COMMON_PLAN_FIELDS,
  AMR_MEDICAL_POOL: RETAIL_COMMON_PLAN_FIELDS,
  IT_TASK: RETAIL_COMMON_PLAN_FIELDS,
  ACUITY_TASK: RETAIL_COMMON_PLAN_FIELDS,
};

/**
 * Group configuration
 */
const GROUP_ROLE_CONFIG: Partial<Record<RoleType, RoleField[]>> = {
  DVT_FORMAL_TASK: GROUP_FORMAL_TASK_FIELDS,
  GUW_FORMAL_TASK: GROUP_FORMAL_TASK_FIELDS,
  DVT_TASK: GROUP_TASK_FIELDS,
  PRE_ISSUANCE_SERVICING_TASK: GROUP_TASK_FIELDS,
  SYSTEM_WAIT_POOL_AMR_MEDICAL: GROUP_TASK_FIELDS,
  SYSTEM_WAIT_POOL_AMR_NON_MEDICAL: GROUP_TASK_FIELDS,
  RECONSIDERATION_TASK: GROUP_TASK_FIELDS,
  REJECT_TASK: GROUP_TASK_FIELDS,
  READY_FOR_ISSUANCE_TASK: GROUP_TASK_FIELDS,
  ISSUANCE_TASK: GROUP_TASK_FIELDS,
  REASSIGN_TRANSFER_TASK: GROUP_TASK_FIELDS,
  GUW_TASK: GROUP_TASK_FIELDS,
};

/**
 * Returns fields based on both role and business type.
 */
export const getRoleWiseConfig = (
  roleType: string,
  businessType: BusinessType = "retail",
): RoleField[] => {
  const config =
    businessType === "group" ? GROUP_ROLE_CONFIG : RETAIL_ROLE_CONFIG;

  return config[roleType as RoleType] ?? [];
};