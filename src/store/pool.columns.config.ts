export const poolAllowedColumns: Record<string, string[]> = {
  "CVT Pool": [
    "applicationNo",
    "productCode",
    "masterPlanNo",
    "poolTAT",
    "productType",
    "sumAssured",
    "annualPremium",
    "channel",
    "status",
  ],

  "CPT Pool": [
    "applicationNo",
    "productType",
    "sumAssured",
    "premium",
    "channel",
    "roleType",
  ],

  "Pending Pools": [
    "applicationNo",
    "status",
    "caseType",
    "channel",
    "product",
  ],
};