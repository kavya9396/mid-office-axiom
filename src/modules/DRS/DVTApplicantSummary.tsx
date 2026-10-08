import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";

import { useState, type ComponentProps } from "react";

import { useAppSelector } from "../../store/hooks";

import type { AdditionalRequirementRow } from "../../types/drs.types";

import CustomDialog from "../../components/ui/Dialog/Dialog";

import { RefreshIcon } from "../../icons/Icons";

import ApplicantApplicationSummary from "./ApplicantSummary";

import BreDecision from "./DRS_Accordions/BreDecision";

import DVTApplicantProfile from "./DRS_Accordions/DVTApplicantProfile";

import RequirementManagementTable from "./DRS_Accordions/RequirementManagementTable";

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

type RecordValue = Record<string, unknown>;

type HeaderDetail = { label: string; value: string };

const DVT_TASK_OPTIONS = [
  "Accept",

  "Raise Requirements",

  "Refer to Risk",

  "Refer to IT",

  "Refer to GUW",
] as const;

const DVT_FORMAL_OPTIONS = [
  "Accept",

  "Raise Requirements",

  "Refer to GUW",
] as const;

const asRecord = (value: unknown): RecordValue =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordValue)
    : {};

const displayValue = (...values: unknown[]) => {
  const value = values.find(
    (item) => item !== undefined && item !== null && String(item).trim() !== "",
  );

  return value === undefined || value === null ? "-" : String(value);
};

