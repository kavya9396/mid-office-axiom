import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTextField from "../../../components/ui/TextField/TextField";
import type { MedicalFieldConfig } from "./medicalFieldConfig";

type FormValues = Record<string, string>;
type FormErrors = Record<string, string>;

type SubmitFieldValue = {
  id: string;
  section: string;
  type: string;
  field: string;
  value: string;
};

type MedicalSheetFormProps = {
  config: MedicalFieldConfig[];
  submitLabel: string;
  emptyMessage?: string;
  defaultExpandedSection?: string;
  showTestSelector?: boolean;
  isEditable?: boolean;
  onSubmit: (payload: { testCode: string; fields: SubmitFieldValue[] }) => Promise<string>;
};

type FieldRendererProps = {
  field: MedicalFieldConfig;
  value: string;
  error?: string;
  required: boolean;
  disabled: boolean;
  onChange: (fieldId: string, value: string) => void;
};

const yesNoOptions = [
  { label: "Yes", value: "YES" },
  { label: "No", value: "NO" },
];

const normalizeString = (value?: string) => (value ?? "").trim();
const getGroupKey = (field: MedicalFieldConfig) => `${field.section}__${field.type}`;

const isDateField = (field: MedicalFieldConfig) => {
  const value = normalizeString(field.dataType).toUpperCase();
  return value === "YYYY-MM-DD" || value === "DD/MM/YYYY";
};

const isNumericField = (field: MedicalFieldConfig) => normalizeString(field.dataType).toLowerCase() === "numeric";
const isAutoDerived = (field: MedicalFieldConfig) => {
  const dataType = normalizeString(field.dataType).toLowerCase();
  const options = normalizeString(field.options).toLowerCase();
  return dataType.includes("auto fill") || options.includes("auto derived") || options.includes("normal / abnormal");
};
const isRequiredField = (field: MedicalFieldConfig) => {
  const requiredValue = normalizeString(field.mandatory).toLowerCase();
  return requiredValue === "yes" || requiredValue.startsWith("yes (") || requiredValue.startsWith("mandatory");
};
const isConditionalYes = (field: MedicalFieldConfig) => {
  const mandatoryValue = normalizeString(field.mandatory).toLowerCase();
  return mandatoryValue.includes("if \"yes\"") || mandatoryValue.includes("if the answer is marked as yes");
};
const isButtonField = (field: MedicalFieldConfig) => normalizeString(field.field).toLowerCase().includes("button");

const isYesNoField = (field: MedicalFieldConfig) => {
  const dataType = normalizeString(field.dataType).toLowerCase();
  const options = normalizeString(field.options).toLowerCase();
  return dataType === "yes/no" || (options.includes("yes") && options.includes("no"));
};

const parseDropdownOptions = (field: MedicalFieldConfig) => {
  if (isYesNoField(field)) {
    return yesNoOptions;
  }

  const raw = normalizeString(field.options);
  if (!raw) {
    return [];
  }

  const cleaned = raw.replace(/^,+/, "").replace(/[()]/g, "").trim();
  let parts: string[] = [];

  if (cleaned.includes(",")) {
    parts = cleaned.split(",");
  } else if (/\s+or\s+/i.test(cleaned)) {
    parts = cleaned.split(/\s+or\s+/i);
  } else if (cleaned && !cleaned.toLowerCase().includes("system.xml")) {
    parts = [cleaned];
  }

  return parts
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !item.toLowerCase().includes("mandatory"))
    .filter((item) => !item.toLowerCase().includes("auto derived"))
    .map((option) => ({ label: option, value: option }));
};

const isDropdownField = (field: MedicalFieldConfig) => {
  const dataType = normalizeString(field.dataType).toLowerCase();
  return dataType === "dropdown"
    || dataType === "drop down"
    || dataType === "yes/no"
    || parseDropdownOptions(field).length > 0;
};

const getDateError = (field: MedicalFieldConfig, value: string) => {
  const normalizedType = normalizeString(field.dataType).toUpperCase();
  if (normalizedType === "YYYY-MM-DD") {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? "" : "Use YYYY-MM-DD format.";
  }

  if (normalizedType === "DD/MM/YYYY") {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(value) ? "" : "Use DD/MM/YYYY format.";
  }

  return "";
};

