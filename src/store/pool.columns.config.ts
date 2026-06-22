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

  "CPT Pool": [...baseColumnsCops],

  "PIVV Pool": [...baseColumnsCops],

  "Pre Issuance Servicing Pool": [...baseColumnsCops],

  "Exceptional Pool": [...baseColumnsCops, "lastPool"],
  "System Wait Pool - Non medical":[...baseColumnsCops, "lastPool"],
  "AMR - Non medical":[...baseColumnsCops, "lastPool"],
  "Reconsideration Pool":[...baseColumnsCops, "lastPool"],
  "Reject Pool":[...baseColumnsCops, "lastPool"],
  "Ready for Issuance Pool":[...baseColumnsCops, "lastPool"],
  "Issuance Pool":[...baseColumnsCops, "lastPool"],
  "Allocation Details":[...baseColumns],
  "Leave Management":["uwName","userId","leaveDateFrom","leaveDateTill","leaveReason","caseToReassignToUw","reassignedUserId"],
  "Reassign/Transfer Cases":["applicationNo","nameOfProposer","nameOfLifeAssured","product","plan","appliedSa","caseStatus","caseInWhichPool","userId","reassignedUserId","remarks"]
};