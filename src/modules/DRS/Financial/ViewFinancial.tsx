import { Box, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../../components/layout/BackButton";
// import Badge from "../../../components/ui/Badge/Badge";
import CustomButton from "../../../components/ui/Button/Button";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTabs from "../../../components/ui/Tabs/Tabs";
import CustomTextField from "../../../components/ui/TextField/TextField";
import CustomTable, { type Column } from "../../../components/ui/Table/Table";
import { useAppContext } from "../../../hooks/useAppContext";
// import { BriefcaseIcon, PhoneIcon, SmsIcon, WalletIcon } from "../../../icons/Icons";
import { getDRSPath, getFinancialPath, getMedicalPath } from "../../../routes/routes";
import { apiRequest } from "../../../services/api";
import { url } from "../../../services/apiConfig";
import type { ApiKey } from "../../../services/apiConfig";
import { useAppDispatch } from "../../../store/hooks";
import type { RootState } from "../../../store/store";
import { financialThunk } from "../../../store/thunks/financialThunk";
import type { ApplicantTab, DRSRequest, FinancialResponse } from "../../../types/drs.types";
import { applicantTabs } from "../../../utils/constant";
import { getFinancialFieldRule, validateFinancialFieldValue, validateFinancialSectionValues } from "../../../validations/financialValidation";
import { getErrorMessage } from "../../../config/errorMessages";
// import { formatCurrencyINR } from "../../../utils/helpers";
import BreDecision from "../DRS_Accordions/BreDecision";
// import ApplicantProfile from "../DRS_Accordions/ApplicantProfile/ApplicantProfile";
import FormalMemberProfile from "../DRS_Accordions/ApplicantProfile/FormalMemberProfile";
import { buildFormalMemberProfile, isFormalTaskRole } from "../formalProfileHelpers";
import {
  financialSections,
  type FinancialField,
  type FinancialSectionConfig,
  type FinancialSectionKey,
} from "./financialAccordionConfig";
import ApplicantProfile from "../DRS_Accordions/ApplicantProfile/ApplicantProfile";

const getRoleType = () => localStorage.getItem("roleType") ?? "";
const getStoredApplicantTab = () =>
  (localStorage.getItem("drsSelectedApplicantTab") as ApplicantTab | null) ?? "proposer";

type DRSViewTab = "medical" | "financial";

const drsViewTabs: { key: DRSViewTab; label: string }[] = [
  { key: "medical", label: "View Medical" },
  { key: "financial", label: "View Financial" },
];

const buildInitialFieldValues = (sections: FinancialSectionConfig[] = financialSections) => {
  return sections.reduce<Record<FinancialSectionKey, Record<string, string>>>(
    (accumulator, section) => {
      accumulator[section.key] = section.items.reduce<Record<string, string>>((itemAccumulator, item) => {
        itemAccumulator[item.label] = item.value == null ? "" : String(item.value);
        return itemAccumulator;
      }, {});

      return accumulator;
    },
    {} as Record<FinancialSectionKey, Record<string, string>>
  );
};

const buildFinancialSectionsFromResponse = (responseSections: FinancialResponse["sections"] = []) => {
  const responseSectionsByKey = new Map(responseSections.map((section) => [section.key, section]));

  return financialSections.map((section) => {
    const responseSection = responseSectionsByKey.get(section.key);

    if (!responseSection) {
      return section;
    }

    const responseItemsByLabel = new Map(responseSection.items.map((item) => [item.label, item]));

    return {
      ...section,
      columns: responseSection.columns ?? section.columns,
      items: section.items.map((item) => {
        const responseItem = responseItemsByLabel.get(item.label);

        return {
          ...item,
          value: responseItem?.value ?? "",
          isMandatory: responseItem?.isMandatory ?? item.isMandatory,
          mandatoryCondition: responseItem?.mandatoryCondition ?? item.mandatoryCondition,
        };
      }),
    };
  });
};

// const getMemberSummary = (member?: MedicalSummaryMember) => {
//   if (!member) {
//     return undefined;
//   }

//   if (member.memberType === "proposer") {
//     return member.proposerSummary;
//   }

//   if (member.memberType === "lifeassured1") {
//     return member.lifeassured1Summary;
//   }

//   if (member.memberType === "lifeassured2") {
//     return member.lifeassured2Summary;
//   }

//   return undefined;
// };

// const getApplicantHeaderData = (summary?: MedicalSummaryMember) => {
//   const memberSummary = getMemberSummary(summary);

//   return {
//     name:
//       [memberSummary?.firstName, memberSummary?.middleName, memberSummary?.lastName]
//         .filter(Boolean)
//         .join(" ") || "-",
//     dob: memberSummary?.dob ?? "-",
//     age: memberSummary?.age ?? "-",
//     gender: memberSummary?.gender ?? "-",
//     profileImage: memberSummary?.profileImage ?? "",
//     occupation: memberSummary?.occupation ?? "-",
//     annualIncome: memberSummary?.annualIncome,
//     email: memberSummary?.email ?? "-",
//     mobile: memberSummary?.mobile ?? "-",
//   };
// };

const readOnlyBoxSx = {
  minHeight: 38,
  px: 1.25,
  py: 0.95,
  borderRadius: "8px",
  backgroundColor: "#EFF1F3",
  border: "1px solid #E4E7EC",
  color: "#344054",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
};

const getFieldValue = (
  values: Record<FinancialSectionKey, Record<string, string>>,
  section: FinancialSectionKey,
  label: string,
  fallback?: string | number | boolean
) => {
  const value = values[section]?.[label];
  if (value != null && value !== "") {
    return value;
  }

  if (fallback == null || fallback === "") {
    return "";
  }

  return String(fallback);
};

const FORM_16_TABLE_LABELS = [
  "ASSESSMENT",
  "Gross Salary PA",
  "Average Annual Income",
  "Life Assured Pan No",
  "Life Assured Name",
];

const FORM_16A_TABLE_LABELS = [
  "Assessment Year",
  "Net Receipt pa",
  "Average Annual Income",
];

const COMPUTATION_OF_INCOME_TABLE_LABELS = [
  "Assessment Year",
  "Income from Salary(A)",
  "Income from House Property",
  "Income from Business or Profession (B)",
  "Short term & Capital Gains",
  "Income from Other Sources",
  "Agricultural Income",
  "Exempt Income(C)",
  "Gross Total Income",
  "Total Gross Total Income",
  "Average Gross Total Income",
];

const ITR_NON_INDIVIDUAL_TABLE_LABELS = [
  "Assessment Year",
  "ITR Acknowledgement Number",
  "Income from Salary",
  "Income from House Property",
  "Income from Business or Profession",
  "Short term & Capital Gains",
  "Income from Other Sources",
  "Agricultural Income",
  "Exempt Income",
  "Gross Total Income",
  "Total Gross Total Income",
  "Average Gross Total Income",
];

const ITR_INDIVIDUAL_TABLE_LABELS = [
  "Assessment Year",
  "ITR Acknowledgement Number",
  "Date of Filling ITR",
  "Income from Salary(A)",
  "Income from House Property",
  "Income from Business or Profession(B)",
  "Short term & Capital Gains",
  "Income from Other Sources",
  "Agricultural Income",
  "Exempt Income(C)",
  "Gross Total Income(A+B+C)",
  "Total Gross Total Income",
  "Average Gross Total Income",
  "PF deduction - Salaried customers",
  "Life Assured Name",
  "Is Life Assured Name Same?",
];

const PROFIT_AND_LOSS_TABLE_LABELS = [
  "As Per Accounts of Proposer Co.",
  "Assessment Year",
  "Shareholders Funds / Partners Capital",
  "Share Capital or Fixed/Fluctuating Capital",
  "Reserves & Surplus",
  "Total Shareholders Funds or Partner's Fund",
  "Profit Calculation",
  "Profit Before Depreciation & Tax (PBDT)",
  "Less : Depreciation",
  "Profit Before Tax (PBT)",
  "Tax",
  "Profit After Tax (PAT)",
  "Profit After Tax of Last Year",
  "Rise In Profit as compared to Last Year",
  "% Rise In Profit as compared to Last Year",
  "Income Calculation",
  "Sales",
  "Sales of Last Year",
  "Rise In Sales as compared to Last Year",
  "% Rise In Sales as compared to Last Year",
  "Average Gross Income",
  "Average Profit Before Tax",
  "Average Profit After Tax",
];

const GST_INCOME_TABLE_LABELS = [
  "Assessment Year",
  "Gross Sales",
  "Gross Purchases",
  "Profit After GST",
  "Total of Gross Sales",
  "Average Gross Sales",
  "Average Annual Income",
];

const ITR_NON_INDIVIDUAL_TOP_FIELDS = ["Name of Organisation/Firm", "Permanent Account Number"];
const ITR_INDIVIDUAL_TOP_FIELDS = ["Name of Organisation/Firm", "Permanent Account Number"];
const PROFIT_AND_LOSS_TOP_FIELDS = ["Name of Organization/Firm"];

const FORM_J_ROW_LABELS = [
  "Is Form J in the name of LA",
  "Month1",
  "Month2",
  "Month3",
  "Total Receipts",
  "Average Monthly Receipts",
  "Annual Receipts",
  "Derived Income",
];

const COMMISSION_MONTH_LABELS = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"] as const;
const COMMISSION_AVERAGE_PM_LABEL = "Average commission pm";
const COMMISSION_AVERAGE_ANNUAL_LABEL = "Average Annual Income";

type CommissionStatementCalculationRequest = {
  applicationId: string;
  roleType: string;
  months: Record<string, string>;
};

type CommissionStatementCalculationResponse = {
  averageCommissionPm?: string | number;
  averageAnnualIncome?: string | number;
  data?: {
    averageCommissionPm?: string | number;
    averageAnnualIncome?: string | number;
  };
};

type SubmitResponse = {
  success?: boolean;
  message?: string;
};

const isFieldMandatory = (field?: FinancialField) => {
  if (!field) {
    return false;
  }

  if (typeof field.isMandatory === "boolean") {
    return field.isMandatory;
  }

  if (typeof field.value === "string") {
    return /\bmandatory\b/i.test(field.value);
  }

  return false;
};

const isCommissionCalculatedField = (sectionKey: FinancialSectionKey, label: string) =>
  sectionKey === "commissionStatement" &&
  (label === COMMISSION_AVERAGE_PM_LABEL || label === COMMISSION_AVERAGE_ANNUAL_LABEL);

const parseCommissionAmount = (value: string) => {
  const normalizedValue = value.replace(/,/g, "").trim();

  if (!normalizedValue) {
    return null;
  }

  const amount = Number(normalizedValue);
  return Number.isFinite(amount) ? amount : null;
};

const formatCalculatedAmount = (value: number) => {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(2);
};

const calculateCommissionStatementValues = (months: Record<string, string>) => {
  const enteredAmounts = COMMISSION_MONTH_LABELS
    .map((label) => parseCommissionAmount(months[label] ?? ""))
    .filter((amount): amount is number => amount != null);

  if (enteredAmounts.length === 0) {
    return {
      averageCommissionPm: "",
      averageAnnualIncome: "",
    };
  }

  const totalCommission = enteredAmounts.reduce((total, amount) => total + amount, 0);
  const averageCommissionPm = totalCommission / enteredAmounts.length;

  return {
    averageCommissionPm: formatCalculatedAmount(averageCommissionPm),
    averageAnnualIncome: formatCalculatedAmount(averageCommissionPm * 12),
  };
};

const getCommissionCalculationResponseValues = (
  response: CommissionStatementCalculationResponse,
  fallback: ReturnType<typeof calculateCommissionStatementValues>,
) => ({
  averageCommissionPm: String(response.data?.averageCommissionPm ?? response.averageCommissionPm ?? fallback.averageCommissionPm),
  averageAnnualIncome: String(response.data?.averageAnnualIncome ?? response.averageAnnualIncome ?? fallback.averageAnnualIncome),
});

const getFinancialFieldValidationError = (sectionKey: FinancialSectionKey, field: FinancialField, value: string) => {
  const rule = getFinancialFieldRule(sectionKey, field.label);
  const validationError = validateFinancialFieldValue(value, rule);

  if (validationError) {
    return validationError;
  }

  if (rule) {
    return "";
  }

  if (isFieldMandatory(field) && !value.trim()) {
    return getErrorMessage("financialFieldMandatory");
  }

  return "";
};

const renderFieldValue = (
  value: string,
  isEditable: boolean,
  onChange: (value: string) => void,
  isRequired = false,
  errorText?: string,
) => {
  if (isEditable) {
    return (
      <CustomTextField
        fullWidth
        size="small"
        required={isRequired}
        error={Boolean(errorText)}
        helperText={errorText}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return <Box sx={readOnlyBoxSx}>{value}</Box>;
};

type MultiYearTableRow = {
  label: string;
  year1: string;
  year2: string;
  year3: string;
  year1FieldLabel: string;
  year2FieldLabel: string;
  year3FieldLabel: string;
  required: boolean;
};

type FourYearTableRow = {
  label: string;
  year1: string;
  year2: string;
  year3: string;
  year4: string;
  year1FieldLabel: string;
  year2FieldLabel: string;
  year3FieldLabel: string;
  year4FieldLabel: string;
  required: boolean;
};

type FormJTableRow = {
  label: string;
  receipt1: string;
  receipt2: string;
  receipt3: string;
  receipt4: string;
  receipt5: string;
  receipt6: string;
  receipt1FieldLabel: string;
  receipt2FieldLabel: string;
  receipt3FieldLabel: string;
  receipt4FieldLabel: string;
  receipt5FieldLabel: string;
  receipt6FieldLabel: string;
  required: boolean;
};

const renderMultiYearTableSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  tableLabels: string[],
  title: string,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  const tableRows: MultiYearTableRow[] = tableLabels.map((label) => {
    const item = byLabel[label.toLowerCase()];
    const year1FieldLabel = item?.label ?? label;
    const year2FieldLabel = `${label} Year 2`;
    const year3FieldLabel = `${label} Year 3`;

    return {
      label,
      year1: getFieldValue(values, section.key, year1FieldLabel, item?.value),
      year2: getFieldValue(values, section.key, year2FieldLabel, " "),
      year3: getFieldValue(values, section.key, year3FieldLabel, " "),
      year1FieldLabel,
      year2FieldLabel,
      year3FieldLabel,
      required: isFieldMandatory(item),
    };
  });

  const tableColumns: Column<MultiYearTableRow>[] = [
    {
      key: "label",
      header: "",
      width: "28%",
      render: (_, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Typography sx={{ fontSize: 13, color: "#475467" }}>{row.label}</Typography>
          {row.required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
        </Box>
      ),
    },
    {
      key: "year1",
      header: "Year 1",
      width: "24%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable,
          (nextValue) => onFieldValueChange(section.key, row.year1FieldLabel, nextValue),
          row.required,
          sectionErrors[row.year1FieldLabel]
        ),
    },
    {
      key: "year2",
      header: "Year 2",
      width: "24%",
      render: (value, row) =>
        renderFieldValue(String(value ?? ""), isEditable, (nextValue) => onFieldValueChange(section.key, row.year2FieldLabel, nextValue)),
    },
    {
      key: "year3",
      header: "Year 3",
      width: "24%",
      render: (value, row) =>
        renderFieldValue(String(value ?? ""), isEditable, (nextValue) => onFieldValueChange(section.key, row.year3FieldLabel, nextValue)),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <CustomTable title={title} columns={tableColumns} data={tableRows} />
    </Box>
  );
};

const renderForm16Section = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) =>
  renderMultiYearTableSection(
    section,
    values,
    isEditable,
    sectionErrors,
    FORM_16_TABLE_LABELS,
    "Form 16",
    onFieldValueChange
  );

const renderFourYearTableSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  tableLabels: string[],
  title: string,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  const tableRows: FourYearTableRow[] = tableLabels.map((label) => {
    const item = byLabel[label.toLowerCase()];
    const year1FieldLabel = item?.label ?? label;
    const year2FieldLabel = `${label} Year 2`;
    const year3FieldLabel = `${label} Year 3`;
    const year4FieldLabel = `${label} Year 4`;

    return {
      label,
      year1: getFieldValue(values, section.key, year1FieldLabel, item?.value),
      year2: getFieldValue(values, section.key, year2FieldLabel, " "),
      year3: getFieldValue(values, section.key, year3FieldLabel, " "),
      year4: getFieldValue(values, section.key, year4FieldLabel, " "),
      year1FieldLabel,
      year2FieldLabel,
      year3FieldLabel,
      year4FieldLabel,
      required: isFieldMandatory(item),
    };
  });

  const tableColumns: Column<FourYearTableRow>[] = [
    {
      key: "label",
      header: "",
      width: "20%",
      render: (_, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Typography sx={{ fontSize: 13, color: "#475467" }}>{row.label}</Typography>
          {row.required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
        </Box>
      ),
    },
    {
      key: "year1",
      header: "Year 1",
      width: "20%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable,
          (nextValue) => onFieldValueChange(section.key, row.year1FieldLabel, nextValue),
          row.required,
          sectionErrors[row.year1FieldLabel]
        ),
    },
    {
      key: "year2",
      header: "Year 2",
      width: "20%",
      render: (value, row) =>
        renderFieldValue(String(value ?? ""), isEditable, (nextValue) => onFieldValueChange(section.key, row.year2FieldLabel, nextValue)),
    },
    {
      key: "year3",
      header: "Year 3",
      width: "20%",
      render: (value, row) =>
        renderFieldValue(String(value ?? ""), isEditable, (nextValue) => onFieldValueChange(section.key, row.year3FieldLabel, nextValue)),
    },
    {
      key: "year4",
      header: "Year 4",
      width: "20%",
      render: (value, row) =>
        renderFieldValue(String(value ?? ""), isEditable, (nextValue) => onFieldValueChange(section.key, row.year4FieldLabel, nextValue)),
    },
  ];

  return <CustomTable title={title} columns={tableColumns} data={tableRows} />;
};

const renderForm16ASection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) =>
  renderMultiYearTableSection(
    section,
    values,
    isEditable,
    sectionErrors,
    FORM_16A_TABLE_LABELS,
    section.title,
    onFieldValueChange
  );

const renderComputationOfIncomeSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) =>
  renderMultiYearTableSection(
    section,
    values,
    isEditable,
    sectionErrors,
    COMPUTATION_OF_INCOME_TABLE_LABELS,
    section.title,
    onFieldValueChange
  );

const renderITRNonIndividualSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 1.25,
        }}
      >
        {ITR_NON_INDIVIDUAL_TOP_FIELDS.map((label) => {
          const item = byLabel[label.toLowerCase()];
          const required = isFieldMandatory(item);
          const value = getFieldValue(values, section.key, item?.label ?? label, item?.value);

          return (
            <Box key={label}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: "#475467" }}>{label}</Typography>
                {required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
              </Box>
              {renderFieldValue(
                value,
                isEditable,
                (nextValue) => onFieldValueChange(section.key, item?.label ?? label, nextValue),
                required,
                sectionErrors[item?.label ?? label]
              )}
            </Box>
          );
        })}
      </Box>

      {renderMultiYearTableSection(
        section,
        values,
        isEditable,
        sectionErrors,
        ITR_NON_INDIVIDUAL_TABLE_LABELS,
        section.title,
        onFieldValueChange
      )}
    </Box>
  );
};

const renderITRIndividualSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 1.25,
        }}
      >
        {ITR_INDIVIDUAL_TOP_FIELDS.map((label) => {
          const item = byLabel[label.toLowerCase()];
          const required = isFieldMandatory(item);
          const value = getFieldValue(values, section.key, item?.label ?? label, item?.value);

          return (
            <Box key={label}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: "#475467" }}>{label}</Typography>
                {required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
              </Box>
              {renderFieldValue(
                value,
                isEditable,
                (nextValue) => onFieldValueChange(section.key, item?.label ?? label, nextValue),
                required,
                sectionErrors[item?.label ?? label]
              )}
            </Box>
          );
        })}
      </Box>

      {renderMultiYearTableSection(
        section,
        values,
        isEditable,
        sectionErrors,
        ITR_INDIVIDUAL_TABLE_LABELS,
        section.title,
        onFieldValueChange
      )}
    </Box>
  );
};

const renderProfitAndLossSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 1.25,
        }}
      >
        {PROFIT_AND_LOSS_TOP_FIELDS.map((label) => {
          const item = byLabel[label.toLowerCase()];
          const required = isFieldMandatory(item);
          const value = getFieldValue(values, section.key, item?.label ?? label, item?.value);

          return (
            <Box key={label}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: "#475467" }}>{label}</Typography>
                {required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
              </Box>
              {renderFieldValue(
                value,
                isEditable,
                (nextValue) => onFieldValueChange(section.key, item?.label ?? label, nextValue),
                required,
                sectionErrors[item?.label ?? label]
              )}
            </Box>
          );
        })}
      </Box>

      {renderMultiYearTableSection(
        section,
        values,
        isEditable,
        sectionErrors,
        PROFIT_AND_LOSS_TABLE_LABELS,
        section.title,
        onFieldValueChange
      )}
    </Box>
  );
};

const renderGstIncomeSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) =>
  renderFourYearTableSection(
    section,
    values,
    isEditable,
    sectionErrors,
    GST_INCOME_TABLE_LABELS,
    section.title,
    onFieldValueChange
  );

const renderFormJSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  const tableRows: FormJTableRow[] = FORM_J_ROW_LABELS.map((rowLabel) => {
    const rowName = rowLabel === "Is Form J in the name of LA" ? rowLabel : rowLabel;
    const receipt1FieldLabel = rowLabel === "Is Form J in the name of LA" ? rowName : `${rowLabel} Receipt1`;
    const receipt2FieldLabel = rowLabel === "Is Form J in the name of LA" ? `${rowName} Receipt2` : `${rowLabel} Receipt2`;
    const receipt3FieldLabel = rowLabel === "Is Form J in the name of LA" ? `${rowName} Receipt3` : `${rowLabel} Receipt3`;
    const receipt4FieldLabel = rowLabel === "Is Form J in the name of LA" ? `${rowName} Receipt4` : `${rowLabel} Receipt4`;
    const receipt5FieldLabel = rowLabel === "Is Form J in the name of LA" ? `${rowName} Receipt5` : `${rowLabel} Receipt5`;
    const receipt6FieldLabel = rowLabel === "Is Form J in the name of LA" ? `${rowName} Receipt6` : `${rowLabel} Receipt6`;

    const rowItem = byLabel[rowLabel.toLowerCase()] ?? byLabel[receipt1FieldLabel.toLowerCase()];

    return {
      label: rowLabel,
      receipt1: getFieldValue(values, section.key, receipt1FieldLabel, rowItem?.value),
      receipt2: getFieldValue(values, section.key, receipt2FieldLabel, " "),
      receipt3: getFieldValue(values, section.key, receipt3FieldLabel, " "),
      receipt4: getFieldValue(values, section.key, receipt4FieldLabel, " "),
      receipt5: getFieldValue(values, section.key, receipt5FieldLabel, " "),
      receipt6: getFieldValue(values, section.key, receipt6FieldLabel, " "),
      receipt1FieldLabel,
      receipt2FieldLabel,
      receipt3FieldLabel,
      receipt4FieldLabel,
      receipt5FieldLabel,
      receipt6FieldLabel,
      required: isFieldMandatory(rowItem),
    };
  });

  const tableColumns: Column<FormJTableRow>[] = [
    {
      key: "label",
      header: "",
      width: "22%",
      render: (_, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Typography sx={{ fontSize: 13, color: "#475467" }}>{row.label}</Typography>
          {row.required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
        </Box>
      ),
    },
    {
      key: "receipt1",
      header: "Receipt 1",
      width: "13%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable,
          (nextValue) => onFieldValueChange(section.key, row.receipt1FieldLabel, nextValue),
          row.required,
          sectionErrors[row.receipt1FieldLabel]
        ),
    },
    {
      key: "receipt2",
      header: "Receipt 2",
      width: "13%",
      render: (value, row) =>
        renderFieldValue(String(value ?? ""), isEditable, (nextValue) => onFieldValueChange(section.key, row.receipt2FieldLabel, nextValue)),
    },
    {
      key: "receipt3",
      header: "Receipt 3",
      width: "13%",
      render: (value, row) =>
        renderFieldValue(String(value ?? ""), isEditable, (nextValue) => onFieldValueChange(section.key, row.receipt3FieldLabel, nextValue)),
    },
    {
      key: "receipt4",
      header: "Receipt 4",
      width: "13%",
      render: (value, row) =>
        renderFieldValue(String(value ?? ""), isEditable, (nextValue) => onFieldValueChange(section.key, row.receipt4FieldLabel, nextValue)),
    },
    {
      key: "receipt5",
      header: "Receipt 5",
      width: "13%",
      render: (value, row) =>
        renderFieldValue(String(value ?? ""), isEditable, (nextValue) => onFieldValueChange(section.key, row.receipt5FieldLabel, nextValue)),
    },
    {
      key: "receipt6",
      header: "Receipt 6",
      width: "13%",
      render: (value, row) =>
        renderFieldValue(String(value ?? ""), isEditable, (nextValue) => onFieldValueChange(section.key, row.receipt6FieldLabel, nextValue)),
    },
  ];

  return <CustomTable title="FORM J" columns={tableColumns} data={tableRows} />;
};

const renderStandardSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: `repeat(${section.columns ?? 3}, minmax(0, 1fr))`,
        },
        gap: 1.25,
      }}
    >
      {section.items.map((item) => {
        const required = isFieldMandatory(item);
        const value = getFieldValue(values, section.key, item.label, item.value);
        const isFieldEditable = isEditable && !isCommissionCalculatedField(section.key, item.label);

        return (
          <Box key={`${section.key}-${item.label}`}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 0.5 }}>
              <Typography sx={{ fontSize: 12, color: "#475467" }}>{item.label}</Typography>
              {required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
            </Box>
            {renderFieldValue(
              value,
              isFieldEditable,
              (nextValue) => onFieldValueChange(section.key, item.label, nextValue),
              required,
              sectionErrors[item.label]
            )}
          </Box>
        );
      })}
    </Box>
  );
};

const ViewFinancial = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { businessType, applicationNumber } = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);

  const requestedApplicantTab =
    ((location.state as { selectedApplicantTab?: ApplicantTab } | null)?.selectedApplicantTab) ??
    getStoredApplicantTab();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<FinancialResponse | null>(null);
  const [activeApplicantTab, setActiveApplicantTab] = useState<ApplicantTab>(requestedApplicantTab);
  const [financialFieldValues, setFinancialFieldValues] = useState<Record<FinancialSectionKey, Record<string, string>>>(
    buildInitialFieldValues
  );
  const [activeSectionId, setActiveSectionId] = useState<string>(financialSections[0]?.key ?? "");
  const [isEditable, setIsEditable] = useState(false);
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<FinancialSectionKey, Record<string, string>>>>({});
  const [savedSections, setSavedSections] = useState<Partial<Record<FinancialSectionKey, boolean>>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const safeBusinessType = businessType ?? "retail";
  const safeApplicationId = applicationNumber ?? "";
  const roleType = getRoleType();
  const isFormalRole = isFormalTaskRole(roleType);
  const formalMemberProfile = useMemo(() => buildFormalMemberProfile(drsData), [drsData]);
  const displayFinancialSections = useMemo(
    () => buildFinancialSectionsFromResponse(financialData?.sections),
    [financialData?.sections]
  );

  useEffect(() => {
    const payload: DRSRequest = {
      applicationId: safeApplicationId,
      roleType,
    };

    const fetchFinancial = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dispatch(financialThunk(payload)).unwrap();
        setFinancialData(response);
        setFinancialFieldValues(buildInitialFieldValues(buildFinancialSectionsFromResponse(response.sections)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch financial details.");
      } finally {
        setLoading(false);
      }
    };

    void fetchFinancial();
  }, [dispatch, roleType, safeApplicationId]);

  const commissionMonthValueKey = useMemo(
    () => COMMISSION_MONTH_LABELS.map((label) => financialFieldValues.commissionStatement?.[label] ?? "").join("|"),
    [financialFieldValues]
  );

  useEffect(() => {
    if (!isEditable) {
      return;
    }

    const enteredMonthValues = commissionMonthValueKey.split("|");
    const months = COMMISSION_MONTH_LABELS.reduce<Record<string, string>>((accumulator, label, index) => {
      accumulator[label] = enteredMonthValues[index] ?? "";
      return accumulator;
    }, {});

    const fallbackValues = calculateCommissionStatementValues(months);
    const hasEnteredMonth = COMMISSION_MONTH_LABELS.some((label) => months[label].trim());
    const hasInvalidMonth = COMMISSION_MONTH_LABELS.some((label) => {
      const value = months[label].trim();
      return Boolean(value) && parseCommissionAmount(value) == null;
    });

    if (!hasEnteredMonth) {
      return;
    }

    if (hasInvalidMonth) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await apiRequest<CommissionStatementCalculationResponse, CommissionStatementCalculationRequest>({
          url: url("financialCommissionCalculate" as ApiKey),
          method: "POST",
          body: {
            applicationId: safeApplicationId,
            roleType,
            months,
          },
        });
        const calculatedValues = getCommissionCalculationResponseValues(response, fallbackValues);

        setFinancialFieldValues((currentValues) => ({
          ...currentValues,
          commissionStatement: {
            ...currentValues.commissionStatement,
            [COMMISSION_AVERAGE_PM_LABEL]: calculatedValues.averageCommissionPm,
            [COMMISSION_AVERAGE_ANNUAL_LABEL]: calculatedValues.averageAnnualIncome,
          },
        }));
      } catch {
        setFinancialFieldValues((currentValues) => ({
          ...currentValues,
          commissionStatement: {
            ...currentValues.commissionStatement,
            [COMMISSION_AVERAGE_PM_LABEL]: fallbackValues.averageCommissionPm,
            [COMMISSION_AVERAGE_ANNUAL_LABEL]: fallbackValues.averageAnnualIncome,
          },
        }));
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [commissionMonthValueKey, isEditable, roleType, safeApplicationId]);

  const availableMemberTypes = useMemo(
    () => financialData?.summary?.map((item) => item.memberType) ?? [],
    [financialData]
  );

  const visibleTabs = useMemo(
    () => applicantTabs.filter((tab) => availableMemberTypes.includes(tab.key)),
    [availableMemberTypes]
  );

  const currentApplicantTab = useMemo(
    () =>
      visibleTabs.some((tab) => tab.key === activeApplicantTab)
        ? activeApplicantTab
        : (visibleTabs[0]?.key ?? "proposer"),
    [activeApplicantTab, visibleTabs]
  );

  // const selectedApplicantSummary = useMemo(() => {
  //   const preferred = financialData?.summary?.find((item) => item.memberType === currentApplicantTab);
  //   if (preferred) {
  //     return preferred;
  //   }

  //   if (visibleTabs[0]) {
  //     return financialData?.summary?.find((item) => item.memberType === visibleTabs[0].key);
  //   }

  //   return financialData?.summary?.[0];
  // }, [currentApplicantTab, financialData, visibleTabs]);

  // const applicantData = isFormalRole
  //   ? getFormalHeaderData(formalMemberProfile)
  //   : getApplicantHeaderData(selectedApplicantSummary);

  // const applicantInfoItems = useMemo(
  //   () => [
  //     { label: "Occupation", value: applicantData.occupation, icon: <BriefcaseIcon width={16} height={16} /> },
  //     {
  //       label: "Annual Income",
  //       value: formatCurrencyINR(applicantData.annualIncome),
  //       icon: <WalletIcon width={16} height={16} />,
  //     },
  //     { label: "Email", value: applicantData.email, icon: <SmsIcon width={16} height={16} /> },
  //     { label: "Mobile", value: applicantData.mobile, icon: <PhoneIcon width={16} height={16} /> },
  //   ],
  //   [applicantData.annualIncome, applicantData.email, applicantData.mobile, applicantData.occupation]
  // );

  const resolvedActiveSectionId = useMemo(
    () =>
      displayFinancialSections.some((section) => section.key === activeSectionId)
        ? activeSectionId
        : (displayFinancialSections[0]?.key ?? ""),
    [activeSectionId, displayFinancialSections]
  );

  useEffect(() => {
    if (!resolvedActiveSectionId) {
      return;
    }

    const menuContainer = menuContainerRef.current;
    if (!menuContainer) {
      return;
    }

    const activeMenuItem = menuContainer.querySelector(
      `[data-financial-menu-id="${resolvedActiveSectionId}"]`
    ) as HTMLElement | null;

    if (!activeMenuItem) {
      return;
    }

    const containerRect = menuContainer.getBoundingClientRect();
    const itemRect = activeMenuItem.getBoundingClientRect();
    const padding = 8;

    if (itemRect.top < containerRect.top + padding) {
      const delta = itemRect.top - containerRect.top - padding;
      menuContainer.scrollTo({
        top: menuContainer.scrollTop + delta,
        behavior: "smooth",
      });
      return;
    }

    if (itemRect.bottom > containerRect.bottom - padding) {
      const delta = itemRect.bottom - containerRect.bottom + padding;
      menuContainer.scrollTo({
        top: menuContainer.scrollTop + delta,
        behavior: "smooth",
      });
    }
  }, [resolvedActiveSectionId]);

  useEffect(() => {
    if (loading || displayFinancialSections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length === 0) {
          return;
        }

        const nextActiveSection = visibleEntries[0].target.getAttribute("data-financial-section");
        if (nextActiveSection) {
          setActiveSectionId(nextActiveSection);
        }
      },
      {
        root: null,
        rootMargin: "-160px 0px -55% 0px",
        threshold: [0.1, 0.35, 0.6],
      }
    );

    displayFinancialSections.forEach((section) => {
      const sectionNode = sectionRefs.current[section.key];
      if (sectionNode) {
        observer.observe(sectionNode);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [loading, currentApplicantTab, displayFinancialSections]);

  const handleSectionMenuClick = (sectionId: string) => {
    setActiveSectionId(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDRSViewTabChange = (value: DRSViewTab) => {
    if (!safeApplicationId) {
      return;
    }

    if (value === "medical") {
      navigate(getMedicalPath(safeBusinessType, safeApplicationId), {
        state: { selectedApplicantTab: currentApplicantTab },
      });
      return;
    }

    navigate(getFinancialPath(safeBusinessType, safeApplicationId), {
      state: { selectedApplicantTab: currentApplicantTab },
    });
  };

  const handleFieldValueChange = (sectionKey: FinancialSectionKey, label: string, value: string) => {
    setFinancialFieldValues((currentValues) => {
      const nextSectionValues = {
        ...currentValues[sectionKey],
        [label]: value,
      };

      if (sectionKey === "commissionStatement" && COMMISSION_MONTH_LABELS.includes(label as typeof COMMISSION_MONTH_LABELS[number])) {
        const hasEnteredMonth = COMMISSION_MONTH_LABELS.some((monthLabel) => nextSectionValues[monthLabel]?.trim());

        if (!hasEnteredMonth) {
          nextSectionValues[COMMISSION_AVERAGE_PM_LABEL] = "";
          nextSectionValues[COMMISSION_AVERAGE_ANNUAL_LABEL] = "";
        }
      }

      return {
        ...currentValues,
        [sectionKey]: nextSectionValues,
      };
    });

    setSavedSections((current) => ({ ...current, [sectionKey]: false }));
    setSectionErrors((current) => {
      const currentSectionErrors = current[sectionKey];
      if (!currentSectionErrors || !currentSectionErrors[label]) {
        return current;
      }

      const nextSectionErrors = { ...currentSectionErrors };
      delete nextSectionErrors[label];

      return {
        ...current,
        [sectionKey]: nextSectionErrors,
      };
    });
  };

  const handleSectionSave = (section: FinancialSectionConfig) => {
    if (!isEditable) {
      return;
    }

    const itemErrors = section.items.reduce<Record<string, string>>((accumulator, item) => {
      const value = financialFieldValues[section.key]?.[item.label] ?? "";
      const validationError = getFinancialFieldValidationError(section.key, item, String(value));

      if (!validationError) {
        return accumulator;
      }

      accumulator[item.label] = validationError;

      return accumulator;
    }, {});

    const fieldErrors = {
      ...itemErrors,
      ...validateFinancialSectionValues(section.key, financialFieldValues[section.key] ?? {}),
    };

    setSectionErrors((current) => ({
      ...current,
      [section.key]: fieldErrors,
    }));

    if (Object.keys(fieldErrors).length > 0) {
      setSubmitMessage(null);
      setSubmitError(`Please correct highlighted fields in ${section.title}.`);
      return;
    }

    setSavedSections((current) => ({ ...current, [section.key]: true }));
    setSubmitError(null);
    setSubmitMessage(`${section.title} saved successfully.`);
  };

  const handleDisagree = () => {
    setSubmitMessage(null);
    setSubmitError(null);
    setIsEditable(true);
    setSavedSections({});
  };

  const handleAgree = async () => {
    try {
      setSubmitLoading(true);
      setSubmitMessage(null);
      setSubmitError(null);

      const response = await apiRequest<SubmitResponse, unknown>({
        url: url("financialSubmit" as ApiKey),
        method: "POST",
        body: {
          applicationId: safeApplicationId,
          roleType,
          applicantTab: currentApplicantTab,
          agreed: true,
          fields: financialFieldValues,
        },
      });

      setSubmitMessage(response.message ?? "Financial details submitted successfully.");
      setIsEditable(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit financial details.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // if (isCptPool) {
  //   return (
  //     <Container disableGutters>
  //       <BackButton label="Back to DRS" onClick={() => navigate(getDRSPath(safeApplicationId))} />
  //       <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
  //         View Financial Details is not available for CPT Pool.
  //       </Typography>
  //     </Container>
  //   );
  // }

  return (
    <Container disableGutters sx={{ pb: 4 }}>
      <BackButton label="Back to DRS" onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationId))} />

      <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
        <CustomTabs
          tabs={drsViewTabs}
          value="financial"
          onChange={(value: DRSViewTab) => handleDRSViewTabChange(value)}
        />
      </Box>

      {/*
      <BreDecision
        extraFields={financialData?.breAdditionalFields ?? []}
        breDecisionOverride={financialData?.breDecision ?? null}
      />
      */}
      <BreDecision />

      {!isFormalRole && (
        <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
          <CustomTabs
            tabs={visibleTabs}
            value={currentApplicantTab}
            onChange={(value: ApplicantTab) => {
              setActiveApplicantTab(value);
              localStorage.setItem("drsSelectedApplicantTab", value);
            }}
          />
        </Box>
      )}

      <Box sx={{ position: "sticky", top: 12, zIndex: 10, mb: 1, mt: 2 }}>
        <CustomAccordion title={isFormalRole ? "Member Profile" : "Applicant Profile"} defaultExpanded={false} detailPadding={0}>
          {isFormalRole ? (
            <Box sx={{ px: { xs: 2, md: 3 }, py: 2, backgroundColor: "#FFFFFF" }}>
              <FormalMemberProfile profile={formalMemberProfile} />
            </Box>
          ) : (
            //   <Box sx={{ px: { xs: 2, md: 3 }, py: 2.25, backgroundColor: "#EBF1F5" }}>
            //   <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            //     <Box
            //       sx={{
            //         width: 76,
            //         height: 76,
            //         borderRadius: "50%",
            //         backgroundColor: "#EBF1F5",
            //         display: "flex",
            //         alignItems: "center",
            //         justifyContent: "center",
            //         overflow: "hidden",
            //         flexShrink: 0,
            //       }}
            //     >
            //       {applicantData.profileImage && (
            //         <Box
            //           component="img"
            //           src={applicantData.profileImage}
            //           alt={`${applicantData.name}'s photo`}
            //           sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
            //         />
            //       )}
            //     </Box>

            //     <Box sx={{ flex: 1, minWidth: 0 }}>
            //       <Box
            //         sx={{
            //           display: "flex",
            //           justifyContent: "space-between",
            //           alignItems: "flex-start",
            //           gap: 2,
            //           flexWrap: "wrap",
            //         }}
            //       >
            //         <Box>
            //           <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#1E293B", lineHeight: 1.15 }}>
            //             {applicantData.name}
            //           </Typography>
            //           <Typography sx={{ fontSize: 14, color: "#4B5563", mt: 0.5 }}>DOB: {applicantData.dob}</Typography>
            //         </Box>

            //         <Badge label={`${applicantData.gender}, ${applicantData.age} Years`} variant="Neutral" size="medium" />
            //       </Box>

            //       <Divider sx={{ my: 1.25, borderColor: "#B7C1CB" }} />

            //       <Box
            //         sx={{
            //           display: "grid",
            //           gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
            //           gap: { xs: 1.25, md: 2 },
            //         }}
            //       >
            //         {applicantInfoItems.map((item) => (
            //           <Box key={item.label} sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, minWidth: 0 }}>
            //             <Box sx={{ color: "#1E5A8B", mt: 0.2, display: "inline-flex" }}>{item.icon}</Box>
            //             <Box sx={{ minWidth: 0 }}>
            //               <Typography sx={{ fontSize: 12, color: "#475569", lineHeight: 1.2 }}>{item.label}</Typography>
            //               <Typography
            //                 sx={{
            //                   fontSize: 18,
            //                   fontWeight: 600,
            //                   color: "#111827",
            //                   lineHeight: 1.3,
            //                   wordBreak: "break-word",
            //                 }}
            //               >
            //                 {item.value || "-"}
            //               </Typography>
            //             </Box>
            //           </Box>
            //         ))}
            //       </Box>
            //     </Box>
            //   </Box>
            // </Box>
            <Box sx={{ px: { xs: 2, md: 3 }, py: 2, backgroundColor: "#FFFFFF" }}>
              <ApplicantProfile selectedApplicantTab={currentApplicantTab} isApplicantDetailsExpanded />
            </Box>
          )}
        </CustomAccordion>
      </Box>

      {loading && <Typography sx={{ color: "#6B7280", mb: 2 }}>Loading financial details...</Typography>}
      {error && <Typography sx={{ color: "#DE2C3B", mb: 2 }}>{error}</Typography>}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 1.5,
          alignItems: "flex-start",
          mt: 1,
        }}
      >
        <Box
          ref={menuContainerRef}
          sx={{
            width: { xs: "100%", md: 208 },
            position: { xs: "static", md: "sticky" },
            top: { md: 124 },
            alignSelf: "flex-start",
            borderRadius: 1,
            overflow: "hidden",
            border: "1px solid #D6D8DC",
            backgroundColor: "#F8F9FB",
            maxHeight: { md: "calc(100vh - 180px)" },
            overflowY: { md: "auto" },
          }}
        >
          {displayFinancialSections.map((section) => {
            const isActive = section.key === resolvedActiveSectionId;

            return (
              <Box
                key={section.key}
                data-financial-menu-id={section.key}
                role="button"
                tabIndex={0}
                onClick={() => handleSectionMenuClick(section.key)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSectionMenuClick(section.key);
                  }
                }}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  borderLeft: isActive ? "3px solid #DE2C3B" : "3px solid transparent",
                  borderBottom: "1px solid #EAECEF",
                  backgroundColor: isActive ? "#FFFFFF" : "transparent",
                  color: isActive ? "#B42318" : "#667085",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  lineHeight: 1.3,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: "inherit", fontWeight: "inherit", color: "inherit" }}>
                  {section.title}
                </Typography>
                <Typography sx={{ fontSize: 14, color: "inherit", lineHeight: 1 }}>
                  {"\u203A"}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          {displayFinancialSections.map((section) => (
            <Box
              key={section.key}
              data-financial-section={section.key}
              ref={(node) => {
                sectionRefs.current[section.key] = node as HTMLDivElement | null;
              }}
              sx={{
                scrollMarginTop: "160px",
                border: "1px solid #E4E7EC",
                borderRadius: 1.5,
                backgroundColor: "#FFFFFF",
                boxShadow: "0 1px 2px rgba(16,24,40,0.08)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: { xs: 1.5, md: 2 },
                  py: 1.25,
                  borderBottom: "1px solid #E4E7EC",
                  backgroundColor: "#F8FAFC",
                }}
              >
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1F2937" }}>{section.title}</Typography>
              </Box>

              <Box sx={{ p: { xs: 1.25, md: 1.5 } }}>
                {section.key === "form16"
                  ? renderForm16Section(
                      section,
                      financialFieldValues,
                      isEditable,
                      sectionErrors[section.key] ?? {},
                      handleFieldValueChange
                    )
                  : section.key === "form16a"
                    ? renderForm16ASection(
                        section,
                        financialFieldValues,
                        isEditable,
                        sectionErrors[section.key] ?? {},
                        handleFieldValueChange
                      )
                    : section.key === "computationOfIncome"
                      ? renderComputationOfIncomeSection(
                          section,
                          financialFieldValues,
                          isEditable,
                          sectionErrors[section.key] ?? {},
                          handleFieldValueChange
                        )
                    : section.key === "incomeTaxReturnNonIndividual"
                      ? renderITRNonIndividualSection(
                          section,
                          financialFieldValues,
                          isEditable,
                          sectionErrors[section.key] ?? {},
                          handleFieldValueChange
                        )
                    : section.key === "incomeTaxReturnIndividual"
                      ? renderITRIndividualSection(
                          section,
                          financialFieldValues,
                          isEditable,
                          sectionErrors[section.key] ?? {},
                          handleFieldValueChange
                        )
                    : section.key === "profitAndLossAccount"
                      ? renderProfitAndLossSection(
                          section,
                          financialFieldValues,
                          isEditable,
                          sectionErrors[section.key] ?? {},
                          handleFieldValueChange
                        )
                    : section.key === "gstIncome"
                      ? renderGstIncomeSection(
                          section,
                          financialFieldValues,
                          isEditable,
                          sectionErrors[section.key] ?? {},
                          handleFieldValueChange
                        )
                    : section.key === "formJ"
                      ? renderFormJSection(
                          section,
                          financialFieldValues,
                          isEditable,
                          sectionErrors[section.key] ?? {},
                          handleFieldValueChange
                        )
                  : renderStandardSection(
                      section,
                      financialFieldValues,
                      isEditable,
                      sectionErrors[section.key] ?? {},
                      handleFieldValueChange
                    )}

                {isEditable && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                    <CustomButton
                      variant="outlined"
                      sx={{ minWidth: 110 }}
                      onClick={() => handleSectionSave(section)}
                    >
                      {savedSections[section.key] ? "Saved" : "Save"}
                    </CustomButton>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 2, p: 2, border: "1px solid #E4E7EC", borderRadius: 1.5, backgroundColor: "#FFFFFF" }}>
        {(submitMessage || submitError) && (
          <Typography sx={{ mb: 1.5, color: submitError ? "#DE2C3B" : "#067647", fontSize: 13 }}>
            {submitError ?? submitMessage}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
          <CustomButton variant="outlined" onClick={handleDisagree} disabled={submitLoading} sx={{ minWidth: 120 }}>
            Disagree
          </CustomButton>
          <CustomButton onClick={handleAgree} disabled={submitLoading || !safeApplicationId} sx={{ minWidth: 120 }}>
            Agree
          </CustomButton>
        </Box>
      </Box>
    </Container>
  );
};

export default ViewFinancial;
