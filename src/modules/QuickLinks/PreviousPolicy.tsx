import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Pagination,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
//import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
//import BackButton from "../../components/layout/BackButton";
import { useAppContext } from "../../hooks/useAppContext";
// import {
//   getDRSPath,
//   getSearchApplicationPath,
// } from "../../routes/routes";
import { useAppDispatch } from "../../store/hooks";
import { drsThunk } from "../../store/thunks/drsThunk";
type PreviousPolicyItem = Record<string, unknown>;
import type { RootState } from "../../store/store";
import { formatDate } from "../../utils/dataFormat";

const defaultRowsPerPage = 3;

const tableHeaderCellSx = {
  backgroundColor: "#E45F14",
  borderColor: "rgba(255, 255, 255, 0.35)",
  color: "#FFFFFF",
  fontSize: { xs: 10, md: 11, xl: 12 },
  fontWeight: 600,
  lineHeight: 1.25,
  px: { xs: 0.4, md: 0.65, xl: 1 },
  py: 1.15,
  verticalAlign: "middle",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "normal",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const tableBodyCellSx = {
  borderColor: "#E7EBEF",
  color: "#263238",
  fontSize: { xs: 10, md: 11, xl: 12 },
  lineHeight: 1.35,
  px: { xs: 0.4, md: 0.65, xl: 1 },
  py: 1.1,
  verticalAlign: "middle",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "normal",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

type TableKey = "ipru" | "iibNonIpru" | "applicationForm";

type PaginationState = Record<
  TableKey,
  {
    page: number;
    rowsPerPage: number;
  }
>;

const initialPagination: PaginationState = {
  ipru: { page: 0, rowsPerPage: defaultRowsPerPage },
  iibNonIpru: { page: 0, rowsPerPage: defaultRowsPerPage },
  applicationForm: { page: 0, rowsPerPage: defaultRowsPerPage },
};

type ColumnSpec = {
  header: string;
  keys: string[];
  formatter?: (value: unknown) => string;
};

const getFirstSectionRows = (
  response: Record<string, unknown> | null,
  keys: string[]
): PreviousPolicyItem[] => {
  if (!response) {
    return [];
  }

  const responseRecord = toRecord(response as unknown);

  for (const key of keys) {
    const value = responseRecord[key];
    if (!Array.isArray(value)) {
      continue;
    }

    return value.filter(
      (item): item is PreviousPolicyItem =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item)
    );
  }

  return [];
};

const formatCurrency = (value?: unknown) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return `₹ ${numericValue.toLocaleString("en-IN")}`;
};

const formatDateOnly = (value: unknown): string => {
  if (value === undefined || value === null || value === "" || value === "-") {
    return "-";
  }

  const formattedDate = formatDate(
    value instanceof Date ? value : String(value),
    false,
  );

  return formattedDate || "-";
};

const IPRU_COLUMNS: ColumnSpec[] = [
  { header: "Policy Number", keys: ["policyNumber", "policyNo", "policy_number"] },
  { header: "Product Name", keys: ["productName", "product", "product_name", "companyName"] },
  { header: "Product Type", keys: ["productType", "product_type"] },
  { header: "Date of issuance", keys: ["dateOfIssuance", "dateOfIssue", "issueDate", "date_of_issuance", "policyIssueDate"], formatter: formatDateOnly },
  { header: "UW Decision", keys: ["uwDecision", "uw_decision", "underwritingDecision", "decision"] },
  { header: "Applied Sum Assured", keys: ["appliedSumAssured", "appliedSA", "sumAssured", "applied_sum_assured"], formatter: formatCurrency },
  { header: "Medicals Received date", keys: ["medicalsReceivedDate", "medicalReceivedDate", "medicals_received_date", "medicalsDate"], formatter: formatDateOnly },
  { header: "Validity", keys: ["validity", "validityMedical", "medicalValidity", "validityPeriod"] },
  { header: "Financials Received date", keys: ["financialsReceivedDate", "financialReceivedDate", "financials_received_date", "financialDate"], formatter: formatDateOnly },
  { header: "TMSAR", keys: ["tmsar", "TMSAR"], formatter: formatCurrency },
  { header: "TFSAR", keys: ["tfsar", "TFSAR"], formatter: formatCurrency },
  { header: "Fund Value", keys: ["fundValue", "fund_value"], formatter: formatCurrency },
];

