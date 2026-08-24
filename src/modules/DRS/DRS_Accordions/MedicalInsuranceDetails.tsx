import {
  Box,
  Typography,
} from "@mui/material";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomTable, {
  type Column,
} from "../../../components/ui/Table/Table";
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
  acceptanceTerms: string;
  policyStatus: string;
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

type MedicalInsuranceDetailsProps = {
  data?: unknown;
};

const existingInsuranceColumns: Column<ExistingInsuranceRow>[] =
  [
    {
      key: "policyNumber",
      header: "Policy No.",
    },
    {
      key: "plan",
      header: "Plan",
    },
    {
      key: "type",
      header: "Type",
    },
    {
      key: "companyName",
      header: "Company Name",
    },
    {
      key: "sumAssured",
      header: "Sum Assured",
    },
    {
      key: "dateOfCommencement",
      header: "Date Of Commencement",
    },
    {
      key: "acceptanceTerms",
      header: "Acceptance Terms",
    },
    {
      key: "policyStatus",
      header: "Policy Status",
    },
  ];

const simultaneousPolicyColumns: Column<SimultaneousPolicyRow>[] =
  [
    {
      key: "companyName",
      header: "Company Name",
    },
    {
      key: "sumAssured",
      header: "Sum Assured",
    },
    {
      key: "type",
      header: "Type",
    },
    {
      key: "plan",
      header: "Plan",
    },
    {
      key: "policyStatus",
      header: "Policy Status",
    },
  ];

const toRecord = (
  value: unknown,
): Record<string, unknown> =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toText = (value: unknown): string =>
  String(value ?? "").trim();

const getFirstText = (
  source: Record<string, unknown>,
  keys: string[],
  fallback = "-",
): string => {
  for (const key of keys) {
    const value = toText(source[key]);

    if (value) {
      return value;
    }
  }

  return fallback;
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  return ["yes", "y", "true", "1"].includes(
    toText(value).toLowerCase(),
  );
};

const formatCurrency = (
  value: unknown,
): string => {
  const textValue = toText(value);

  if (!textValue || textValue === "-") {
    return "-";
  }

  const numericValue = Number(
    textValue.replace(/,/g, ""),
  );

  if (!Number.isFinite(numericValue)) {
    return textValue;
  }

  return `₹ ${numericValue.toLocaleString(
    "en-IN",
  )}`;
};

const formatDate = (
  value: unknown,
): string => {
  const textValue = toText(value);

  if (!textValue || textValue === "-") {
    return "-";
  }

  return formatDateForUI(textValue);
};

const toExistingInsuranceRow = (
  item: unknown,
): ExistingInsuranceRow => {
  const record = toRecord(item);

  return {
    policyNumber: getFirstText(record, [
      "policyNumber",
      "policyNo",
    ]),

    plan: getFirstText(record, [
      "plan",
      "productType",
    ]),

    type: getFirstText(record, [
      "type",
      "policyType",
    ]),

    companyName: getFirstText(record, [
      "companyName",
      "insurerName",
    ]),

    sumAssured: formatCurrency(
      record.sumAssured,
    ),

    dateOfCommencement: formatDate(
      record.dateOfCommencement ??
        record.dateOfIssuance,
    ),

    acceptanceTerms: getFirstText(record, [
      "acceptanceTerms",
    ]),

    policyStatus: getFirstText(record, [
      "policyStatus",
      "status",
    ]),
  };
};

const toSimultaneousPolicyRow = (
  item: unknown,
): SimultaneousPolicyRow => {
  const record = toRecord(item);

  return {
    companyName: getFirstText(record, [
      "companyName",
      "insurerName",
    ]),

    sumAssured: formatCurrency(
      record.sumAssured,
    ),

    type: getFirstText(record, [
      "type",
      "policyType",
    ]),

    plan: getFirstText(record, [
      "plan",
      "productType",
    ]),

    policyStatus: getFirstText(record, [
      "policyStatus",
      "status",
      "decision",
    ]),
  };
};