const DVTApplicantSummary = (props: DVTApplicantSummaryProps) => {
  const [memberIndex, setMemberIndex] = useState(props.initialMemberIndex ?? 0);

  const [addRowSignal, setAddRowSignal] = useState(0);

  const [remarks, setRemarks] = useState("");

  const [decision, setDecision] = useState("");

  const [decisionCode, setDecisionCode] = useState("");

  const [isBreDialogOpen, setIsBreDialogOpen] = useState(false);

  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  const roleType = localStorage.getItem("roleType") ?? "";

  const decisionOptions =
    roleType === "DVT_TASK" ? DVT_TASK_OPTIONS : DVT_FORMAL_OPTIONS;

  const source = useAppSelector((state) =>
    props.readOnly ? state.searchApplication.response?.data : state.drs.data,
  );

  const sourceData = asRecord(source);

  const initialBre = asRecord(sourceData.breDecision);

  const latestBre = asRecord(sourceData.latestBreDecision);

  const requirements = Array.isArray(sourceData.requirementManagement)
    ? (sourceData.requirementManagement as AdditionalRequirementRow[])
    : [];

  const initialBreDecision = displayValue(
    initialBre.overallDecision,

    initialBre.finalDecision,

    initialBre.decision,

    initialBre.decisionCode,

    initialBre.status,
  );

  const finalBreDecision = displayValue(
    latestBre.overallDecision,

    latestBre.finalDecision,

    latestBre.decision,

    latestBre.decisionCode,

    latestBre.status,
  );

  const informalHeaderDetails: HeaderDetail[] = [
    ["Agent Name", "Ram"],

    ["Agent Code", "AG123"],

    ["Customer Type", "Individual"],

    ["Policy Type", "Saving"],

    ["Master Policy No.", "MP123"],

    ["LAN No.", "123456"],

    ["Login Date", "14 Sep 2026"],

    ["Premium", "12,000"],

    ["PT", "130"],

    ["PPT", "149"],

    ["Payment Mode", "Monthly"],

    ["Call ID", "-"],
  ].map(([label, value]) => ({ label, value }));

  const formalHeaderDetails: HeaderDetail[] = [
    ["Policy No.", "POL123456"],

    ["Applied Sum Assured", "50,00,000"],

    ["Channel", "Agency"],

    ["Sub Channel", "Direct"],

    ["Agent Code", "AG123"],

    ["Agent Name", "Ram"],

    ["Premium", "52,000"],

    ["Cover Requested", "50,00,000"],

    ["Cover Provided", "45,00,000"],

    ["Free Cover", "10,00,000"],

    ["Cover above FCL", "35,00,000"],

    ["Call ID", "-"],
  ].map(([label, value]) => ({ label, value }));

  const headerDetails =
    roleType === "DVT_FORMAL_TASK"
      ? formalHeaderDetails
      : informalHeaderDetails;

  const eligibilityData = asRecord(sourceData.eligibilityParameters);

  const eligibilityParameters: HeaderDetail[] = [
    "TMSA",

    "TRSA",

    "TFESA",

    "TSA",

    "TPSA",

    "TFSA",
  ].map((key) => ({
    label: key,

    value: displayValue(
      eligibilityData[key.toLowerCase()],

      sourceData[key.toLowerCase()],
    ),
  }));

  const groupData = asRecord(
    sourceData.groupPolicyDetails ??
      sourceData.groupPolicyDetail ??
      sourceData.groupPolicy,
  );

  const groupPolicyDetails: HeaderDetail[] =
    roleType === "DVT_TASK"
      ? [
          ["Coverage Option", "coverageOption"],

          ["Coverage Status", "coverageStatus"],

          ["Moratorium", "moratorium"],

          ["Moratorium Period", "moratoriumPeriod"],

          ["Share of Loan", "shareOfLoan"],

          ["Loan Type", "loanType"],

          ["Bank Type", "bankType"],

          ["Type of Loan", "typeOfLoan"],

          ["Date of Loan Disbursement", "dateOfLoanDisbursement"],
        ].map(([label, key]) => ({
          label,

          value: displayValue(groupData[key], sourceData[key]),
        }))
      : [];

  const riskDetails = asRecord(sourceData.riskDetails ?? sourceData.riskDetail);

  const riskDetailFields: HeaderDetail[] = [
    ["Accuity Risk Indicator", "accuityRiskIndicator"],

    ["Adverse IIB Match", "adverseIibMatch"],

    ["Risk Flag", "riskFlag"],

    ["High Risk Category", "highRiskCategory"],

    ["Source", "highRiskCategory"],
  ].map(([label, key]) => ({
    label,

    value: displayValue(riskDetails[key], sourceData[key]),
  }));

  const sectionDisplay = isDetailViewOpen ? "none" : undefined;

  const decisionChip = (label: string, value: string, isFinal = false) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Typography sx={{ fontSize: 11, color: "#756D69" }}>{label}</Typography>

      <Typography
        sx={{
          px: 1.1,

          py: 0.35,

          fontSize: 12,

          fontWeight: 700,

          borderRadius: 1,

          bgcolor: isFinal ? "#EEF8F1" : "#F4F3F2",

          border: `1px solid ${isFinal ? "#B8DCC0" : "#DED9D6"}`,

          color: isFinal ? "#28743C" : "#4E4743",
        }}
      >
        {value}
      </Typography>
    </Box>
  );

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
      eligibilityParameters={eligibilityParameters}
      groupPolicyDetails={groupPolicyDetails}
      showFaceValue={false}
      afterHeader={
        <Box sx={{ display: "grid", gap: 1 }}>
          <Box
            component="section"
            aria-label="BRE Decision"
            sx={{
              display: sectionDisplay ?? "flex",

              alignItems: "center",

              minHeight: 46,

              px: 1.5,

              py: 0.75,

              gap: 2,

              border: "1px solid #E7DDD7",

              borderRadius: 1.5,

              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{
                pr: 2,

                fontSize: 13,

                fontWeight: 700,

                color: "#8D232A",

                borderRight: "1px solid #E7DDD7",
              }}
            >
              BRE Decision
            </Typography>

            {decisionChip("Initial", initialBreDecision)}

            {decisionChip("Final", finalBreDecision, true)}

            <Box sx={{ flex: 1 }} />

            {!props.readOnly && (
              <Button
                size="small"
                variant="outlined"
                aria-label="BRE Retrigger"
                title="BRE Retrigger"
                startIcon={<RefreshIcon width={16} />}
                onClick={() => console.log("BRE Retrigger clicked")}
                sx={{
                  minWidth: 28,

                  width: 28,

                  height: 26,

                  p: 0,

                  borderColor: "#E45F14",

                  color: "#E45F14",

                  "& .MuiButton-startIcon": { m: 0 },
                }}
              />
            )}

            <Button
              size="small"
              variant="outlined"
              onClick={() => setIsBreDialogOpen(true)}
              sx={{
                borderColor: "#E45F14",

                color: "#E45F14",

                textTransform: "none",
              }}
            >
              View Detail
            </Button>
          </Box>

          <Box
            component="section"
            aria-label="Risk Details"
            sx={{
              display: sectionDisplay ?? "grid",

              gridTemplateColumns: "120px repeat(5, minmax(0, 1fr))",

              columnGap: 0.5,

              p: 0.35,

              border: "1px solid #E7DDD7",

              borderRadius: 1.5,
            }}
          >
            <Typography
              sx={{
                pr: 0.5,
                fontSize: 11,
                fontWeight: 800,
                color: "#8D232A",
                lineHeight: 1.2,
                borderRight: "1px solid #E7DDD7",
              }}
            >
              Risk Details
            </Typography>

            {riskDetailFields.map((field) => (
              <Box
                key={field.label}
                sx={{
                  minWidth: 0,
                  pr: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.35,
                  borderRight: "1px solid #F0E7E2",
                  "&:last-child": { pr: 0, borderRight: 0 },
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    flexShrink: 0,
                    fontSize: 10,
                    color: "#756D69",
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {field.label}
                </Typography>

                <Typography
                  component="span"
                  sx={{
                    minWidth: 0,
                    fontSize: 11,

                    fontWeight: 700,

                    color: "#3D3632",

                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {field.value}
                </Typography>
              </Box>
            ))}
          </Box>

          <CustomDialog
            open={!isDetailViewOpen && isBreDialogOpen}
            onClose={() => setIsBreDialogOpen(false)}
            title="BRE Decision"
            maxWidth="lg"
            fullWidth
            contentSx={{ p: { xs: 1, sm: 1.5 } }}
          >
            <BreDecision readOnly={props.readOnly} />
          </CustomDialog>

          <DVTApplicantProfile
            readOnly={props.readOnly}
            roleType={roleType}
            initialMemberIndex={memberIndex}
            onMemberChange={setMemberIndex}
            onDetailViewChange={(isOpen) => {
              setIsDetailViewOpen(isOpen);

              if (isOpen) setIsBreDialogOpen(false);
            }}
          />

          <Box
            component="section"
            aria-label="Requirement Management"
            sx={{
              display: sectionDisplay ?? "block",

              border: "1px solid #E7DDD7",

              borderRadius: 1.5,

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

                borderBottom: "1px solid #E7DDD7",

                bgcolor: "#FFF8F3",
              }}
            >
              <Typography
                sx={{ fontSize: 13, fontWeight: 800, color: "#8D232A" }}
              >
                Requirement Management
              </Typography>

              {!props.readOnly && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setAddRowSignal((value) => value + 1)}
                  sx={{
                    borderColor: "#E45F14",

                    color: "#E45F14",

                    textTransform: "none",
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

          <Box
            component="section"
            aria-label="DVT Decision"
            sx={{
              p: 1.25,

              display: sectionDisplay ?? "grid",

              gridTemplateColumns: {
                xs: "1fr",

                md: "minmax(0, 1fr) 250px 220px auto",
              },

              gap: 1.25,

              alignItems: "center",

              border: "1px solid #D8D8D8",

              borderLeft: "4px solid #E45F14",

              borderRadius: 2,
            }}
          >
            <TextField
              label="DVT Remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              multiline
              minRows={1}
              size="small"
              fullWidth
              disabled={props.readOnly}
            />

            <TextField
              select
              label="DVT Decision"
              value={decision}
              onChange={(event) => setDecision(event.target.value)}
              size="small"
              fullWidth
              disabled={props.readOnly}
            >
              {decisionOptions.map((option) => (
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
                variant="contained"
                onClick={() =>
                  console.log("Submit DVT decision", {
                    remarks,

                    decision,

                    decisionCode,
                  })
                }
                sx={{
                  minWidth: 88,

                  bgcolor: "#E45F14",

                  textTransform: "none",

                  "&:hover": { bgcolor: "#C94F0B" },
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