const IIB_NON_IPRU_COLUMNS: ColumnSpec[] = [
  { header: "IIB Match", keys: ["iibMatch", "iib_match"] },
  { header: "QUESTDBNO", keys: ["questDbNo", "quest_db_no", "QUESTDBNO", "questDBNO"] },
  { header: "Quest Sum Assured", keys: ["questSumAssured", "quest_sum_assured"], formatter: formatCurrency },
  { header: "Quest Policy Status", keys: ["questPolicyStatus", "quest_policy_status"] },
  { header: "Quest Company Number", keys: ["questCompanyNumber", "quest_company_number"] },
  { header: "Matching Parameter", keys: ["matchingParameter", "matching_parameter"] },
  { header: "Quest DOP DOC", keys: ["questDopDoc", "quest_dop_doc"], formatter: formatDateOnly },
  { header: "Quest Date Of Death", keys: ["questDateOfDeath", "quest_date_of_death"], formatter: formatDateOnly },
  { header: "Quest Cause Of Death", keys: ["questCauseOfDeath", "quest_cause_of_death"] },
  { header: "Quest Record Last Updated", keys: ["questRecordLastUpdated", "quest_record_last_updated"], formatter: formatDateOnly },
  { header: "Quest Entity Caution Status", keys: ["questEntityCautionStatus", "quest_entity_caution_status"] },
  { header: "Intermediary Caution Status", keys: ["intermediaryCautionStatus", "intermediary_caution_status"] },
];

const NEGATIVE_MATCH_COLUMNS: ColumnSpec[] = [
  { header: "Is Negative Match", keys: ["isNegativeMatch", "negativeMatch", "is_negative_match"] },
  { header: "Whether Standard Life", keys: ["whetherStandardLife", "whether_standard_life"] },
  { header: "Medical Nonmedical", keys: ["medicalNonmedical", "medical_nonmedical"] },
  { header: "Reason For Decline", keys: ["reasonForDecline", "reason_for_decline"] },
  { header: "Reason For Postpone", keys: ["reasonForPostpone", "reason_for_postpone"] },
  { header: "Reason For Repudiation", keys: ["reasonForRepudiation", "reason_for_repudiation"] },
  { header: "Linked NonLinked", keys: ["linkedNonLinked", "linked_non_linked"] },
  { header: "Product Type", keys: ["productType", "product_type"] },
  { header: "Remarks", keys: ["remarks"] },
  { header: "Broad Reason", keys: ["broadReason", "broad_reason"] },
  { header: "Granular Reason 1", keys: ["granularReason1", "granular_reason_1"] },
  { header: "Granular Reason 2", keys: ["granularReason2", "granular_reason_2"] },
];

const APP_FORM_DETAILS_COLUMNS: ColumnSpec[] = [
  { header: "Policy Type", keys: ["policyType", "policy_type"] },
  { header: "Base Sum Assured", keys: ["baseSumAssured", "base_sum_assured"], formatter: formatCurrency },
  { header: "Rider Name", keys: ["riderName", "rider_name"] },
  { header: "Rider Sum Assured", keys: ["riderSumAssured", "rider_sum_assured"], formatter: formatCurrency },
  { header: "Policy Decision", keys: ["policyDecision", "policy_decision"] },
  { header: "Company name", keys: ["companyName", "company_name"] },
  { header: "Policy decision Date", keys: ["policyDecisionDate", "policy_decision_date"], formatter: formatDateOnly },
  { header: "Policy Status", keys: ["policyStatus", "policy_status"] },
  { header: "Reason for Decline/Postpone/ Withdraw", keys: ["reasonForDecision", "reasonForDecline", "reasonForPostpone", "reasonForWithdraw", "reason_for_decision"] },
  { header: "Policy Belongs to me - Yes/No", keys: ["policyBelongsToMe", "policy_belongs_to_me"] },
  { header: "Remarks", keys: ["remarks"] },
  { header: "Declared Policy", keys: ["declaredPolicy", "declared_policy"] },
];

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getValueFromKeys = (item: PreviousPolicyItem, keys: string[]) => {
  const record = toRecord(item as unknown);

  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return "-";
};

