import { Box, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTable, { type Column } from "../../../components/ui/Table/Table";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { DangerIcon } from "../../../icons/Icons";
import { useAppDispatch } from "../../../store/hooks";
import { specialMedicalSubmitThunk } from "../../../store/thunks/specialMedicalSubmitThunk";
import type { ApplicantTab, MedicalSection } from "../../../types/drs.types";
import type { MedicalFieldConfig } from "./medicalFieldConfig";
import { specialMedicalFieldConfig } from "./specialMedicalFieldConfig";

type SpecialMedicalFormProps = {
  applicationId: string;
  roleType: string;
  memberType: ApplicantTab;
  isEditable?: boolean;
  medicalSections?: MedicalSection[];
};

type FormValues = Record<string, string>;
type FormErrors = Record<string, string>;

type TableRow = {
  type: string;
  valueField?: MedicalFieldConfig;
  unitField?: MedicalFieldConfig;
  fromField?: MedicalFieldConfig;
  toField?: MedicalFieldConfig;
  findingsField?: MedicalFieldConfig;
};

const normalizeString = (value?: string) => (value ?? "").trim();

const sectionTitleMap: Record<string, string> = {
  "CBC Group": "Complete Blood Count (CBC)",
  LIPIDS: "Lipid Profile",
  "Blood Sugar Random": "Blood Sugar Random",
  FBS: "Fasting Blood Sugar (FBS)",
  PPBS: "Post Prandial Blood Sugar (PPBS)",
  HBA1C: "HbA1c",
  HBSAG: "HBsAg",
  "ANTI-HCV ANTIBODY": "Anti-HCV Antibody",
  "HIV Elisa": "HIV Elisa",
  "HIV Western Blot": "HIV Western Blot",
  "ERYTHROCYTE SEDIMENTATION RATE": "Erythrocyte Sedimentation Rate",
};

const getDisplaySectionTitle = (section: string) => sectionTitleMap[section] ?? section;
const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const rowTypeAliases: Record<string, string> = {
  haemoglobin: "haemoglobinhb",
  rbccount: "rbc",
  wbccount: "wbc",
  plateletcount: "platelets",
  hematocrit: "pcv",
  neutrophils: "differentialneutrophils",
  lymphocytes: "differentiallymphocytes",
  monocytes: "differentialmonocytes",
  eosinophils: "differentialesinophils",
};

const getSpecialSectionMockTitle = (section: string) => {
  const sectionKey = normalizeKey(section);

  if (sectionKey === "cbcgroup") {
    return "Complete Blood Count (CBC)";
  }

  return getDisplaySectionTitle(section);
};

const isDateField = (field: MedicalFieldConfig) => normalizeString(field.dataType).toUpperCase() === "DD/MM/YYYY";
const isNumericField = (field?: MedicalFieldConfig) => normalizeString(field?.dataType).toLowerCase() === "numeric";
const isRequiredField = (field?: MedicalFieldConfig) => {
  const requiredValue = normalizeString(field?.mandatory).toLowerCase();
  return requiredValue === "yes" || requiredValue.startsWith("yes (") || requiredValue.startsWith("mandatory");
};
const isAutoDerived = (field?: MedicalFieldConfig) => {
  const dataType = normalizeString(field?.dataType).toLowerCase();
  const options = normalizeString(field?.options).toLowerCase();
  return dataType.includes("auto fill") || options.includes("normal / abnormal");
};

const parseDropdownOptions = (field: MedicalFieldConfig) => {
  const raw = normalizeString(field.options).replace(/[()]/g, "");
  if (!raw || raw.toLowerCase().includes("system.xml")) {
    return [];
  }

  const parts = raw.includes(",")
    ? raw.split(",")
    : /\s+or\s+/i.test(raw)
      ? raw.split(/\s+or\s+/i)
      : [raw];

  return parts
    .map((item) => item.trim())
    .filter(Boolean)
    .map((option) => ({ label: option, value: option }));
};

const getFindingsValue = (row: TableRow, formValues: FormValues) => {
  const explicitFindings = row.findingsField ? normalizeString(formValues[row.findingsField.id]) : "";
  if (explicitFindings) {
    return explicitFindings;
  }

  if (!row.valueField || !row.fromField || !row.toField) {
    return "";
  }

  const value = Number(formValues[row.valueField.id]);
  const from = Number(formValues[row.fromField.id]);
  const to = Number(formValues[row.toField.id]);

  if (Number.isNaN(value) || Number.isNaN(from) || Number.isNaN(to)) {
    return "";
  }

  return value >= from && value <= to ? "normal" : "abnormal";
};

const getStatusColor = (findings: string) => {
  const normalized = findings.toLowerCase();
  if (normalized === "abnormal" || normalized === "positive/reactive" || normalized === "positive") {
    return "#DE2C3B";
  }

  if (normalized === "normal" || normalized === "negative/non reactive" || normalized === "negative" || normalized === "non reactive") {
    return "#2FA641";
  }

  return "#C7CDD4";
};

const renderCellField = (
  field: MedicalFieldConfig | undefined,
  formValues: FormValues,
  formErrors: FormErrors,
  onChange: (fieldId: string, value: string) => void,
  isEditable: boolean,
  placeholder?: string,
  width?: number
) => {
  if (!field) {
    return <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>-</Typography>;
  }

  const value = formValues[field.id] ?? "";

  return (
    <CustomTextField
      value={value}
      onChange={(event) => onChange(field.id, event.target.value)}
      disabled={!isEditable}
      size="small"
      type={isNumericField(field) ? "number" : "text"}
      placeholder={placeholder}
      error={Boolean(formErrors[field.id])}
      sx={{
        minWidth: width ?? 86,
        "& .MuiInputBase-root": {
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          fontSize: 12,
        },
        "& .MuiInputBase-input": {
          px: 1,
          py: 0.75,
          fontSize: 12,
        },
      }}
    />
  );
};

const SpecialMedicalForm = ({ applicationId, roleType, memberType, isEditable = true, medicalSections = [] }: SpecialMedicalFormProps) => {
  const dispatch = useAppDispatch();
  const [formValues, setFormValues] = useState<FormValues>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");

  const validConfig = useMemo(
    () => specialMedicalFieldConfig.filter((field) => Boolean(normalizeString(field.section))),
    []
  );

  const sectionOptions = useMemo(() => {
    const seen = new Map<string, { label: string; value: string }>();
    for (const field of validConfig) {
      if (!seen.has(field.section)) {
        seen.set(field.section, { label: getDisplaySectionTitle(field.section), value: field.section });
      }
    }
    return Array.from(seen.values());
  }, [validConfig]);

  const activeSection = selectedSection || sectionOptions[0]?.value || "";

  const activeMockRows = useMemo(() => {
    const expectedTitle = getSpecialSectionMockTitle(activeSection);
    const expectedKey = normalizeKey(expectedTitle);

    const match = medicalSections.find((section) => {
      const titleKey = normalizeKey(section.title);
      return titleKey === expectedKey || titleKey.includes(expectedKey) || expectedKey.includes(titleKey);
    });

    return match?.rows ?? [];
  }, [activeSection, medicalSections]);

  const activeSectionConfig = useMemo(
    () => validConfig.filter((field) => field.section === activeSection),
    [activeSection, validConfig]
  );

  const mainFields = useMemo(
    () => activeSectionConfig.filter((field) => field.type === "Main" && field.field !== "System.Xml.XmlElement"),
    [activeSectionConfig]
  );

  const tableRows = useMemo<TableRow[]>(() => {
    const grouped = new Map<string, TableRow>();

    for (const field of activeSectionConfig) {
      if (field.type === "Main") {
        continue;
      }

      const key = field.type;
      if (!grouped.has(key)) {
        grouped.set(key, { type: key });
      }

      const row = grouped.get(key);
      if (!row) {
        continue;
      }

      const fieldName = normalizeString(field.field).toLowerCase();
      if (fieldName === "value") row.valueField = field;
      if (fieldName === "units") row.unitField = field;
      if (fieldName === "from") row.fromField = field;
      if (fieldName === "to") row.toField = field;
      if (fieldName === "findings") row.findingsField = field;
    }

    return Array.from(grouped.values());
  }, [activeSectionConfig]);

  useEffect(() => {
    if (!activeMockRows.length || !tableRows.length) {
      return;
    }

    setFormValues((previous) => {
      const next = { ...previous };

      for (const row of tableRows) {
        if (!row.valueField) {
          continue;
        }

        const typeKey = normalizeKey(row.type);
        const matchedMockRow = activeMockRows.find((mockRow) => {
          const parameterKey = normalizeKey(mockRow.parameter);
          const alias = rowTypeAliases[parameterKey] ?? parameterKey;
          return alias === typeKey;
        });

        if (!matchedMockRow) {
          continue;
        }

        next[row.valueField.id] = matchedMockRow.value ?? "";
        if (row.unitField) {
          next[row.unitField.id] = matchedMockRow.unit ?? "";
        }

        const [from = "", to = ""] = (matchedMockRow.normalRange ?? "").split("-").map((item) => item.trim());
        if (row.fromField) {
          next[row.fromField.id] = from;
        }
        if (row.toField) {
          next[row.toField.id] = to;
        }

        if (row.findingsField) {
          next[row.findingsField.id] = matchedMockRow.status ?? "";
        }
      }

      return next;
    });
  }, [activeMockRows, tableRows]);

  const abnormalCount = useMemo(
    () => tableRows.filter((row) => getFindingsValue(row, formValues).toLowerCase() === "abnormal").length,
    [formValues, tableRows]
  );

  const handleValueChange = (fieldId: string, value: string) => {
    if (!isEditable) {
      return;
    }

    setSubmitMessage(null);
    setFormValues((previous) => ({ ...previous, [fieldId]: value }));
    setFormErrors((previous) => {
      if (!previous[fieldId]) {
        return previous;
      }
      const next = { ...previous };
      delete next[fieldId];
      return next;
    });
  };

  const validateSection = () => {
    const nextErrors: FormErrors = {};

    for (const field of activeSectionConfig) {
      if (isAutoDerived(field)) {
        continue;
      }

      const value = normalizeString(formValues[field.id]);
      if (isRequiredField(field) && !value) {
        nextErrors[field.id] = "This field is required.";
        continue;
      }

      if (value && isNumericField(field) && Number.isNaN(Number(value))) {
        nextErrors[field.id] = "Enter a valid number.";
        continue;
      }

      if (value && isDateField(field) && !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        nextErrors[field.id] = "Use DD/MM/YYYY format.";
      }
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!applicationId) {
      setSubmitMessage("Application ID is missing.");
      return;
    }

    if (!validateSection()) {
      setSubmitMessage("Please resolve the highlighted special medical fields.");
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitMessage(null);

      const response = await dispatch(specialMedicalSubmitThunk({
        applicationId,
        roleType,
        memberType,
        testCode: activeSectionConfig[0]?.testCode ?? "",
        fields: activeSectionConfig.map((field) => ({
          id: field.id,
          section: field.section,
          type: field.type,
          field: field.field,
          value: isAutoDerived(field)
            ? (tableRows.find((row) => row.findingsField?.id === field.id)
                ? getFindingsValue(tableRows.find((row) => row.findingsField?.id === field.id)!, formValues)
                : "")
            : (formValues[field.id] ?? ""),
        })),
      })).unwrap();

      setSubmitMessage(response.message || "Special medical details submitted successfully.");
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Failed to submit special medical details.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: Column<TableRow>[] = [
    {
      key: "type",
      header: "Parameter",
      width: "28%",
      render: (_, row) => row.type,
    },
    {
      key: "valueField",
      header: "Value",
      width: "16%",
      render: (_, row) => renderCellField(row.valueField, formValues, formErrors, handleValueChange, isEditable, "Value", 88),
    },
    {
      key: "unitField",
      header: "Unit",
      width: "16%",
      render: (_, row) => renderCellField(row.unitField, formValues, formErrors, handleValueChange, isEditable, "Unit", 88),
    },
    {
      key: "fromField",
      header: "Normal Range",
      width: "24%",
      render: (_, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {renderCellField(row.fromField, formValues, formErrors, handleValueChange, isEditable, "From", 72)}
          <Typography sx={{ fontSize: 12, color: "#6B7280" }}>-</Typography>
          {renderCellField(row.toField, formValues, formErrors, handleValueChange, isEditable, "To", 72)}
        </Box>
      ),
    },
    {
      key: "findingsField",
      header: "Status",
      width: "12%",
      render: (_, row) => {
        const findings = getFindingsValue(row, formValues);
        return (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box
              component="span"
              sx={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: getStatusColor(findings),
              }}
            />
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
      <Box sx={{ maxWidth: 320 }}>
        <CustomSelect
          label="Select Test"
          value={activeSection}
          onChange={setSelectedSection}
          options={sectionOptions}
          placeholder="Choose test"
        />
      </Box>

      <CustomAccordion
        title={getDisplaySectionTitle(activeSection)}
        defaultExpanded
        chip={
          abnormalCount > 0 ? (
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                py: 0.2,
                ml: 1,
                borderRadius: "999px",
                bgcolor: "#FFF6ED",
                color: "#C2410C",
                fontSize: 12,
              }}
            >
              <DangerIcon width={14} height={14} />
              {abnormalCount}
            </Box>
          ) : null
        }
        detailPadding={0}
      >
        <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {mainFields.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" },
                gap: 1.25,
              }}
            >
              {mainFields.map((field) => {
                const options = parseDropdownOptions(field);
                const hasOptions = options.length > 0;
                const label = `${field.field}${isRequiredField(field) ? " *" : ""}`;

                return hasOptions ? (
                  <Box key={field.id}>
                    <CustomSelect
                      label={label}
                      value={formValues[field.id] ?? ""}
                      onChange={(value) => handleValueChange(field.id, value)}
                      options={options}
                      placeholder="Select"
                      disabled={!isEditable}
                    />
                    {formErrors[field.id] && (
                      <Typography sx={{ fontSize: 12, color: "#D32F2F", mt: 0.5 }}>{formErrors[field.id]}</Typography>
                    )}
                  </Box>
                ) : (
                  <Box key={field.id}>
                    <Typography sx={{ fontSize: 12, color: "#444", mb: 0.75 }}>{label}</Typography>
                    <CustomTextField
                      value={formValues[field.id] ?? ""}
                      onChange={(event) => handleValueChange(field.id, event.target.value)}
                      disabled={!isEditable}
                      size="small"
                      placeholder={isDateField(field) ? "DD/MM/YYYY" : ""}
                      error={Boolean(formErrors[field.id])}
                      helperText={formErrors[field.id] || " "}
                      sx={{
                        width: "100%",
                        "& .MuiInputBase-root": { backgroundColor: "#FFFFFF", borderRadius: "8px" },
                        "& .MuiInputBase-input": { fontSize: 12, py: 0.85 },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}

          {tableRows.length > 0 && (
            <CustomTable<TableRow> columns={columns} data={tableRows} />
          )}
        </Box>
      </CustomAccordion>

      {submitMessage && (
        <Typography sx={{ color: submitMessage.toLowerCase().includes("failed") || submitMessage.toLowerCase().includes("highlighted") ? "#DE2C3B" : "#0F8A3D" }}>
          {submitMessage}
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <CustomButton onClick={handleSubmit} disabled={submitLoading} sx={{ minWidth: 180, borderRadius: "999px" }}>
          {submitLoading ? "Submitting..." : "Submit Special Medical"}
        </CustomButton>
      </Box>
    </Box>
  );
};

export default SpecialMedicalForm;