const ApprovalToggle = ({
  label,
  value,
}: {
  label: string;
  value: boolean;
}) => (
  <Box sx={{ minWidth: 88 }}>
    <Typography
      sx={{
        fontSize: "12px",
        color: "#6b7280",
        mb: 0.75,
      }}
    >
      {label}
    </Typography>

    <Box sx={{ display: "flex", gap: 1 }}>
      <CustomButton
        size="small"
        variant={
          value ? "contained" : "outlined"
        }
        sx={{
          minWidth: 42,
          px: 1,
          py: 0.35,
          borderRadius: "6px",
          fontSize: "12px",
          pointerEvents: "none",
          backgroundColor: value
            ? "#f97316"
            : "#fff",
          borderColor: value
            ? "#f97316"
            : "#e5e7eb",
          color: value
            ? "#fff"
            : "#9ca3af",
        }}
      >
        Yes
      </CustomButton>

      <CustomButton
        size="small"
        variant={
          !value ? "contained" : "outlined"
        }
        sx={{
          minWidth: 42,
          px: 1,
          py: 0.35,
          borderRadius: "6px",
          fontSize: "12px",
          pointerEvents: "none",
          backgroundColor: !value
            ? "#f97316"
            : "#fff",
          borderColor: !value
            ? "#f97316"
            : "#e5e7eb",
          color: !value
            ? "#fff"
            : "#9ca3af",
        }}
      >
        No
      </CustomButton>
    </Box>
  </Box>
);

const MedicalInsuranceDetails = ({
  data: dataOverride,
}: MedicalInsuranceDetailsProps = {}) => {
  const storeData = useAppSelector(
    (state) => state.prelogin.data,
  );

  const data = dataOverride ?? storeData;
  const dataRecord = toRecord(data);

  const details = toRecord(
    dataRecord.medicalInsuranceDetails,
  );

  const medicalProfile = toRecord(
    details.medicalProfile,
  );

  const existingInsuranceSource =
    Array.isArray(
      details.existingInsuranceDetails,
    )
      ? details.existingInsuranceDetails
      : [];

  const simultaneousPolicySource =
    Array.isArray(
      details.simultaneousAppliedPolicies,
    )
      ? details.simultaneousAppliedPolicies
      : [];

  const approvalSource = toRecord(
    details.approvalRequired,
  );

  const approvalRequired: ApprovalRequired = {
    financial: toBoolean(
      approvalSource.financial,
    ),

    medical: toBoolean(
      approvalSource.medical,
    ),

    both: toBoolean(approvalSource.both),
  };

  const existingInsuranceRows =
    existingInsuranceSource.map(
      toExistingInsuranceRow,
    );

  const simultaneousPolicyRows =
    simultaneousPolicySource.map(
      toSimultaneousPolicyRow,
    );

  const pastMedicalHistory = getFirstText(
    medicalProfile,
    ["pastMedicalHistory"],
  );

  const currentMedicalHistory =
    getFirstText(medicalProfile, [
      "currentMedicalHistory",
      "currentMedicalCondition",
    ]);

  const remarks = getFirstText(
    medicalProfile,
    ["remarks"],
  );

  const hasDetails =
    Object.keys(medicalProfile).length > 0 ||
    existingInsuranceRows.length > 0 ||
    simultaneousPolicyRows.length > 0 ||
    approvalRequired.financial ||
    approvalRequired.medical;

  if (!hasDetails) {
    return null;
  }

  return (
    <Box sx={{ px: 1 }}>
      <CustomAccordion
        title="Medical and Insurance Details"
        defaultExpanded
      >
        <Box
          sx={{
            p: 1,
            backgroundColor: "#f6f6f6",
            borderRadius: "8px",
          }}
        >
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#4b5563",
              mb: 1,
            }}
          >
            Medical Profile
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 1.5,
            }}
          >
            <CustomTextField
              label="Past Medical History"
              value={pastMedicalHistory}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              multiline
              minRows={2}
              fullWidth
              sx={{
                backgroundColor: "#fff",
              }}
            />

            <CustomTextField
              label="Current Medical Condition"
              value={currentMedicalHistory}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              multiline
              minRows={2}
              fullWidth
              sx={{
                backgroundColor: "#fff",
              }}
            />

            <CustomTextField
              label="Remarks, if any"
              value={remarks}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              multiline
              minRows={2}
              fullWidth
              sx={{
                backgroundColor: "#fff",
              }}
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
            columns={
              simultaneousPolicyColumns
            }
            data={simultaneousPolicyRows}
          />
        </Box>

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            backgroundColor: "#f6f6f6",
            borderRadius: "8px",
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              color: "#6b7280",
              mb: 1.5,
            }}
          >
            Approval required for:
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            <ApprovalToggle
              label="Financial"
              value={
                approvalRequired.financial
              }
            />

            <ApprovalToggle
              label="Medical"
              value={
                approvalRequired.medical
              }
            />

            <ApprovalToggle
              label="Both"
              value={approvalRequired.both}
            />
          </Box>
        </Box>
      </CustomAccordion>
    </Box>
  );
};

export default MedicalInsuranceDetails;