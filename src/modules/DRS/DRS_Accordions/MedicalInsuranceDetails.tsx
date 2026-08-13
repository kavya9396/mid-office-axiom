import { Box, Typography } from "@mui/material";
import { useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomTable, { type Column } from "../../../components/ui/Table/Table";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useAppSelector } from "../../../store/hooks";
import { formatDateForUI } from "../../../utils/helpers";

type ExistingInsuranceRow = {
  policyNumber: string;
  plan: string;
  type: string;
  companyName: string;
  sumAssured: string;
  dateOfCommencement: string;
};

type SimultaneousPolicyRow = {
  companyName: string;
  sumAssured: string;
  type: string;
  plan: string;
  policyStatus: string;
};

type ApprovalRequired = {
  financial: boolean;
  medical: boolean;
  both: boolean;
};

const existingInsuranceColumns: Column<ExistingInsuranceRow>[] = [
  { key: "policyNumber", header: "Policy No." },
  { key: "plan", header: "Plan" },
  { key: "type", header: "Type" },
  { key: "companyName", header: "Company Name" },
  { key: "sumAssured", header: "Sum Assured" },
  { key: "dateOfCommencement", header: "Date Of Commencement" },
];

const simultaneousPolicyColumns: Column<SimultaneousPolicyRow>[] = [
  { key: "companyName", header: "Company Name" },
  { key: "sumAssured", header: "Sum Assured" },
  { key: "type", header: "Type" },
  { key: "plan", header: "Plan" },
  { key: "policyStatus", header: "Policy Status" },
];

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toText = (value: unknown): string => String(value ?? "").trim();

const getFirstText = (source: Record<string, unknown>, keys: string[], fallback = "-"): string => {
  for (const key of keys) {
    const value = toText(source[key]);
    if (value) {
      return value;
    }
  }

  return fallback;
};

const formatCurrency = (value: unknown): string => {
  const textValue = toText(value);
  if (!textValue || textValue === "-") {
    return "-";
  }

  const numericValue = Number(textValue.replace(/,/g, ""));
  if (!Number.isFinite(numericValue)) {
    return textValue;
  }

  return `₹ ${numericValue.toLocaleString("en-IN")}`;
};

const formatDate = (value: unknown): string => {
  const textValue = toText(value);
  if (!textValue || textValue === "-") return "-";
  // Delegate to shared formatter which enforces IST and consistent format.
  return formatDateForUI(textValue);
};

const toExistingInsuranceRow = (item: unknown): ExistingInsuranceRow => {
  const record = toRecord(item);

  return {
    policyNumber: getFirstText(record, ["policyNumber", "policyNo"]),
    plan: getFirstText(record, ["plan", "productType"]),
    type: getFirstText(record, ["type", "policyType"], "Medical"),
    companyName: getFirstText(record, ["companyName", "insurerName"], "ICICI Pru"),
    sumAssured: formatCurrency(record.sumAssured),
    dateOfCommencement: formatDate(record.dateOfCommencement ?? record.dateOfIssuance),
  };
};

const toSimultaneousPolicyRow = (item: unknown): SimultaneousPolicyRow => {
  const record = toRecord(item);

  return {
    companyName: getFirstText(record, ["companyName", "insurerName"], "ICICI Pru"),
    sumAssured: formatCurrency(record.sumAssured),
    type: getFirstText(record, ["type", "policyType"], "Medical"),
    plan: getFirstText(record, ["plan", "productType"]),
    policyStatus: getFirstText(record, ["policyStatus", "status", "decision"], "Active"),
  };
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  return ["yes", "y", "true"].includes(toText(value).toLowerCase());
};

const ApprovalToggle = ({ label, value }: { label: string; value: boolean }) => (
  <Box sx={{ minWidth: 88 }}>
    <Typography sx={{ fontSize: "12px", color: "#6b7280", mb: 0.75 }}>{label}</Typography>
    <Box sx={{ display: "flex", gap: 1 }}>
      <CustomButton
        size="small"
        variant={value ? "contained" : "outlined"}
        sx={{
          minWidth: 42,
          px: 1,
          py: 0.35,
          borderRadius: "6px",
          fontSize: "12px",
          pointerEvents: "none",
          backgroundColor: value ? "#f97316" : "#fff",
          borderColor: value ? "#f97316" : "#e5e7eb",
          color: value ? "#fff" : "#9ca3af",
          "&:hover": { backgroundColor: value ? "#f97316" : "#fff", borderColor: value ? "#f97316" : "#e5e7eb" },
        }}
      >
        Yes
      </CustomButton>
      <CustomButton
        size="small"
        variant={!value ? "contained" : "outlined"}
        sx={{
          minWidth: 42,
          px: 1,
          py: 0.35,
          borderRadius: "6px",
          fontSize: "12px",
          pointerEvents: "none",
          backgroundColor: !value ? "#f97316" : "#fff",
          borderColor: !value ? "#f97316" : "#e5e7eb",
          color: !value ? "#fff" : "#9ca3af",
          "&:hover": { backgroundColor: !value ? "#f97316" : "#fff", borderColor: !value ? "#f97316" : "#e5e7eb" },
        }}
      >
        No
      </CustomButton>
    </Box>
  </Box>
);