const toDisplayValue = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text || "-";
};

// Set showDummyData={false} to display API data. Dummy data never merges into API rows.
const DUMMY_QUICK_LINKS: Record<string, unknown> = {
  "ipru": [
    {
      "policyNumber": "DEMO-IPRU-001",
      "productName": "Sample Term Plan",
      "productType": "Term",
      "dateOfIssuance": "2024-04-12",
      "uwDecision": "Standard",
      "appliedSumAssured": 5000000,
      "medicalsReceivedDate": "2024-04-01",
      "validity": "6 months",
      "financialsReceivedDate": "2024-04-03",
      "tmsar": 7500000,
      "tfsar": 10000000,
      "fundValue": 0
    },
    {
      "policyNumber": "DEMO-IPRU-002",
      "productName": "Sample Savings Plan",
      "productType": "Savings",
      "dateOfIssuance": "2024-02-12",
      "uwDecision": "Standard",
      "appliedSumAssured": 2000000,
      "medicalsReceivedDate": "2024-04-01",
      "validity": "6 months",
      "financialsReceivedDate": "2024-04-03",
      "tmsar": 3000000,
      "tfsar": 4000000,
      "fundValue": 0
    },
    {
      "policyNumber": "DEMO-IPRU-003",
      "productName": "Sample ULIP Plan",
      "productType": "ULIP",
      "dateOfIssuance": "2024-03-12",
      "uwDecision": "Standard",
      "appliedSumAssured": 3000000,
      "medicalsReceivedDate": "2024-04-01",
      "validity": "6 months",
      "financialsReceivedDate": "2024-04-03",
      "tmsar": 4500000,
      "tfsar": 6000000,
      "fundValue": 350000
    },
    {
      "policyNumber": "DEMO-IPRU-004",
      "productName": "Sample Whole Life Plan",
      "productType": "Whole Life",
      "dateOfIssuance": "2024-04-12",
      "uwDecision": "Standard",
      "appliedSumAssured": 4000000,
      "medicalsReceivedDate": "2024-04-01",
      "validity": "6 months",
      "financialsReceivedDate": "2024-04-03",
      "tmsar": 6000000,
      "tfsar": 8000000,
      "fundValue": 0
    },
    {
      "policyNumber": "DEMO-IPRU-005",
      "productName": "Sample Endowment Plan",
      "productType": "Endowment",
      "dateOfIssuance": "2024-05-12",
      "uwDecision": "Standard",
      "appliedSumAssured": 5000000,
      "medicalsReceivedDate": "2024-04-01",
      "validity": "6 months",
      "financialsReceivedDate": "2024-04-03",
      "tmsar": 7500000,
      "tfsar": 10000000,
      "fundValue": 0
    }
  ],
  "iibNonIpru": [
    {
      "iibMatch": "Yes",
      "questDbNo": "DEMO-QUEST-001",
      "questSumAssured": 2500000,
      "questPolicyStatus": "In Force",
      "questCompanyNumber": "DEMO-INS-01",
      "matchingParameter": "Name, DOB and PAN",
      "questDopDoc": "2023-06-15",
      "questDateOfDeath": "Not applicable",
      "questCauseOfDeath": "Not applicable",
      "questRecordLastUpdated": "2026-09-01",
      "questEntityCautionStatus": "Clear",
      "intermediaryCautionStatus": "Clear"
    },
    {
      "iibMatch": "Yes",
      "questDbNo": "DEMO-QUEST-002",
      "questSumAssured": 2000000,
      "questPolicyStatus": "In Force",
      "questCompanyNumber": "DEMO-INS-02",
      "matchingParameter": "Name and DOB",
      "questDopDoc": "2023-02-15",
      "questDateOfDeath": "Not applicable",
      "questCauseOfDeath": "Not applicable",
      "questRecordLastUpdated": "2026-09-01",
      "questEntityCautionStatus": "Clear",
      "intermediaryCautionStatus": "Clear"
    },
    {
      "iibMatch": "Yes",
      "questDbNo": "DEMO-QUEST-003",
      "questSumAssured": 3000000,
      "questPolicyStatus": "Lapsed",
      "questCompanyNumber": "DEMO-INS-03",
      "matchingParameter": "PAN",
      "questDopDoc": "2023-03-15",
      "questDateOfDeath": "Not applicable",
      "questCauseOfDeath": "Not applicable",
      "questRecordLastUpdated": "2026-09-01",
      "questEntityCautionStatus": "Clear",
      "intermediaryCautionStatus": "Clear"
    },
    {
      "iibMatch": "Yes",
      "questDbNo": "DEMO-QUEST-004",
      "questSumAssured": 4000000,
      "questPolicyStatus": "Paid Up",
      "questCompanyNumber": "DEMO-INS-04",
      "matchingParameter": "Name and mobile",
      "questDopDoc": "2023-04-15",
      "questDateOfDeath": "Not applicable",
      "questCauseOfDeath": "Not applicable",
      "questRecordLastUpdated": "2026-09-01",
      "questEntityCautionStatus": "Clear",
      "intermediaryCautionStatus": "Clear"
    },
    {
      "iibMatch": "Yes",
      "questDbNo": "DEMO-QUEST-005",
      "questSumAssured": 5000000,
      "questPolicyStatus": "In Force",
      "questCompanyNumber": "DEMO-INS-05",
      "matchingParameter": "Name, DOB and PAN",
      "questDopDoc": "2023-05-15",
      "questDateOfDeath": "Not applicable",
      "questCauseOfDeath": "Not applicable",
      "questRecordLastUpdated": "2026-09-01",
      "questEntityCautionStatus": "Clear",
      "intermediaryCautionStatus": "Clear"
    }
  ],
  "negativeMatch": [
    {
      "questDbNo": "DEMO-QUEST-001",
      "isNegativeMatch": "Yes",
      "whetherStandardLife": "No",
      "medicalNonmedical": "Medical",
      "reasonForDecline": "Adverse medical findings (dummy)",
      "reasonForPostpone": "Not applicable",
      "reasonForRepudiation": "Not applicable",
      "linkedNonLinked": "Non-linked",
      "productType": "Term",
      "remarks": "Fictional record for UI preview",
      "broadReason": "Medical",
      "granularReason1": "Cardiac history",
      "granularReason2": "Abnormal investigation"
    },
    {
      "questDbNo": "DEMO-QUEST-002",
      "isNegativeMatch": "No",
      "whetherStandardLife": "Yes",
      "medicalNonmedical": "Medical",
      "reasonForDecline": "Not applicable",
      "reasonForPostpone": "Not applicable",
      "reasonForRepudiation": "Not applicable",
      "linkedNonLinked": "Non-linked",
      "productType": "Savings",
      "remarks": "Fictional review record 2",
      "broadReason": "No adverse match",
      "granularReason1": "Not applicable",
      "granularReason2": "Not applicable"
    },
    {
      "questDbNo": "DEMO-QUEST-003",
      "isNegativeMatch": "Yes",
      "whetherStandardLife": "No",
      "medicalNonmedical": "Medical",
      "reasonForDecline": "Adverse medical findings (dummy)",
      "reasonForPostpone": "Not applicable",
      "reasonForRepudiation": "Not applicable",
      "linkedNonLinked": "Non-linked",
      "productType": "Term",
      "remarks": "Fictional review record 3",
      "broadReason": "Medical",
      "granularReason1": "Cardiac history",
      "granularReason2": "Abnormal investigation"
    },
    {
      "questDbNo": "DEMO-QUEST-004",
      "isNegativeMatch": "No",
      "whetherStandardLife": "Yes",
      "medicalNonmedical": "Medical",
      "reasonForDecline": "Not applicable",
      "reasonForPostpone": "Not applicable",
      "reasonForRepudiation": "Not applicable",
      "linkedNonLinked": "Non-linked",
      "productType": "Whole Life",
      "remarks": "Fictional review record 4",
      "broadReason": "No adverse match",
      "granularReason1": "Not applicable",
      "granularReason2": "Not applicable"
    },
    {
      "questDbNo": "DEMO-QUEST-005",
      "isNegativeMatch": "Yes",
      "whetherStandardLife": "No",
      "medicalNonmedical": "Medical",
      "reasonForDecline": "Adverse medical findings (dummy)",
      "reasonForPostpone": "Not applicable",
      "reasonForRepudiation": "Not applicable",
      "linkedNonLinked": "Non-linked",
      "productType": "Endowment",
      "remarks": "Fictional review record 5",
      "broadReason": "Medical",
      "granularReason1": "Cardiac history",
      "granularReason2": "Abnormal investigation"
    }
  ],
  "applicationFormDetails": [
    {
      "policyType": "Term",
      "baseSumAssured": 2500000,
      "riderName": "Accidental Death Benefit",
      "riderSumAssured": 500000,
      "policyDecision": "Standard",
      "companyName": "Sample Life Insurance",
      "policyDecisionDate": "2023-06-15",
      "policyStatus": "In Force",
      "reasonForDecision": "Not applicable",
      "policyBelongsToMe": "Yes",
      "remarks": "Fictional declared policy",
      "declaredPolicy": "Yes"
    },
    {
      "policyType": "Savings",
      "baseSumAssured": 2000000,
      "riderName": "Accidental Death Benefit",
      "riderSumAssured": 200000,
      "policyDecision": "Standard",
      "companyName": "Sample Insurer 2",
      "policyDecisionDate": "2023-02-15",
      "policyStatus": "In Force",
      "reasonForDecision": "Not applicable",
      "policyBelongsToMe": "Yes",
      "remarks": "Fictional declared policy 2",
      "declaredPolicy": "Yes"
    },
    {
      "policyType": "Term",
      "baseSumAssured": 3000000,
      "riderName": "Accidental Death Benefit",
      "riderSumAssured": 300000,
      "policyDecision": "Standard",
      "companyName": "Sample Insurer 3",
      "policyDecisionDate": "2023-03-15",
      "policyStatus": "In Force",
      "reasonForDecision": "Not applicable",
      "policyBelongsToMe": "Yes",
      "remarks": "Fictional declared policy 3",
      "declaredPolicy": "Yes"
    },
    {
      "policyType": "Whole Life",
      "baseSumAssured": 4000000,
      "riderName": "Accidental Death Benefit",
      "riderSumAssured": 400000,
      "policyDecision": "Standard",
      "companyName": "Sample Insurer 4",
      "policyDecisionDate": "2023-04-15",
      "policyStatus": "In Force",
      "reasonForDecision": "Not applicable",
      "policyBelongsToMe": "Yes",
      "remarks": "Fictional declared policy 4",
      "declaredPolicy": "Yes"
    },
    {
      "policyType": "Endowment",
      "baseSumAssured": 5000000,
      "riderName": "Accidental Death Benefit",
      "riderSumAssured": 500000,
      "policyDecision": "Standard",
      "companyName": "Sample Insurer 5",
      "policyDecisionDate": "2023-05-15",
      "policyStatus": "In Force",
      "reasonForDecision": "Not applicable",
      "policyBelongsToMe": "Yes",
      "remarks": "Fictional declared policy 5",
      "declaredPolicy": "Yes"
    }
  ]
};

