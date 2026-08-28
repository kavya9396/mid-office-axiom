import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Pagination,
  Paper,
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
import { useAppContext } from "../../hooks/useAppContext";
import {
  getDRSPath,
  getSearchApplicationPath,
} from "../../routes/routes";
import { useAppDispatch } from "../../store/hooks";
import { drsThunk } from "../../store/thunks/drsThunk";
import type { PreviousPolicyItem } from "../../types/drs.types";
import type { RootState } from "../../store/store";
import { formatDate } from "../../utils/dataFormat";

const defaultRowsPerPage = 5;

const tableHeaderCellSx = {
  backgroundColor: "#E85D04",
  borderColor: "rgba(255, 255, 255, 0.35)",
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.25,
  px: 1,
  py: 1.15,
  verticalAlign: "middle",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const tableBodyCellSx = {
  borderColor: "#E7EBEF",
  color: "#263238",
  fontSize: 12,
  lineHeight: 1.35,
  px: 1,
  py: 1.1,
  verticalAlign: "middle",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

type TableKey = "ipru" | "iibNonIpru" | "negativeMatch" | "applicationForm";

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
  negativeMatch: { page: 0, rowsPerPage: defaultRowsPerPage },
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
  { header: "Product", keys: ["productName", "product", "product_name", "companyName"] },
  { header: "Product Type", keys: ["productType", "product_type"] },
  { header: "Date of issuance", keys: ["dateOfIssuance", "dateOfIssue", "issueDate", "date_of_issuance", "policyIssueDate"], formatter: formatDateOnly },
  { header: "UW Decision", keys: ["uwDecision", "uw_decision", "underwritingDecision", "decision"] },
  { header: "Sum Assured", keys: ["appliedSumAssured", "appliedSA", "sumAssured", "applied_sum_assured"], formatter: formatCurrency },
  { header: "Medicals Received date", keys: ["medicalsReceivedDate", "medicalReceivedDate", "medicals_received_date", "medicalsDate"], formatter: formatDateOnly },
  { header: "Validity", keys: ["validityMedical", "medicalValidity", "validityPeriod"] },
  { header: "Financials Received date", keys: ["financialsReceivedDate", "financialReceivedDate", "financials_received_date", "financialDate"], formatter: formatDateOnly },
  { header: "Validity", keys: ["validityFinancial", "financialValidity", "validityPeriod"] },
];

const IIB_NON_IPRU_COLUMNS: ColumnSpec[] = [
  { header: "Policy Number", keys: ["policyNumber", "policyNo", "policy_number"] },
  { header: "Product", keys: ["productName", "product", "product_name", "companyName"] },
  { header: "Product Type", keys: ["productType", "product_type"] },
  { header: "Date of issuance", keys: ["dateOfIssuance", "dateOfIssue", "issueDate", "date_of_issuance", "policyIssueDate"], formatter: formatDateOnly },
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
  { header: "Policy decision Date", keys: ["policyDecisionDate", "policy_decision_date"], formatter: formatDateOnly },
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
  const [pagination, setPagination] =
    useState<PaginationState>(initialPagination);

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

  const selectedCaseContext = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("selectedCaseContext") ?? "{}",
      ) as {
        applicationNo?: string;
        source?: string;
        readOnly?: boolean;
      };
    } catch {
      return {};
    }
  }, []);

  const isFromSearchApplication =
    selectedCaseContext.source === "searchApplication" &&
    selectedCaseContext.readOnly === true;

  const handleBack = () => {
    if (isFromSearchApplication) {
      navigate(getSearchApplicationPath(), {
        state: {
          restoreSearchResult: true,
          applicationNo:
            selectedCaseContext.applicationNo || safeApplicationId,
        },
      });
      return;
    }

    navigate(getDRSPath(safeBusinessType, safeApplicationId));
  };

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

  const renderPolicyTable = (
    tableKey: TableKey,
    columns: ColumnSpec[],
    rows: PreviousPolicyItem[],
  ) => {
    const { page, rowsPerPage } = pagination[tableKey];
    const totalCount = rows.length;
    const totalPages =
      rowsPerPage === -1
        ? 1
        : Math.max(1, Math.ceil(totalCount / rowsPerPage));
    const safePage = Math.min(page, totalPages - 1);
    const paginatedRows =
      rowsPerPage === -1
        ? rows
        : rows.slice(
            safePage * rowsPerPage,
            safePage * rowsPerPage + rowsPerPage,
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
        }}
      >
        <TableContainer
          sx={{
            border: "1px solid #D8E0E8",
            borderRadius: 2,
            maxHeight: 420,
            overflow: "hidden",
            overflowX: "hidden",
            overflowY: "auto",
            width: "100%",
          }}
        >
          <Table
            size="small"
            stickyHeader
            sx={{
              tableLayout: "fixed",
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
                    sx={tableHeaderCellSx}
                  >
                    {column.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
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

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5 }}>
            <Pagination
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
                  minWidth: 38,
                  height: 40,
                  borderRadius: "7px",
                  fontSize: 16,
                  color: "#374151",
                },
                "& .MuiPaginationItem-root.Mui-selected": {
                  bgcolor: "#E85D04",
                  color: "#FFFFFF",
                  "&:hover": { bgcolor: "#D95400" },
                },
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ pb: 4, width: "100%" }}>
      <BackButton
        label={isFromSearchApplication ? "Back to Search Application" : "Back to DRS"}
        onClick={handleBack}
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
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #D8D8D8",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
            pl: 2,
            backgroundColor: "#E45F14",
            color: "#FFFFFF",
            minHeight: 46,
          }}
        >
          <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
            Previous Policies
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 1.25, md: 2 }, overflow: "hidden" }}>
          {loading && (
            <Typography sx={{ color: "#6B7280", py: 2 }}>
              Loading previous policies...
            </Typography>
          )}

          {ipruRows.length > 0 && (
            <>
              <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 1.25, color: "#0E3762" }}>
                IPRU
              </Typography>
              {renderPolicyTable("ipru", IPRU_COLUMNS, ipruRows)}
            </>
          )}

          {iibNonIpruRows.length > 0 && (
            <>
              <Typography sx={{ fontSize: 20, fontWeight: 700, mt: 2.5, mb: 1.25, color: "#0E3762" }}>
                IIB/ Non IPRU
              </Typography>
              {renderPolicyTable("iibNonIpru", IIB_NON_IPRU_COLUMNS, iibNonIpruRows)}
            </>
          )}

          {roleType !== "DVT_FORMAL_TASK" && (
            <>
              {negativeMatchRows.length > 0 && (
                <>
                  <Typography sx={{ fontSize: 20, fontWeight: 700, mt: 2.5, mb: 1.25, color: "#0E3762" }}>
                    Negative match details
                  </Typography>
                  {renderPolicyTable("negativeMatch", NEGATIVE_MATCH_COLUMNS, negativeMatchRows)}
                </>
              )}

              {appFormRows.length > 0 && (
                <>
                  <Typography sx={{ fontSize: 20, fontWeight: 700, mt: 2.5, mb: 1.25, color: "#0E3762" }}>
                    Application form details
                  </Typography>
                  {renderPolicyTable("applicationForm", APP_FORM_DETAILS_COLUMNS, appFormRows)}
                </>
              )}
            </>
          )}
        </Box>

      </Paper>
    </Container>
  );
};

export default PreviousPolicy;
