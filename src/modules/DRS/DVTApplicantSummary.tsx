
import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { useState, type ComponentProps } from "react";
import { useAppSelector } from "../../store/hooks";
import type { AdditionalRequirementRow } from "../../types/drs.types";
import RequirementManagementTable from "./DRS_Accordions/RequirementManagementTable";
import ApplicantApplicationSummary from "./ApplicantSummary";
import { RefreshIcon } from "../../icons/Icons";
import DVTApplicantProfile from "./DRS_Accordions/DVTApplicantProfile";

type DVTApplicantSummaryProps = Omit<
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

type HeaderDetail = {
  label: string;
  value: string;
};

const EMPTY_REQUIREMENTS: AdditionalRequirementRow[] = [];

const DVT_DECISION_OPTIONS = [
  "Accept",
  "Raise Requirements",
  "Refer to Risk",
  "Refer to IT",
  "Refer to GUW",
] as const;

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

const DVTApplicantSummary = (props: DVTApplicantSummaryProps) => {
  const [memberIndex, setMemberIndex] = useState(
    props.initialMemberIndex ?? 0,
  );

  const [addRowSignal, setAddRowSignal] = useState(0);
  const [dvtRemarks, setDvtRemarks] = useState("");
  const [dvtDecision, setDvtDecision] = useState("");
  const [decisionCode, setDecisionCode] = useState("");

  const source = useAppSelector((state) =>
    props.readOnly
      ? state.searchApplication.response?.data
      : state.drs.data,
  );

  const requirements = Array.isArray(source?.requirementManagement)
    ? (source.requirementManagement as AdditionalRequirementRow[])
    : EMPTY_REQUIREMENTS;

  /*
   * ------------------------------------------------------------
   * SOURCE DATA
   * ------------------------------------------------------------
   */


  /*
   * ------------------------------------------------------------
   * BRE DATA
   * ------------------------------------------------------------
   * Initial BRE -> source.breDecision
   * Final BRE   -> source.latestBreDecision
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
   * ------------------------------------------------------------
   * DVT HEADER DETAILS
   * ------------------------------------------------------------
   */



  const headerDetails: HeaderDetail[] = [
    {
      label: "Agent Name",
      value: "Ram",
    },
    {
      label: "Agent Code",
      value: "AG123",
    },
    {
      label: "Customer Type",
      value: "Individual",
    },
    {
      label: "Policy Type",
      value: "Saving",
    },
    {
      label: "Master Policy No.",
      value: "MP123",
    },
    {
      label: "LAN No.",
      value: "123456",
    },
    {
      label: "Login Date",
      value: "14 Sep 2026",
    },
  ];

  /*
   * ------------------------------------------------------------
   * HANDLERS
   * ------------------------------------------------------------
   */

  const handleAddRequirement = () => {
    setAddRowSignal((signal) => signal + 1);
  };

  const handleBreRetrigger = () => {
    /*
     * Plug existing BRE Retrigger logic here.
     *
     * If ApplicantSummary exposes the BRE retrigger handler,
     * pass it as a prop and invoke it here.
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
      productHeaderDetails={headerDetails}
      showFaceValue={false}
      afterHeader={
        <Box
          sx={{
            display: "grid",
            gap: 1,
            minWidth: 0,
          }}
        >
          {/* =====================================================
              BRE DECISION
          ===================================================== */}

          <Box
            component="section"
            aria-label="BRE Decision"
            sx={{
              display: "flex",
              alignItems: "center",
              minHeight: 46,
              minWidth: 0,
              px: 1.5,
              py: 0.75,
              gap: 2,
              backgroundColor: "#FFF",
              border: "1px solid #E7DDD7",
              borderRadius: 1.5,
            }}
          >
            {/* BRE Title */}

            <Typography
              sx={{
                flexShrink: 0,
                pr: 2,
                fontSize: 13,
                fontWeight: 700,
                color: "#8D232A",
                whiteSpace: "nowrap",
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
                  flexShrink: 0,
                  backgroundColor: "#F4F3F2",
                  border: "1px solid #DED9D6",
                  borderRadius: 1,
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
                flexShrink: 0,
                backgroundColor: "#E7DDD7",
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
                  flexShrink: 0,
                  backgroundColor: "#EEF8F1",
                  border: "1px solid #B8DCC0",
                  borderRadius: 1,
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

            {/* Push BRE Retrigger to right */}

            <Box sx={{ flex: 1 }} />

            {!props.readOnly && (
              <Button
                size="small"
                variant="outlined"
                aria-label="BRE Retrigger"
                title="BRE Retrigger"
                startIcon={<RefreshIcon width={16} />}
                onClick={handleBreRetrigger}
                sx={{
                  minWidth: 28,
                  width: 28,
                  height: 26,
                  p: 0,
                  flexShrink: 0,
                  borderColor: "#E45F14",
                  color: "#E45F14",
                  borderRadius: 1.25,

                  "& .MuiButton-startIcon": {
                    m: 0,
                  },

                  "&:hover": {
                    borderColor: "#C94F0B",
                    backgroundColor: "#FFF5EE",
                  },
                }}
              />
            )}
          </Box>

          {/* =====================================================
              APPLICANT PROFILE
          ===================================================== */}

          <DVTApplicantProfile
            readOnly={props.readOnly}
            roleType="DVT_TASK"
            initialMemberIndex={memberIndex}
            onMemberChange={setMemberIndex}
          />

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

          {/* =====================================================
              DVT DECISION
          ===================================================== */}

          <Box
            component="section"
            aria-label="DVT Decision"
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
              label="DVT Remarks"
              value={dvtRemarks}
              onChange={(event) => setDvtRemarks(event.target.value)}
              multiline
              minRows={1}
              size="small"
              fullWidth
              disabled={props.readOnly}
            />

            <TextField
              select
              label="DVT Decision"
              value={dvtDecision}
              onChange={(event) => setDvtDecision(event.target.value)}
              size="small"
              fullWidth
              disabled={props.readOnly}
            >
              {DVT_DECISION_OPTIONS.map((option) => (
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
                  console.log("Submit DVT decision", {
                    remarks: dvtRemarks,
                    decision: dvtDecision,
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

export default DVTApplicantSummary;