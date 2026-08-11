export interface RoleField {
  label: string;
  path: string;
}

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
    path: "policyDetails.policyType",
  },
];

const PLAN_FIELDS: RoleField[] = [
  {
    label: "Plan Name",
    path: "productDetail.0.type",
  },
];

const PREMIUM_FIELDS: RoleField[] = [
  {
    label: "Modal Premium",
    path: "productDetail.0.modalPremium",
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
  },{
    label: "TRSA",
    path: "sourcingDetail.paymentMode",
  },{
    label: "TFSA",
    path: "sourcingDetail.tfsa",
  }
];

export const roleWiseConfig: Record<string, RoleField[]> = {
  CVT_TASK: [
    ...COMMON_FIELDS,
    ...PLAN_FIELDS,
    {
      label: "Face Value",
      path: "productDetail.0.faceValue",
    },
  ],

  CPT_DATA_ENTRY_NMR_TASK: [
    ...COMMON_FIELDS,
    ...PREMIUM_FIELDS,
  ],

  CPT_DATA_ENTRY_MR_TASK: [
    ...COMMON_FIELDS,
    ...PREMIUM_FIELDS,
  ],

  PRE_ISSUANCE_SERVICING_TASK: [
    ...COMMON_FIELDS,
    ...PREMIUM_FIELDS,
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
    ...COMMON_FIELDS,
    ...PLAN_FIELDS,
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
    ...COMMON_FIELDS,
    ...PLAN_FIELDS,
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

  DVT_TASK: [
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
  ],

  DVT_FORMAL_TASK: [
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
  ],
};