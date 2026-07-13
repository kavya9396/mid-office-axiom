const baseColumns = [
  "applicationNo",
  "appliedSa",
  "annualPremium",
  "productType",
  "drc",
  "hniFlag",
  "isMedical",
  "breDecision",
  "munichReMedicalDecision",
  "channel",
  "ptlr",
  "roleType",
  "poolTAT"
] as const;
const baseColumnsCops = [
  "applicationNo",
  "channel",
  "sumAssured",
  "product",
  "premium",
  "clientType",
  "caseType",
] as const;
const baseColumnsGops = [
  "applicationNo",
  "productCode",
  "masterPlanNo",
  "poolTAT",
  "productType",
  "typeOfGroupBusiness",
  "sumAssured",
  "caseReceivedDate",
] as const;

export const poolAllowedColumns: Record<string, string[]> = {
  //retail
  CMO_TASK: [...baseColumns],
  CVT_TASK: [...baseColumnsCops, "breDecision"],
  CPT_TASK: [
    ...baseColumnsCops,
    "medicalReceivedDate",
    "financialReceivedDate",
    "poolTAT",
  ],
  CUW_TASK: [...baseColumns],
  HOD_TASK: [
    ...baseColumns
  ],
  MMT_TASK: [
    "applicationNo",
    "nameOfProposer",
    "nameOfLifeAssured",
    "productOpted",
    "medicalRaisedDate",
    "planOpted"
  ],
  SR_UW_TASK: [
    ...baseColumns
  ],
  SUW_TASK: [
    ...baseColumns
  ],
  VENDOR_CMO_TASK: [...baseColumns],
  COPS_TASK: [...baseColumnsCops, "breDecision"],
  IT_TASK: [...baseColumns],

  //group
  PIVV_TASK: [...baseColumnsCops],

  PRE_ISSUANCE_SERVICING_TASK: [...baseColumnsCops],

  EXCEPTIONAL_TASK: [...baseColumnsCops, "lastPool"],
  "System Wait Pool - Non medical": [
    ...baseColumnsCops,
    "lastPool",
    "requirementRaisedDate",
    "userId",
  ],
  "AMR - Non medical": [
    ...baseColumnsCops,
    "lastPool",
    "requirementRaisedDate",
    "userId",
  ],
  "Reconsideration Pool": [
    ...baseColumnsCops,
    "lastPool",
    "userId",
    "uwDecisionDate",
    "poolTAT",
    "dueDate",
  ],
  "Reject Pool": [
    ...baseColumnsCops,
    "lastPool",
    "userId",
    "uwDecisionDate",
    "laDecisionDate",
  ],
  "Ready For Issuance Pool": [...baseColumnsCops, "lastPool"],
  "Issuance Pool": [...baseColumnsCops, "uwDecisionDate", "laDecisionDate"],
  "Allocation Details": [...baseColumns],
  "Leave Management": [
    "uwName",
    "userId",
    "leaveDateFrom",
    "leaveDateTill",
    "leaveReason",
    "caseToReassignToUw",
    "reassignedUserId",
  ],
  "Reassign/Transfer Cases": [
    "applicationNo",
    "nameOfProposer",
    "nameOfLifeAssured",
    "product",
    "plan",
    "appliedSa",
    "caseStatus",
    "caseInWhichPool",
    "userId",
    "reassignedUserId",
    "remarks",
  ],

  "System Wait Pool": [
    ...baseColumnsCops,
    "lastPool",
    "requirementRaisedDate",
    "userId",
  ],
  "AMR - Medical Pool": [
    ...baseColumnsCops,
    "lastPool",
    "requirementRaisedDate",
    "userId",
  ],
  DVT_TASK: [...baseColumnsGops],
  "1st UW Pool": [...baseColumns],
  GUW_TASK: [...baseColumnsGops],
  DVT_FORMAL_TASK:["policyNo","applicationNo","productCode","memberName","poolTAT","appliedCover"],
  GUW_FORMAL_TASK:["policyNo","applicationNo","productCode","memberName","poolTAT","appliedCover"],
  GRIEVANCE_TASK:[ "applicationNo",
    "nameOfProposer",
    "nameOfLifeAssured",
    "grievanceRaisedDate",
  ]
};
