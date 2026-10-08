
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState, type ComponentProps } from "react";
import { useAppSelector } from "../../store/hooks";
import type { AdditionalRequirementRow } from "../../types/drs.types";
import RequirementManagementTable from "./DRS_Accordions/RequirementManagementTable";
import CVTApplicantProfile from "./DRS_Accordions/CVTApplicantProfile";
import ApplicantApplicationSummary from "./ApplicantSummary";
import BreDecision from "./DRS_Accordions/BreDecision";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import { RefreshIcon } from "../../icons/Icons";
import CustomTable, { type Column } from "../../components/ui/Table/Table";

type CVTApplicantSummaryProps = Omit<
  ComponentProps<typeof ApplicantApplicationSummary>,
  | "showRiskAnalytics"
  | "showBreDecision"
  | "showUserPhoto"
  | "showHeaderTotals"
  | "productOnlyHeader"
  | "afterHeader"
  | "allowMemberSelectionPage"
>;

type DataRecord = Record<string, unknown>;

const EMPTY_REQUIREMENTS: AdditionalRequirementRow[] = [];

const CVT_DECISION_OPTIONS = [
  "Accept",
  "Raise Requirements",
  "Refer to Risk",
  "Refer to IT",
  "Reraise PIVV",
  "Refer to CUW",
] as const;

const SAMPLE_PIVV_DECISIONS = [
  "Another person spoken",
  "Pre-recorded video",
  "Customer didn’t complete the full script",
];

const toRecord = (value: unknown): DataRecord =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as DataRecord)
    : {};

const firstValue = (...values: unknown[]): string => {
  const value = values.find(
    (item) =>
      item !== undefined &&
      item !== null &&
      String(item).trim() !== "",
  );

  return value !== undefined && value !== null ? String(value) : "-";
};