type MedicalInsuranceDetailsProps = {
  data?: unknown;
};

const MedicalInsuranceDetails = ({ data: dataOverride }: MedicalInsuranceDetailsProps = {}) => {
  const storeData = useAppSelector((state) => state.drs.data);
  const data = dataOverride ?? storeData;
  const [medicalProfile, setMedicalProfile] = useState({
    pastMedicalHistory: "",
    currentMedicalCondition: "",
    remarks: "",
  });
  const dataRecord = toRecord(data);
  const details = toRecord(dataRecord.medicalInsuranceDetails);
  const quickLinks = toRecord(dataRecord.quickLinks);
  const fallbackPolicies = Array.isArray(quickLinks.previousPolicies) ? quickLinks.previousPolicies : [];
  const existingInsuranceSource = Array.isArray(details.existingInsuranceDetails)
    ? details.existingInsuranceDetails
    : fallbackPolicies;
  const simultaneousPolicySource = Array.isArray(details.simultaneousAppliedPolicies)
    ? details.simultaneousAppliedPolicies
    : [];
  const approvalSource = toRecord(details.approvalRequired);
  const approvalRequired: ApprovalRequired = {
    financial: toBoolean(approvalSource.financial),
    medical: toBoolean(approvalSource.medical),
    both: toBoolean(approvalSource.both),
  };
  const existingInsuranceRows = existingInsuranceSource.map(toExistingInsuranceRow);
  const simultaneousPolicyRows = simultaneousPolicySource.map(toSimultaneousPolicyRow);
  const hasDetails =
    Object.keys(details).length > 0 ||
    existingInsuranceRows.length > 0 ||
    simultaneousPolicyRows.length > 0;

  if (!hasDetails) {
    return null;
  }

  return (
    // <Container disableGutters>
      <Box sx={{ p:1 }}>
        <CustomAccordion title="Medical and Insurance Details" defaultExpanded>
          <Box sx={{ p: 1, backgroundColor: "#f6f6f6", borderRadius: "8px" }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#4b5563", mb: 1 }}>Medical Profile</Typography>
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <CustomTextField
                label="Past Medical History"
                value={medicalProfile.pastMedicalHistory}
                onChange={(event) =>
                  setMedicalProfile((current) => ({ ...current, pastMedicalHistory: event.target.value }))
                }
                multiline
                minRows={2}
                fullWidth
                sx={{ backgroundColor: "#fff" }}
              />
              <CustomTextField
                label="Current Medical Condition"
                value={medicalProfile.currentMedicalCondition}
                onChange={(event) =>
                  setMedicalProfile((current) => ({ ...current, currentMedicalCondition: event.target.value }))
                }
                multiline
                minRows={2}
                fullWidth
                sx={{ backgroundColor: "#fff" }}
              />
              <CustomTextField
                label="Remarks, if any"
                value={medicalProfile.remarks}
                onChange={(event) =>
                  setMedicalProfile((current) => ({ ...current, remarks: event.target.value }))
                }
                multiline
                minRows={2}
                fullWidth
                sx={{ backgroundColor: "#fff" }}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <CustomTable<ExistingInsuranceRow>
              title="Existing Insurance Details"
              columns={existingInsuranceColumns}
              data={existingInsuranceRows}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <CustomTable<SimultaneousPolicyRow>
              title="Simultaneous Applied Policies"
              columns={simultaneousPolicyColumns}
              data={simultaneousPolicyRows}
            />
          </Box>

          <Box sx={{ mt: 2, p: 1.5, backgroundColor: "#f6f6f6", borderRadius: "8px" }}>
            <Typography sx={{ fontSize: "12px", color: "#6b7280", mb: 1.5 }}>Approval required for:</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <ApprovalToggle label="Financial" value={approvalRequired.financial} />
              <ApprovalToggle label="Medical" value={approvalRequired.medical} />
              <ApprovalToggle label="Both" value={approvalRequired.both} />
            </Box>
          </Box>
        </CustomAccordion>
      </Box>
    // </Container>
  );
};

export default MedicalInsuranceDetails;