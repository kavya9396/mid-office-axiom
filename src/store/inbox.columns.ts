import type { TableColumn, tableData } from "../types/inbox";

export const allColumns: TableColumn<tableData>[] = [
  {
    key: "applicationNo",
    label: "Application No.",
  },
   {
    key: "appliedSa",
    label: "Applied SA",
    numeric: true,
  },
  {
    key: "productCode",
    label: "Product Code",
    numeric: true,
  },
  {
    key: "masterPlanNo",
    label: "Master Plan No.",
    numeric: true,
  },
  {
    key: "poolTAT",
    label: "Pool TAT (Hrs)",
  },
  {
    key: "productType",
    label: "Product Type",
  },
  {
    key: "typeOfGroupBusiness",
    label: "Type of Group Business",
  },
  {
    key: "sumAssured",
    label: "Sum Assured (₹)",
  },
  {
    key: "annualPremium",
    label: "Annual Premium (₹)",
  },
  {
    key: "dateAndTimeStamp",
    label: "Date/Time Stamp",
  },
  {
    key: "drc",
    label: "DRC",
  },
  {
    key: "hniFlag",
    label: "HNI Flag",
  },
  {
    key: "ptlr",
    label: "PTLR",
  },
  {
    key: "breDecision",
    label: "BRE Decision",
  },
  {
    key: "channel",
    label: "Channel",
  },
  {
    key: "munichReMedicalDecision",
    label: "Munich Re Medical Decision",
  },
  {
    key: "roleType",
    label: "Role Type",
  },
  {
    key: "isMedical",
    label: "Medical/Non Medical",
  },
  {
    key: "clientType",
    label: "Client Type",
  },
  {
    key: "caseType",
    label: "Case Type",
  },
  {
    key: "lastPool",
    label: "Last Pool",
  },
  {
    key: "product",
    label: "Product",
  },
  {key:"uwName",label:"UW Name"},
  {key:"userId",label:"User ID"},
  {key:"leaveDateFrom",label:"Leave Date From"},
  {key:"leaveDateTill",label:"Leave Date Till"},
  {key:"leaveReason",label:"Leave Reason"},
  {key:"caseToReassignToUw",label:"Case To Reassign To UW"},
  {key:"reassignedUserId",label:"Reassigned User ID"},
  {key:"roles",label:"Roles"},
  {key:"authorityLimitFrom",label:"Authority Limit From"},
  {key:"authorityLimitTill",label:"Authority Limit Till"},
  {key:"startDate",label:"Start Date"},
  {key:"endDate",label:"End Date"},
  {key:"status",label:"Status"},
  {key:"premium",label:"Premium"}
];