const formatDateValue = (value: unknown): string => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "-";
  }

  const rawValue = String(value);
  const parsedDate = new Date(rawValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return rawValue;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const toStringList = (...values: unknown[]): string[] => {
  const value = values.find(
    (item) =>
      item !== undefined &&
      item !== null &&
      (!Array.isArray(item) || item.length > 0) &&
      String(item).trim() !== "",
  );

  if (value === undefined || value === null) {
    return ["-"];
  }

  const rawItems = Array.isArray(value) ? value : [value];

  const items = rawItems
    .map((item) => {
      if (item !== null && typeof item === "object" && !Array.isArray(item)) {
        const record = toRecord(item);
        return firstValue(
          record.label,
          record.name,
          record.value,
          record.decision,
          record.description,
        );
      }

      return String(item).trim();
    })
    .filter((item) => item && item !== "-");

  return items.length > 0 ? items : ["-"];
};

type DecisionHistoryRow = {
  date: string;
  userName: string;
  userRole: string;
  remarks: string;
};

const decisionHistoryColumns: Column<DecisionHistoryRow>[] = [
  { key: "date", header: "Date", width: "18%" },
  { key: "userName", header: "User Name", width: "22%" },
  { key: "userRole", header: "User Role", width: "20%" },
  { key: "remarks", header: "Remarks", width: "40%" },
];

const sortedRows: DecisionHistoryRow[] = [
  {
    date: "28 Sept 2026, 01:31:11 pm",
    userName: "Priya Sharma",
    userRole: "CVT",
    remarks: "Applicant details reviewed and forwarded for decision.",
  },
];

const CVTApplicantSummary = (props: CVTApplicantSummaryProps) => {
  const [memberIndex, setMemberIndex] = useState(
    props.initialMemberIndex ?? 0,
  );

  const [addRowSignal, setAddRowSignal] = useState(0);

  const [cvtRemarks, setCvtRemarks] = useState("");
  const [cvtDecision, setCvtDecision] = useState("");
  const [decisionCode, setDecisionCode] = useState("");
  const [breDetailOpen, setBreDetailOpen] = useState(false);

  const source = useAppSelector((state) =>
    props.readOnly
      ? state.searchApplication.response?.data
      : state.drs.data,
  );

  const requirements = Array.isArray(source?.requirementManagement)
    ? (source.requirementManagement as AdditionalRequirementRow[])
    : EMPTY_REQUIREMENTS;

  /*
   * BRE data
   * ------------------------------------------------------------
   * Initial BRE  -> source.breDecision
   * Final BRE    -> source.latestBreDecision
   */
  const initialBre = toRecord(source?.breDecision);
  const latestBre = toRecord(source?.latestBreDecision);

  const initialBreDecision = firstValue(
    initialBre.overallDecision,
    initialBre.finalDecision,
    initialBre.decision,
    initialBre.decisionCode,
    initialBre.breDecision,
    initialBre.status,
  );

  const finalBreDecision = firstValue(
    latestBre.overallDecision,
    latestBre.finalDecision,
    latestBre.decision,
    latestBre.decisionCode,
    latestBre.breDecision,
    latestBre.status,
  );

  /*
   * PIVV data
   * Supports both a single PIVV object and an array of PIVV rows.
   */
  const sourceRecord = toRecord(source);
  const pivvCandidate =
    sourceRecord.pivvSection ??
    sourceRecord.pivv ??
    sourceRecord.pivvDetails ??
    sourceRecord.pivvPool;

  const pivvSourceRows = Array.isArray(pivvCandidate)
    ? pivvCandidate
    : pivvCandidate !== undefined && pivvCandidate !== null
      ? [pivvCandidate]
      : [];

  const pivvRows = pivvSourceRows.length > 0
    ? pivvSourceRows.map((item, index) => {
        const row = toRecord(item);
        const mappedDecisions = toStringList(
          row.pivvDecision,
          row.pivvDecisions,
          row.pivvPoolDecision,
          row.poolDecision,
          row.decision,
          row.decisions,
          row.reason,
          row.reasons,
          row.pivvReason,
          row.decisionReason,
        );

        return {
          id: firstValue(row.id, row.pivvId, row.fupCode, `pivv-${index}`),
          // Sample values are used whenever the API field is blank.
          fupCode: firstValue(
            row.fupCode,
            row.fup,
            row.code,
            row.pivvCode,
            row.followUpCode,
            "PIV",
          ),
          profile: firstValue(
            row.profile,
            row.profileType,
            row.memberType,
            row.applicantType,
            row.lifeType,
            "Life Assured",
          ),
          raisedDate: formatDateValue(
            firstValue(
              row.raisedDate,
              row.raiseDate,
              row.createdDate,
              row.createdAt,
              row.date,
              "2026-09-09",
            ),
          ),
          raisedRemark: firstValue(
            row.raisedRemark,
            row.raisedRemarks,
            row.raiseRemark,
            row.requestRemark,
            row.requestRemarks,
            "-",
          ),
          decisions:
            mappedDecisions.length === 1 && mappedDecisions[0] === "-"
              ? SAMPLE_PIVV_DECISIONS
              : mappedDecisions,
          pivvRemark: firstValue(
            row.pivvRemark,
            row.pivvRemarks,
            row.pivvPoolRemarks,
            row.poolRemarks,
            row.decisionRemark,
            row.decisionRemarks,
            row.remarks,
            "Customer not speaking",
          ),
        };
      })
    : [
        {
          id: "pivv-demo-1",
          fupCode: "PIV",
          profile: "Life Assured",
          raisedDate: "9 Sep 2026",
          raisedRemark: "-",
          decisions: SAMPLE_PIVV_DECISIONS,
          pivvRemark: "Customer not speaking",
        },
      ];

  const handleAddRequirement = () => {
    setAddRowSignal((signal) => signal + 1);
  };

  const handleBreRetrigger = () => {
    /*
     * Plug the existing BRE Retrigger logic here.
     *
     * If ApplicantSummary already exposes the retrigger handler,
     * pass it as a prop instead and call that handler here.
     */
    console.log("BRE Retrigger clicked");
  };

  return (
    <ApplicantApplicationSummary
      {...props}
      initialMemberIndex={memberIndex}
      showMemberSelectionInitially={false}
      allowMemberSelectionPage={false}
      showRiskAnalytics={false}
      showBreDecision={false}
      showUserPhoto={false}
      showHeaderTotals={false}
      productOnlyHeader
      afterHeader={
        <Box
          sx={{
            display: "grid",
            gap: 1,
            minWidth: 0,
          }}
        >
          {/* BRE DECISION ROW */}
          <Box
            component="section"
            aria-label="BRE Decision"
            sx={{
              display: "flex",
              alignItems: "center",
              minHeight: 46,
              px: 1.5,
              py: 0.75,
              gap: 2,
              border: "1px solid #E7DDD7",
              borderRadius: 1.5,
              backgroundColor: "#FFF",
              minWidth: 0,
            }}
          >
            {/* Title */}
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "#8D232A",
                whiteSpace: "nowrap",
                pr: 2,
                borderRight: "1px solid #E7DDD7",
              }}
            >
              BRE Decision
            </Typography>

            {/* Initial BRE */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#756D69",
                  whiteSpace: "nowrap",
                }}
              >
                Initial
              </Typography>

              <Box
                sx={{
                  px: 1.1,
                  py: 0.35,
                  borderRadius: 1,
                  backgroundColor: "#F4F3F2",
                  border: "1px solid #DED9D6",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#4E4743",
                    whiteSpace: "nowrap",
                  }}
                >
                  {initialBreDecision}
                </Typography>
              </Box>
            </Box>

            {/* Divider */}
            <Box
              sx={{
                width: "1px",
                height: 24,
                backgroundColor: "#E7DDD7",
                flexShrink: 0,
              }}
            />

            {/* Final BRE */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#756D69",
                  whiteSpace: "nowrap",
                }}
              >
                Final
              </Typography>

              <Box
                sx={{
                  px: 1.1,
                  py: 0.35,
                  borderRadius: 1,
                  backgroundColor: "#EEF8F1",
                  border: "1px solid #B8DCC0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#28743C",
                    whiteSpace: "nowrap",
                  }}
                >
                  {finalBreDecision}
                </Typography>
              </Box>
            </Box>

            {/* Push button to right */}
            <Box sx={{ flex: 1 }} />

            {!props.readOnly && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshIcon width={16} />}
                onClick={handleBreRetrigger}
                sx={{
                  minWidth: 25,
                  height: 25,
                  flexShrink: 0,
                  borderColor: "#E45F14",
                  color: "#E45F14",
                  textTransform: "none",
                  fontSize: 8,
                  fontWeight: 700,
                  borderRadius: 1.25,
                  "&:hover": {
                    borderColor: "#C94F0B",
                    backgroundColor: "#FFF5EE",
                  },
                }}
              />
            )}

            <Button
              size="small"
              variant="outlined"
              onClick={() => setBreDetailOpen(true)}
              sx={{
                minWidth: 78,
                height: 25,
                flexShrink: 0,
                borderColor: "#E45F14",
                color: "#E45F14",
                textTransform: "none",
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 1.25,
                "&:hover": {
                  borderColor: "#C94F0B",
                  backgroundColor: "#FFF5EE",
                },
              }}
            >
              View Detail
            </Button>
          </Box>


          <Box
            component="section"
            aria-label="BRE Discrepancy"
            sx={{
              display: "flex",
              alignItems: "center",
              minHeight: 46,
              px: 1.5,
              py: 0.75,
              gap: 2,
              border: "1px solid #E7DDD7",
              borderRadius: 1.5,
              backgroundColor: "#FFF",
              minWidth: 0,
            }}
          >
            {/* Title */}
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "#8D232A",
                whiteSpace: "nowrap",
                pr: 2,
                borderRight: "1px solid #E7DDD7",
              }}
            >
              BRE Discrepancy
            </Typography>

            {/* Initial BRE */}
            {/* <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#756D69",
                  whiteSpace: "nowrap",
                }}
              >
                Initial
              </Typography>

              <Box
                sx={{
                  px: 1.1,
                  py: 0.35,
                  borderRadius: 1,
                  backgroundColor: "#F4F3F2",
                  border: "1px solid #DED9D6",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#4E4743",
                    whiteSpace: "nowrap",
                  }}
                >
                  ACR#OCD#PAN#ADP#AGE#IDM#KYP
                </Typography>
              </Box>
            </Box> */}

            {/* Divider */}
            {/* <Box
              sx={{
                width: "1px",
                height: 24,
                backgroundColor: "#E7DDD7",
                flexShrink: 0,
              }}
            /> */}

            {/* Final BRE */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#756D69",
                  whiteSpace: "nowrap",
                }}
              >
                Final
              </Typography>

              <Box
                sx={{
                  px: 1.1,
                  py: 0.35,
                  borderRadius: 1,
                  // backgroundColor: "#EEF8F1",
                  backgroundColor: "#F4F3F2",
                  border: "1px solid #B8DCC0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    // color: "#28743C",
                    whiteSpace: "nowrap",
                  }}
                >
                  ACR#OCD#PAN#ADP#AGE#IDM#KYP#NYC
                </Typography>
              </Box>
            </Box>
          </Box>

          <CustomDialog
            open={breDetailOpen}
            title="BRE Decision"
            onClose={() => setBreDetailOpen(false)}
            maxWidth="lg"
            fullWidth
            contentSx={{
              p: { xs: 1, sm: 1.5 },
              overflowY: "auto",
            }}
          >
            <BreDecision readOnly={props.readOnly} />
          </CustomDialog>

          {/* =====================================================
              REQUIREMENT MANAGEMENT
          ===================================================== */}

          <Box
            component="section"
            aria-label="Requirement Management"
            sx={{
              minWidth: 0,
              border: "1px solid #E7DDD7",
              borderRadius: 1.5,
              bgcolor: "#FFFFFF",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                minHeight: 42,
                px: 1.5,
                py: 0.7,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                borderBottom: "1px solid #E7DDD7",
                bgcolor: "#FFF8F3",
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#8D232A",
                }}
              >
                Requirement Management
              </Typography>

              {!props.readOnly && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleAddRequirement}
                  sx={{
                    minHeight: 28,
                    px: 1.4,
                    py: 0.3,
                    borderColor: "#E45F14",
                    color: "#E45F14",
                    bgcolor: "#FFFFFF",
                    borderRadius: 1.25,
                    fontSize: 11.5,
                    fontWeight: 700,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      borderColor: "#C94F0B",
                      bgcolor: "#FFF5EE",
                    },
                  }}
                >
                  + Add Requirement
                </Button>
              )}
            </Box>

            <Box sx={{ p: 1 }}>
              <RequirementManagementTable
                requirements={requirements}
                readOnly={props.readOnly}
                addRowSignal={addRowSignal}
              />
            </Box>
          </Box>


          {/* APPLICANT PROFILE */}
          <CVTApplicantProfile
            readOnly={props.readOnly}
            roleType="CVT_TASK"
            initialMemberIndex={memberIndex}
            onMemberChange={setMemberIndex}
            memberName="Life Assured 1"
            />

          <CVTApplicantProfile
            readOnly={props.readOnly}
            roleType="CVT_TASK"
            initialMemberIndex={memberIndex}
            onMemberChange={setMemberIndex}
            memberName="Life Assured 2"
          />

          {/* =====================================================
              PIVV DETAILS - READ ONLY ACCORDION
          ===================================================== */}
          <Accordion
            defaultExpanded
            disableGutters
            elevation={0}
            sx={{
              minWidth: 0,
              border: "1px solid #E7DDD7",
              borderRadius: "14px !important",
              overflow: "hidden",
              bgcolor: "#FFFFFF",
              "&:before": { display: "none" },
              "&.Mui-expanded": { m: 0 },
            }}
          >
            <AccordionSummary
              expandIcon={
                <Typography
                  component="span"
                  sx={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  ⌄
                </Typography>
              }
              sx={{
                minHeight: 42,
                px: 1.5,
                bgcolor: "#E45F14",
                color: "#FFFFFF",
                "&.Mui-expanded": { minHeight: 42 },
                "& .MuiAccordionSummary-content": {
                  my: 0.75,
                },
                "& .MuiAccordionSummary-content.Mui-expanded": {
                  my: 0.75,
                },
                "& .MuiAccordionSummary-expandIconWrapper": {
                  color: "#FFFFFF",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#FFFFFF",
                }}
              >
                PIVV Details
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0, overflow: "hidden" }}>
              <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
                <Box sx={{ width: "100%", minWidth: 0 }}>
                  {/* Column headers */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(0, 0.6fr) minmax(0, 0.9fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 2.2fr) minmax(0, 1.6fr)",
                      alignItems: "center",
                      minHeight: 40,
                      bgcolor: "#FFE7D3",
                      borderBottom: "1px solid #E7DDD7",
                      width: "100%",
                      minWidth: 0,
                    }}
                  >
                    {[
                      "FUP Code",
                      "Profile",
                      "Raised Date",
                      "Raised Remark",
                      "PIVV Decision",
                      "PIVV Remark",
                    ].map((label) => (
                      <Typography
                        key={label}
                        sx={{
                          px: 1,
                          py: 0.8,
                          fontSize: 12,
                          fontWeight: 800,
                          color: "#1F1A17",
                          whiteSpace: "normal",
                          lineHeight: 1.2,
                          minWidth: 0,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {label}
                      </Typography>
                    ))}
                  </Box>

                  {/* Read-only rows */}
                  {pivvRows.map((row, rowIndex) => (
                    <Box
                      key={`${row.id}-${rowIndex}`}
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(0, 0.6fr) minmax(0, 0.9fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 2.2fr) minmax(0, 1.6fr)",
                        alignItems: "start",
                        minHeight: 74,
                        bgcolor: "#FFFFFF",
                        width: "100%",
                        minWidth: 0,
                        borderBottom:
                          rowIndex === pivvRows.length - 1
                            ? "none"
                            : "1px solid #EEE6E1",
                      }}
                    >
                      {[
                        row.fupCode,
                        row.profile,
                        row.raisedDate,
                        row.raisedRemark,
                      ].map((value, index) => (
                        <Typography
                          key={`${row.id}-${index}`}
                          sx={{
                            px: 1,
                            py: 1.1,
                            minWidth: 0,
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#403936",
                            lineHeight: 1.35,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {value}
                        </Typography>
                      ))}

                      {/* PIVV Decision - read-only selected values */}
                      <Box
                        sx={{
                          px: 1,
                          py: 0.9,
                          minWidth: 0,
                          display: "grid",
                          gap: 0.55,
                          alignContent: "start",
                        }}
                      >
                        {row.decisions.map((decision, decisionIndex) => (
                          <Box
                            key={`${row.id}-decision-${decisionIndex}`}
                            sx={{
                              minHeight: 28,
                              minWidth: 0,
                              px: 1,
                              py: 0.55,
                              display: "flex",
                              alignItems: "center",
                              border: "1px solid #F3B38F",
                              borderRadius: 1.1,
                              bgcolor: "#FFF0E8",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 11.5,
                                fontWeight: 500,
                                color: "#9A3E17",
                                lineHeight: 1.25,
                                overflowWrap: "anywhere",
                              }}
                            >
                              {decision}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* PIVV Remark - plain read-only display */}
                      <Typography
                        sx={{
                          px: 1,
                          py: 1.1,
                          minWidth: 0,
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#403936",
                          lineHeight: 1.4,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {row.pivvRemark}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

           <CustomTable<DecisionHistoryRow>
              title="Decision History"
              columns={decisionHistoryColumns}
              data={sortedRows}
            />

           {/* =====================================================
                        CVT DECISION
                    ===================================================== */}
          
                    <Box
                      component="section"
                      aria-label="CVT Decision"
                      sx={{
                        p: { xs: 1, sm: 1.25 },
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "minmax(0, 1fr)",
                          md: "minmax(0, 1fr) 250px 220px auto",
                        },
                        gap: 1.25,
                        alignItems: "center",
                        border: "1px solid #D8D8D8",
                        borderLeft: "4px solid #E45F14",
                        borderRadius: "10px",
                        bgcolor: "#FFFFFF",
                        boxShadow: "0 2px 7px rgba(60, 42, 35, 0.05)",
                      }}
                    >
                      <TextField
                        label="CVT Remarks"
                        value={cvtRemarks}
                        onChange={(event) => setCvtRemarks(event.target.value)}
                        multiline
                        minRows={1}
                        size="small"
                        fullWidth
                        disabled={props.readOnly}
                      />
          
                      <TextField
                        select
                        label="CVT Decision"
                        value={cvtDecision}
                        onChange={(event) => setCvtDecision(event.target.value)}
                        size="small"
                        fullWidth
                        disabled={props.readOnly}
                      >
                        {CVT_DECISION_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
          
                      <TextField
                        label="Decision Code"
                        value={decisionCode}
                        onChange={(event) => setDecisionCode(event.target.value)}
                        size="small"
                        fullWidth
                        disabled={props.readOnly}
                      />
          
                      {!props.readOnly && (
                        <Button
                          type="button"
                          variant="contained"
                          onClick={() => {
                            console.log("Submit CVT decision", {
                              remarks: cvtRemarks,
                              decision: cvtDecision,
                              decisionCode,
                            });
                          }}
                          sx={{
                            minWidth: 88,
                            height: 36,
                            px: 2,
                            borderRadius: "18px",
                            bgcolor: "#E45F14",
                            color: "#FFFFFF",
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: "none",
                            boxShadow: "none",
                            whiteSpace: "nowrap",
                            "&:hover": {
                              bgcolor: "#C94F0B",
                              boxShadow: "none",
                            },
                          }}
                        >
                          Submit
                        </Button>
                      )}
                    </Box>
        </Box>
      }
    />
  );
};

export default CVTApplicantSummary;