const MedicalField = ({ field, value, error, required, disabled, onChange }: FieldRendererProps) => {
  const label = `${field.field}${required ? " *" : ""}`;

  if (isButtonField(field)) {
    return (
      <Box>
        <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#444", mb: 1 }}>{field.field}</Typography>
        <CustomButton variant="outlined" disabled sx={{ minWidth: 120, borderRadius: "999px" }}>Add</CustomButton>
      </Box>
    );
  }

  if (isDropdownField(field)) {
    return (
      <Box>
        <CustomSelect
          label={label}
          value={value}
          onChange={(next) => onChange(field.id, next)}
          options={parseDropdownOptions(field)}
          placeholder="Select"
          disabled={disabled}
        />
        {error && <Typography sx={{ fontSize: 12, color: "#D32F2F", mt: 0.5 }}>{error}</Typography>}
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#444", mb: 1 }}>{label}</Typography>
      <CustomTextField
        fullWidth
        size="small"
        type={isDateField(field) || !isNumericField(field) ? "text" : "number"}
        value={value}
        disabled={disabled}
        error={Boolean(error)}
        helperText={error || " "}
        placeholder={isAutoDerived(field) ? "Auto derived" : ""}
        onChange={(event) => onChange(field.id, event.target.value)}
      />
    </Box>
  );
};

const MedicalSheetForm = ({
  config,
  submitLabel,
  emptyMessage = "No fields configured.",
  defaultExpandedSection,
  showTestSelector = false,
  isEditable = true,
  onSubmit,
}: MedicalSheetFormProps) => {
  const [formValues, setFormValues] = useState<FormValues>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const testOptions = useMemo(() => {
    const seen = new Map<string, { label: string; value: string }>();
    for (const field of config) {
      const sectionName = normalizeString(field.section);
      if (!sectionName || !seen.has(sectionName)) {
        if (!sectionName) {
          continue;
        }
        seen.set(sectionName, { label: sectionName, value: sectionName });
      }
    }
    return Array.from(seen.values());
  }, [config]);

  const [selectedTest, setSelectedTest] = useState<string>(testOptions[0]?.value ?? "");

  const activeConfig = useMemo(() => {
    if (!showTestSelector || !selectedTest) {
      return config.filter((field) => Boolean(normalizeString(field.section)));
    }
    return config.filter((field) => normalizeString(field.section) === selectedTest);
  }, [config, selectedTest, showTestSelector]);

  const sectionGroups = useMemo(() => {
    const bySection = new Map<string, Map<string, MedicalFieldConfig[]>>();

    for (const field of activeConfig) {
      const sectionName = normalizeString(field.section) || "General";
      const typeName = normalizeString(field.type) || "General";
      if (!bySection.has(sectionName)) {
        bySection.set(sectionName, new Map<string, MedicalFieldConfig[]>());
      }
      const sectionMap = bySection.get(sectionName);
      if (!sectionMap) {
        continue;
      }
      if (!sectionMap.has(typeName)) {
        sectionMap.set(typeName, []);
      }
      sectionMap.get(typeName)?.push(field);
    }

    return Array.from(bySection.entries()).map(([section, typeMap]) => ({
      section,
      typeGroups: Array.from(typeMap.entries()).map(([type, fields]) => ({
        type,
        fields: [...fields].sort((a, b) => a.row - b.row),
      })),
    }));
  }, [activeConfig]);

  const indicatorByGroup = useMemo(() => {
    const mapping = new Map<string, string>();
    for (const field of activeConfig) {
      if (normalizeString(field.field).toLowerCase() === "ind") {
        mapping.set(getGroupKey(field), field.id);
      }
    }
    return mapping;
  }, [activeConfig]);

  const questionAnswerByType = useMemo(() => {
    const mapping = new Map<string, string>();
    for (const field of activeConfig) {
      const lowerFieldName = normalizeString(field.field).toLowerCase();
      if (lowerFieldName === "remarks" || !isYesNoField(field)) {
        continue;
      }
      const key = getGroupKey(field);
      if (!mapping.has(key)) {
        mapping.set(key, field.id);
      }
    }
    return mapping;
  }, [activeConfig]);

  const getFieldVisibility = (field: MedicalFieldConfig) => {
    if (!isConditionalYes(field)) {
      return true;
    }

    const groupKey = getGroupKey(field);
    const lowerFieldName = normalizeString(field.field).toLowerCase();
    const indicatorId = indicatorByGroup.get(groupKey);
    const indicatorValue = indicatorId ? normalizeString(formValues[indicatorId]).toUpperCase() : "";
    const questionId = questionAnswerByType.get(groupKey);
    const questionValue = questionId ? normalizeString(formValues[questionId]).toUpperCase() : "";

    if (lowerFieldName === "remarks") {
      return questionValue === "YES";
    }

    if (indicatorId) {
      return indicatorValue === "YES";
    }

    return questionValue === "YES";
  };

  const derivedValues = useMemo(() => {
    const next: Record<string, string> = {};
    const groups = new Map<string, MedicalFieldConfig[]>();

    for (const field of activeConfig) {
      const key = `${field.section}__${field.type}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(field);
    }

    for (const fields of groups.values()) {
      const valueField = fields.find((field) => normalizeString(field.field).toLowerCase() === "value");
      const fromField = fields.find((field) => normalizeString(field.field).toLowerCase() === "from");
      const toField = fields.find((field) => normalizeString(field.field).toLowerCase() === "to");
      const findingsField = fields.find((field) => normalizeString(field.field).toLowerCase() === "findings");

      if (valueField && fromField && toField && findingsField) {
        const value = Number(formValues[valueField.id]);
        const from = Number(formValues[fromField.id]);
        const to = Number(formValues[toField.id]);
        if (!Number.isNaN(value) && !Number.isNaN(from) && !Number.isNaN(to)) {
          next[findingsField.id] = value >= from && value <= to ? "normal" : "abnormal";
        }
      }
    }

    return next;
  }, [activeConfig, formValues]);

  const displayedValue = (field: MedicalFieldConfig) => derivedValues[field.id] ?? formValues[field.id] ?? "";

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

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    for (const field of activeConfig) {
      if (!getFieldVisibility(field) || isAutoDerived(field) || isButtonField(field)) {
        continue;
      }

      const value = displayedValue(field);
      if (isRequiredField(field) && !normalizeString(value)) {
        nextErrors[field.id] = "This field is required.";
        continue;
      }
      if (normalizeString(value) && isNumericField(field) && Number.isNaN(Number(value))) {
        nextErrors[field.id] = "Enter a valid number.";
        continue;
      }
      if (normalizeString(value) && isDateField(field)) {
        const dateError = getDateError(field, value);
        if (dateError) {
          nextErrors[field.id] = dateError;
        }
      }
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitMessage("Please resolve the highlighted fields.");
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitMessage(null);
      const visibleFields = activeConfig
        .filter((field) => getFieldVisibility(field) && !isButtonField(field))
        .map((field) => ({
          id: field.id,
          section: field.section,
          type: field.type,
          field: field.field,
          value: displayedValue(field),
        }));
      const message = await onSubmit({ testCode: activeConfig[0]?.testCode ?? "", fields: visibleFields });
      setSubmitMessage(message);
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Failed to submit details.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (activeConfig.length === 0) {
    return <Typography sx={{ color: "#6B7280", mt: 1 }}>{emptyMessage}</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
      {showTestSelector && testOptions.length > 1 && (
        <Box sx={{ maxWidth: 320 }}>
          <CustomSelect
            label="Select Test"
            value={selectedTest}
            onChange={setSelectedTest}
            options={testOptions}
            placeholder="Choose test"
          />
        </Box>
      )}

      {sectionGroups.map((section) => (
        <CustomAccordion
          key={section.section}
          title={section.section}
          defaultExpanded={defaultExpandedSection ? section.section === defaultExpandedSection : true}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {section.typeGroups.map((group) => (
              <Box
                key={`${section.section}__${group.type}`}
                sx={{ p: 1.5, borderRadius: "8px", border: "1px solid #E6E6E6", backgroundColor: "#FAFAFA" }}
              >
                {group.type !== section.section && (
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1E1E1E", mb: 1.25 }}>
                    {group.type}
                  </Typography>
                )}

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
                  {group.fields.map((field) => {
                    if (!getFieldVisibility(field)) {
                      return null;
                    }
                    return (
                      <MedicalField
                        key={field.id}
                        field={field}
                        value={displayedValue(field)}
                        error={formErrors[field.id]}
                        required={isRequiredField(field)}
                        disabled={isAutoDerived(field) || !isEditable}
                        onChange={handleValueChange}
                      />
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </CustomAccordion>
      ))}

      {submitMessage && (
        <Typography sx={{ color: submitMessage.toLowerCase().includes("failed") || submitMessage.toLowerCase().includes("highlighted") ? "#DE2C3B" : "#0F8A3D" }}>
          {submitMessage}
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
        <CustomButton onClick={handleSubmit} disabled={submitLoading} sx={{ minWidth: 140, borderRadius: "999px" }}>
          {submitLoading ? "Submitting..." : submitLabel}
        </CustomButton>
      </Box>
    </Box>
  );
};

export default MedicalSheetForm;
