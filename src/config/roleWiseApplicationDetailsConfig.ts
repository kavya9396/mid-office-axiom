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
      path: "applicationInfo.applicationDate",
    },
    {
      label: "UW Decision Date",
      path: "applicationInfo.decisionDate",
    },
  ],

  REINSTATEMENT_TASK: [
    ...COMMON_FIELDS,
    ...PLAN_FIELDS,
    {
      label: "Application Issued Date",
      path: "applicationInfo.applicationDate",
    },
    {
      label: "UW Decision Date",
      path: "applicationInfo.decisionDate",
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
      path: "productDetail.0.premium",
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
      path: "groupDetails.masterPolicyNo",
    },
    {
      label: "LAN No.",
      path: "sourcingDetail.lanNumber",
    },
    {
      label: "Login Date",
      path: "applicationInfo.applicationDate",
    },
  ],

  DVT_FORMAL_TASK: [
    {
      label: "Policy No.",
      path: "groupDetails.masterPolicyNo",
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
      path: "productDetail.0.premium",
    },
    {
      label: "Cover Requested",
      path: "groupDetails.coverRequested",
    },
    {
      label: "Cover Provided",
      path: "groupDetails.coverProvided",
    },
    {
      label: "Free Cover",
      path: "groupDetails.freeCover",
    },
    {
      label: "Cover Above FCL",
      path: "groupDetails.coverAboveFcl",
    },
  ],
};
export const getRoleFields = (role: string): RoleField[] => {
  return roleWiseConfig[role] ?? COMMON_FIELDS;
};

export type SearchApplicationBusinessType =
  | "retail"
  | "group";

const RETAIL_SEARCH_APPLICATION_FIELDS: RoleField[] = [
  {
    label: "DOB",
    path: "summary.1.personalDetails.dob",
  },
  {
    label: "Name of Proposer",
    path: "summary.0.personalDetails.firstName",
  },
  {
    label: "Name of Life Assured",
    path: "summary.1.personalDetails.firstName",
  },
  {
    label: "Product Opted",
    path: "summary.1.policyDetails.productName",
  },
  {
    label: "Plan Opted",
    path: "summary.1.policyDetails.productType",
  },
  {
    label: "Applied SA",
    path: "summary.1.financialDetails.appliedSumAssured",
  },
  {
    label: "Premium",
    path: "basicDetails.totalPremium",
  },
  {
    label: "Client Type",
    path: "summary.1.genericDetails.typeOfProposer",
  },
  {
    label: "Last Bucket",
    path: "quickLinks.auditTrail.0.toPool",
  },
  {
    label: "Last User",
    path: "quickLinks.auditTrail.0.toPoolUser",
  },
];

const GROUP_SEARCH_APPLICATION_FIELDS: RoleField[] = [
  {
    label: "DOB",
    path: "summary.1.personalDetails.dob",
  },
  {
    label: "Name of Proposer",
    path: "summary.0.personalDetails.firstName",
  },
  {
    label: "Name of Life Assured",
    path: "summary.1.personalDetails.firstName",
  },
  {
    label: "Product Opted",
    path: "applicationOverview.productDetail.0.name",
  },
  {
    label: "Plan Opted",
    path: "applicationOverview.productDetail.0.type",
  },
  {
    label: "Applied SA",
    path: "applicationOverview.groupDetails.coverRequested",
  },
  {
    label: "Premium",
    path: "basicDetails.totalPremium",
  },
  {
    label: "Client Type",
    path: "summary.1.genericDetails.typeOfProposer",
  },
  {
    label: "Master Policy No.",
    path: "applicationOverview.groupDetails.masterPolicyNo",
  },
  {
    label: "LAN No.",
    path: "applicationOverview.sourcingDetail.lanNumber",
  },
  {
    label: "Last Bucket",
    path: "quickLinks.auditTrail.0.toPool",
  },
  {
    label: "Last User",
    path: "quickLinks.auditTrail.0.toPoolUser",
  },
];

export const searchApplicationConfig: Record<
  SearchApplicationBusinessType,
  RoleField[]
> = {
  retail: RETAIL_SEARCH_APPLICATION_FIELDS,
  group: GROUP_SEARCH_APPLICATION_FIELDS,
};

export const getSearchApplicationFields = (
  businessType?: string,
): RoleField[] => {
  const normalizedBusinessType = String(
    businessType ?? "",
  )
    .trim()
    .toLowerCase();

  return normalizedBusinessType === "group"
    ? searchApplicationConfig.group
    : searchApplicationConfig.retail;
};