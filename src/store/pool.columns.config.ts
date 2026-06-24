const baseColumns = [
  "applicationNo",
  "appliedSa",
  "annualPremium",
  "productType",
  "drc",
  "hniFlag",
  "isMedical",
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

export const poolAllowedColumns: Record<string, string[]> = {
  "CVT Pool": [...baseColumnsCops],

  "CPT Pool": [...baseColumnsCops,"medicalReceivedDate","financialReceivedDate","poolTAT"],

  "PIVV Pool": [...baseColumnsCops],

  "Pre Issuance Servicing Pool": [...baseColumnsCops],

  "Exceptional Pool": [...baseColumnsCops, "lastPool"],
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
  "Reject Pool": [...baseColumnsCops, "lastPool", "userId",
    "uwDecisionDate","laDecisionDate"],
  "Ready For Issuance Pool": [...baseColumnsCops, "lastPool"],
  "Issuance Pool": [...baseColumnsCops, "uwDecisionDate","laDecisionDate"],
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
};