// Match separate API sections by QUESTDBNO; never associate records by array position.
// Unmatched records remain visible as separate rows in the combined table.
const combineMatchRows = (
  iibRows: PreviousPolicyItem[],
  negativeRows: PreviousPolicyItem[],
): PreviousPolicyItem[] => {
  const matchKey = (row: PreviousPolicyItem) => {
    const value = getValueFromKeys(row, ["questDbNo", "quest_db_no", "QUESTDBNO", "questDBNO"]);
    return value === "-" ? "" : String(value).trim();
  };
  const matched = new Set<number>();
  const combined = iibRows.flatMap((iib) => {
    const key = matchKey(iib);
    const matches = negativeRows.flatMap((negative, index) => {
      if (!key || matchKey(negative) !== key) return [];
      matched.add(index);
      return [{ ...iib, ...negative }];
    });
    return matches.length ? matches : [iib];
  });
  return [...combined, ...negativeRows.filter((_, index) => !matched.has(index))];
};

const MEMBER_DEFINITIONS = [
  { key: "lifeAssured1", label: "Lifeassured1" },
  { key: "lifeAssured2", label: "Lifeassured2" },
  { key: "proposer", label: "Proposer" },
] as const;

// Member-keyed quickLinks keep each member's policy records separate.
// Legacy unscoped quickLinks are shown only under Lifeassured1.
const getMemberPolicyData = (
  data: Record<string, unknown> | null,
  memberKey: string,
): Record<string, unknown> | null => {
  if (!data) return null;
  const key = Object.keys(data).find(
    (candidate) => candidate.toLowerCase() === memberKey.toLowerCase(),
  );
  if (key) return toRecord(data[key]);
  const hasMemberData = MEMBER_DEFINITIONS.some((member) =>
    Object.keys(data).some((candidate) => candidate.toLowerCase() === member.key.toLowerCase()),
  );
  return !hasMemberData && memberKey === "lifeAssured1" ? data : null;
};

