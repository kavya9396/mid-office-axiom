import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import BackButton from "../../components/layout/BackButton";
import { KeyLeftArrowIcon, KeyRightArrowIcon } from "../../icons/Icons";
import { useAppContext } from "../../hooks/useAppContext";
import { getDRSPath } from "../../routes/routes";
import { useAppDispatch } from "../../store/hooks";
import { drsThunk } from "../../store/thunks/drsThunk";
import type { PreviousPolicyItem } from "../../types/drs.types";
import CustomButton from "../../components/ui/Button/Button";
import type { RootState } from "../../store/store";

const defaultRowsPerPage = 25;

const tableHeaderCellSx = {
  backgroundColor: "#E9EEF3",
  fontWeight: 600,
  whiteSpace: "nowrap",
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

const IPRU_COLUMNS: ColumnSpec[] = [
  { header: "Policy Number", keys: ["policyNumber", "policyNo", "policy_number"] },
  { header: "Product name", keys: ["productName", "product", "product_name", "companyName"] },
  { header: "Product Type", keys: ["productType", "product_type"] },
  { header: "Date of issuance", keys: ["dateOfIssuance", "dateOfIssue", "issueDate", "date_of_issuance", "policyIssueDate"] },
  { header: "UW Decision", keys: ["uwDecision", "uw_decision", "underwritingDecision", "decision"] },
  { header: "Sum Assured", keys: ["appliedSumAssured", "appliedSA", "sumAssured", "applied_sum_assured"], formatter: formatCurrency },
  { header: "Medicals Received date", keys: ["medicalsReceivedDate", "medicalReceivedDate", "medicals_received_date", "medicalsDate"] },
  { header: "Validity", keys: ["validityMedical", "medicalValidity", "validityPeriod"] },
  { header: "Financials Received date", keys: ["financialsReceivedDate", "financialReceivedDate", "financials_received_date", "financialDate"] },
  { header: "Validity", keys: ["validityFinancial", "financialValidity", "validityPeriod"] },
];

const IIB_NON_IPRU_COLUMNS: ColumnSpec[] = [
 { header: "Policy Number", keys: ["policyNumber", "policyNo", "policy_number"] },
  { header: "Product name", keys: ["productName", "product", "product_name", "companyName"] },
  { header: "Product Type", keys: ["productType", "product_type"] },
  { header: "Date of issuance", keys: ["dateOfIssuance", "dateOfIssue", "issueDate", "date_of_issuance", "policyIssueDate"] },
  { header: "UW Decision", keys: ["uwDecision", "uw_decision", "underwritingDecision", "decision"] },
  { header: "Sum Assured", keys: ["appliedSumAssured", "appliedSA", "sumAssured", "applied_sum_assured"], formatter: formatCurrency },
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
  { header: "Policy decision Date", keys: ["policyDecisionDate", "policy_decision_date"] },
  { header: "Policy Status", keys: ["policyStatus", "policy_status"] },
  { header: "Reason for Decline/Postpone/ Withdraw", keys: ["reasonForDecision", "reasonForDecline", "reasonForPostpone", "reasonForWithdraw", "reason_for_decision"] },
  { header: "Policy Belongs to me - Yes/No", keys: ["policyBelongsToMe", "policy_belongs_to_me"] },
  { header: "Remarks", keys: ["remarks"] },
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

const PreviousPolicy = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { businessType, applicationNumber } = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickLinksData, setQuickLinksData] = useState<Record<string, unknown> | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [page, setPage] = useState(0);

  const safeBusinessType = businessType ?? "retail";
  const safeApplicationId = applicationNumber ?? "";
  const roleType = localStorage.getItem("roleType") ?? "";
  const isApplicationIdMissing = !safeApplicationId;
  const reduxQuickLinks = useMemo(
    () => toRecord((drsData as unknown as Record<string, unknown> | null)?.quickLinks),
    [drsData],
  );
  const hasReduxPreviousPolicies = Array.isArray(reduxQuickLinks.previousPolicies);
  const effectiveQuickLinksData = isApplicationIdMissing
    ? null
    : hasReduxPreviousPolicies
      ? reduxQuickLinks
      : quickLinksData;

  useEffect(() => {
    if (isApplicationIdMissing || hasReduxPreviousPolicies) {
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
  }, [dispatch, hasReduxPreviousPolicies, isApplicationIdMissing, roleType, safeApplicationId]);

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

  const totalCount = ipruRows.length;
  const totalPages = rowsPerPage === -1 ? 1 : Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const startRecord = totalCount === 0 ? 0 : rowsPerPage === -1 ? 1 : page * rowsPerPage + 1;
  const endRecord =
    totalCount === 0
      ? 0
      : rowsPerPage === -1
        ? totalCount
        : Math.min((page + 1) * rowsPerPage, totalCount);

  const renderPolicyTable = (
    columns: ColumnSpec[],
    rows: PreviousPolicyItem[],
    emptyState: string,
    fitToPage = false
  ) => {
    const paginatedRows =
      rowsPerPage === -1
        ? rows
        : rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
    <TableContainer
      sx={{
        border: "1px solid #D8D8D8",
        borderRadius: "8px",
        overflowX: fitToPage ? "hidden" : "auto",
        overflowY: "hidden",
      }}
    >
      <Table
        size="small"
        sx={{
          minWidth: fitToPage ? "100%" : Math.max(1900, columns.length * 170),
          tableLayout: fitToPage ? "fixed" : "auto",
        }}
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.header}
                sx={{
                  ...tableHeaderCellSx,
                  whiteSpace: fitToPage ? "normal" : tableHeaderCellSx.whiteSpace,
                }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ py: 2.5 }}>
                <Typography sx={{ color: "#6B7280" }}>Loading previous policies...</Typography>
              </TableCell>
            </TableRow>
          ) : paginatedRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ py: 2.5 }}>
                <Typography sx={{ color: "#6B7280" }}>{emptyState}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginatedRows.map((policy, rowIndex) => (
              <TableRow key={`policy-row-${rowIndex}`}>
                {columns.map((column) => {
                  const rawValue = getValueFromKeys(policy, column.keys);
                  const display = column.formatter ? column.formatter(rawValue) : toDisplayValue(rawValue);

                  return (
                    <TableCell key={`${column.header}-${rowIndex}`}>
                      {display}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
    );
  };

  return (
    <Container disableGutters sx={{ pb: 4 }}>
      <BackButton
        label="Back to DRS"
        onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationId))}
      />

      {isApplicationIdMissing && (
        <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
          Application ID is missing.
        </Typography>
      )}

      {error && (
        <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
          {error}
        </Typography>
      )}

      <Paper
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid #D8D8D8",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
            pl: 2,
            backgroundColor: "#004A80",
            color: "#FFFFFF",
          }}
        >
          <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
            Previous Policies
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontSize: "26px", fontWeight: 700, mb: 1.5, color: "#0E3762" }}>
            IPRU
          </Typography>
          {renderPolicyTable(IPRU_COLUMNS, ipruRows, "No IPRU previous policy data found.")}

          <Typography sx={{ fontSize: "26px", fontWeight: 700, mt: 3, mb: 1.5, color: "#0E3762" }}>
            IIB/ Non IPRU
          </Typography>
          {renderPolicyTable(IIB_NON_IPRU_COLUMNS, iibNonIpruRows, "No IIB/Non IPRU policy data found.", true)}
{roleType !== 'DVT_FORMAL_TASK' && (<>
          <Box sx={{ mt: 2 }}>
            {renderPolicyTable(NEGATIVE_MATCH_COLUMNS, negativeMatchRows, "No negative match data found.")}
          </Box>

          <Typography sx={{ fontSize: "24px", fontWeight: 700, mt: 3, mb: 1.5, color: "#0E3762" }}>
        Application form details
          </Typography>
          {renderPolicyTable(APP_FORM_DETAILS_COLUMNS, appFormRows, "No application form policy details found.")}
        </>)}
        </Box>

        <Box sx={{ borderTop: "1px solid #E0E0E0", px: 2, py: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: 14, color: "#444444" }}>Show</Typography>
              <Select
                value={rowsPerPage}
                size="small"
                onChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setPage(0);
                }}
                sx={{ minWidth: 80, height: 34, fontSize: 14 }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={-1}>All</MenuItem>
              </Select>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CustomButton onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                <KeyLeftArrowIcon />
                Previous
              </CustomButton>

              <Typography sx={{ px: 1, color: "#444444" }}>{page + 1}</Typography>

              <CustomButton
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
                <KeyRightArrowIcon />
              </CustomButton>
            </Box>

            <Typography sx={{ fontSize: 14, color: "#444444" }}>
              Showing {startRecord}-{endRecord} of {totalCount}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PreviousPolicy;
