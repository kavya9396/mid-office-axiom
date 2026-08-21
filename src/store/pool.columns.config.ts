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
   PRE_LOGIN_CUW_TASK: [
    ...baseColumns
  ],
  HOD_TASK: [
    ...baseColumns
  ],
  RI_TASK:[...baseColumns],
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
  PIVV_TASK: [...baseColumnsCops],

  PRE_ISSUANCE_SERVICING_TASK: [...baseColumnsCops],

  EXCEPTIONAL_TASK: [...baseColumnsCops, "lastPool"],
  "SYSTEM_WAIT_POOL_AMR_MEDICAL": [
    ...baseColumnsCops,
    "lastPool",
    "requirementRaisedDate",
    "userId",
  ],
  "SYSTEM_WAIT_POOL_AMR_NON_MEDICAL": [
    ...baseColumnsCops,
    "lastPool",
    "requirementRaisedDate",
    "userId",
  ],
  RECONSIDERATION_TASK: [
    ...baseColumnsCops,
    "lastPool",
    "userId",
    "uwDecisionDate",
    "poolTAT",
    "dueDate",
  ],
  "REJECT_TASK": [
    ...baseColumnsCops,
    "lastPool",
    "userId",
    "uwDecisionDate",
    "laDecisionDate",
  ],
  "READY_FOR_ISSUANCE_TASK": [...baseColumnsCops, "lastPool"],
  "ISSUANCE_TASK": [...baseColumnsCops, "uwDecisionDate", "laDecisionDate"],
  "ALLOCATION_TASK": [...baseColumns],
  "LEAVE_MANAGEMENT_TASK": [
    "uwName",
    "userId",
    "leaveDateFrom",
    "leaveDateTill",
    "leaveReason",
    "caseToReassignToUw",
    "reassignedUserId",
  ],
  "REASSIGN_TRANSFER_TASK": [
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


 
  "1st UW Pool": [...baseColumns],
  GUW_TASK: [...baseColumnsGops],
  DVT_FORMAL_TASK:["policyNo","applicationNo","productCode","memberName","poolTAT","appliedCover"],
  GUW_FORMAL_TASK:["policyNo","applicationNo","productCode","memberName","poolTAT","appliedCover"],
  GRIEVANCE_TASK:[ "applicationNo",
    "nameOfProposer",
    "nameOfLifeAssured",
    "grievanceRaisedDate",
  ],
  //RISK_TASK:["applicationNo","nameOfProposer","nameOfLifeAssured","product","premium","channel","referredDate","riskStatus"]
  RISK_TASK:[...baseColumns],
  //group
   DVT_TASK: [...baseColumnsGops],

};