const MemberPolicyTables = ({
  effectiveQuickLinksData,
  roleType,
  memberKey,
}: {
  effectiveQuickLinksData: Record<string, unknown> | null;
  roleType: string;
  memberKey: string;
}) => {
  const [pagination, setPagination] = useState<PaginationState>(initialPagination);
  const ipruRows = useMemo(() => {
    return getFirstSectionRows(effectiveQuickLinksData, [
      "ipru",
      "ipruPolicies",
      "ipruPreviousPolicies",
      "ipruSection",
      "previousPolicies",
      "policies",
    ]);
  }, [effectiveQuickLinksData]);

  const iibNonIpruRows = useMemo(
    () =>
      getFirstSectionRows(effectiveQuickLinksData, [
        "iibNonIpru",
        "iibNonIpruPolicies",
        "iibSection",
        "iibPolicies",
        "nonIpruPolicies",
      ]),
    [effectiveQuickLinksData]
  );

  const negativeMatchRows = useMemo(
    () =>
      getFirstSectionRows(effectiveQuickLinksData, [
        "negativeMatch",
        "negativeMatches",
        "negativeMatchPolicies",
        "negativeMatchSection",
      ]),
    [effectiveQuickLinksData]
  );

  const showNegativeMatch = roleType !== "DVT_FORMAL_TASK";
  const combinedMatchColumns = showNegativeMatch
    ? [...IIB_NON_IPRU_COLUMNS, ...NEGATIVE_MATCH_COLUMNS]
    : IIB_NON_IPRU_COLUMNS;
  const combinedMatchRows = useMemo(
    () => showNegativeMatch
      ? combineMatchRows(iibNonIpruRows, negativeMatchRows)
      : iibNonIpruRows,
    [iibNonIpruRows, negativeMatchRows, showNegativeMatch],
  );

  const appFormRows = useMemo(
    () =>
      getFirstSectionRows(effectiveQuickLinksData, [
        "applicationFormDetails",
        "detailsAsPerApplicationForm",
        "appFormDetails",
        "applicationFormSection",
      ]),
    [effectiveQuickLinksData]
  );

  const renderPolicyTable = (
    tableKey: TableKey,
    columns: ColumnSpec[],
    rows: PreviousPolicyItem[],
  ) => {
    const allowHorizontalScroll = tableKey === "iibNonIpru";
    const { page } = pagination[tableKey];
    const rowsPerPage = defaultRowsPerPage;
    const totalCount = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
    const safePage = Math.min(page, totalPages - 1);
    const paginatedRows = rows.slice(
      safePage * rowsPerPage,
      (safePage + 1) * rowsPerPage,
    );
    const updatePagination = (
      updates: Partial<PaginationState[TableKey]>,
    ) => {
      setPagination((current) => ({
        ...current,
        [tableKey]: {
          ...current[tableKey],
          ...updates,
        },
      }));
    };

    return (
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
        }}
      >
        <TableContainer
          sx={{
            border: "1px solid #D8E0E8",
            borderRadius: 2,
            maxHeight: 420,
            overflow: "hidden",
            overflowX: allowHorizontalScroll ? "auto" : "hidden",
            overflowY: "auto",
            width: "100%",
          }}
        >
          <Table
            size="small"
            stickyHeader
            sx={{
              tableLayout: "fixed",
              minWidth: allowHorizontalScroll ? columns.length * 160 : 0,
              width: "100%",
              "& tbody tr:nth-of-type(even)": {
                backgroundColor: "#FAFBFC",
              },
            }}
          >
            <TableHead>
              <TableRow>
                {columns.map((column, columnIndex) => (
                  <TableCell
                    key={`${column.header}-${columnIndex}`}
                    title={column.header}
                    sx={{ ...tableHeaderCellSx, width: `${100 / columns.length}%` }}
                  >
                    {column.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ ...tableBodyCellSx, textAlign: "center", py: 3 }}>
                    No previous policies available.
                  </TableCell>
                </TableRow>
              )}
              {paginatedRows.map((policy, rowIndex) => (
                  <TableRow key={`${tableKey}-policy-row-${safePage}-${rowIndex}`}>
                    {columns.map((column, columnIndex) => {
                      const rawValue = getValueFromKeys(policy, column.keys);
                      const display = column.formatter
                        ? column.formatter(rawValue)
                        : toDisplayValue(rawValue);

                      return (
                        <TableCell
                          key={`${column.header}-${columnIndex}-${rowIndex}`}
                          title={display}
                          sx={tableBodyCellSx}
                        >
                          {display}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            minHeight: 14,
            py: 1,
            boxSizing: "border-box",
            flexShrink: 0,
            bgcolor: "#F5F6F7",
            borderTop: "1px solid #D8E0E8",
            borderRadius: "0 0 8px 8px",
          }}
        >
            <Pagination
              aria-label={`${memberKey} ${tableKey} table pagination`}
              count={totalPages}
              page={safePage + 1}
              onChange={(_, nextPage) =>
                updatePagination({ page: nextPage - 1 })
              }
              shape="rounded"
              siblingCount={1}
              boundaryCount={1}
              sx={{
                "& .MuiPaginationItem-root": {
                  minWidth: 20,
                  height: 20,
                  borderRadius: "7px",
                  fontSize: 14,
                  fontWeight: 400,
                  margin: "0",
                  color: "#5F5F5F",
                },
                "& .MuiPagination-ul": { flexWrap: "nowrap" },
                "& .MuiPaginationItem-root.Mui-disabled": { opacity: 0.4 },
                "& .MuiPaginationItem-icon": { fontSize: 14 },
                "& .MuiPaginationItem-root.Mui-selected": {
                  bgcolor: "#E45F14",
                  color: "#FFFFFF",
                  "&:hover": { bgcolor: "#D95400" },
                },
              }}
            />
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ minWidth: 0 }}>
          {(
            <>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1.25, color: "#0E3762" }}>
                IPRU
              </Typography>
              {renderPolicyTable("ipru", IPRU_COLUMNS, ipruRows)}
            </>
          )}

          {(
            <>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mt: 2.5, mb: 1.25, color: "#0E3762" }}>
                {showNegativeMatch ? "IIB / Non IPRU and Negative Match Details" : "IIB / Non IPRU"}
              </Typography>
              {renderPolicyTable("iibNonIpru", combinedMatchColumns, combinedMatchRows)}
            </>
          )}

          {roleType !== "DVT_FORMAL_TASK" && (
            <>
              {(
                <>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, mt: 2.5, mb: 1.25, color: "#0E3762" }}>
                    Details as per application form
                  </Typography>
                  {renderPolicyTable("applicationForm", APP_FORM_DETAILS_COLUMNS, appFormRows)}
                </>
              )}
            </>
          )}
    </Box>
  );
};

const PreviousPolicy = ({ showDummyData = true }: { showDummyData?: boolean }) => {
  const dispatch = useAppDispatch();
  //const navigate = useNavigate();
  const { businessType, applicationNumber } = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickLinksData, setQuickLinksData] = useState<Record<string, unknown> | null>(null);

  const safeBusinessType =
    String(
      businessType ??
        localStorage.getItem("businessType") ??
        "retail",
    )
      .trim()
      .toLowerCase() || "retail";
  const safeApplicationId = applicationNumber ?? "";
  const roleType = localStorage.getItem("roleType") ?? "";
  const isApplicationIdMissing = !safeApplicationId;
  const reduxQuickLinks = useMemo(
    () => toRecord((drsData as unknown as Record<string, unknown> | null)?.quickLinks),
    [drsData],
  );
  const hasReduxPreviousPolicies = Array.isArray(reduxQuickLinks.previousPolicies)
    || Array.isArray(reduxQuickLinks.ipru)
    || MEMBER_DEFINITIONS.some((member) => Object.keys(reduxQuickLinks).some(
      (key) => key.toLowerCase() === member.key.toLowerCase(),
    ));
  const effectiveQuickLinksData = showDummyData
    ? DUMMY_QUICK_LINKS
    : isApplicationIdMissing
    ? null
    : hasReduxPreviousPolicies
      ? reduxQuickLinks
      : quickLinksData;

  // const selectedCaseContext = useMemo(() => {
  //   try {
  //     return JSON.parse(
  //       localStorage.getItem("selectedCaseContext") ?? "{}",
  //     ) as {
  //       applicationNo?: string;
  //       source?: string;
  //       readOnly?: boolean;
  //     };
  //   } catch {
  //     return {};
  //   }
  // }, []);

  // const isFromSearchApplication =
  //   selectedCaseContext.source === "searchApplication" &&
  //   selectedCaseContext.readOnly === true;

  // const handleBack = () => {
  //   if (isFromSearchApplication) {
  //     navigate(getSearchApplicationPath(), {
  //       state: {
  //         restoreSearchResult: true,
  //         applicationNo:
  //           selectedCaseContext.applicationNo || safeApplicationId,
  //       },
  //     });
  //     return;
  //   }

  //   navigate(getDRSPath(safeBusinessType, safeApplicationId));
  // };

  useEffect(() => {
    if (showDummyData || isApplicationIdMissing || hasReduxPreviousPolicies) {
      return;
    }

    const fetchPreviousPolicies = async () => {
      try {
        setLoading(true);
        setError(null);
        const userId = (localStorage.getItem("userId") ?? localStorage.getItem("username") ?? "System").trim() || "System";
        const response = await dispatch(
          drsThunk({
            applicationNo: safeApplicationId,
            userId,
            roleType,
            businessType: safeBusinessType,
            sections: ["quickLinks"],
          }),
        ).unwrap();

        setQuickLinksData(toRecord((response.data as unknown as Record<string, unknown>)?.quickLinks));
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch previous policies from DRS quick links.");
        setQuickLinksData(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchPreviousPolicies();
  }, [
    showDummyData,
    dispatch,
    hasReduxPreviousPolicies,
    isApplicationIdMissing,
    roleType,
    safeApplicationId,
    safeBusinessType,
  ]);


  return (
    <Container maxWidth={false} disableGutters sx={{ pt:1,pb: 4, width: "100%" }}>
      {/* <BackButton
        label={isFromSearchApplication ? "Back to Search Application" : "Back to DRS"}
        onClick={handleBack}
      /> */}

      {!showDummyData && isApplicationIdMissing && (
        <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
          Application ID is missing.
        </Typography>
      )}

      {error && (
        <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading && (
        <Typography sx={{ color: "#6B7280", py: 2 }}>
          Loading previous policies...
        </Typography>
      )}
      {MEMBER_DEFINITIONS.map((member, index) => (
        <Accordion
          key={member.key}
          defaultExpanded={index === 0}
          disableGutters
          elevation={0}
          sx={{
            mb: 2,
            border: "1px solid #D8D8D8",
            borderRadius: "12px !important",
            overflow: "hidden",
            width: "100%",
            "&::before": { display: "none" },
          }}
        >
          <AccordionSummary
            id={`previous-policies-${member.key}-header`}
            aria-controls={`previous-policies-${member.key}-content`}
            expandIcon={<Box component="span" sx={{ color: "#FFFFFF", fontSize: 12 }}>⌄</Box>}
            sx={{
              bgcolor: "#E45F14",
              color: "#FFFFFF",
              minHeight: 48,
              px: 2,
              "& .MuiAccordionSummary-content": { my: 1.25 },
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
              Previous Policies - {member.label}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 1.25, md: 2 }, minWidth: 0 }}>
            <MemberPolicyTables
              key={`${safeApplicationId}-${member.key}-${showDummyData}`}
              memberKey={member.key}
              roleType={roleType}
              effectiveQuickLinksData={showDummyData
                ? DUMMY_QUICK_LINKS
                : getMemberPolicyData(effectiveQuickLinksData, member.key)}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default PreviousPolicy;