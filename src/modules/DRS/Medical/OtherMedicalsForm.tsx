import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTable, { type Column } from "../../../components/ui/Table/Table";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useAppDispatch } from "../../../store/hooks";
import { otherMedicalSubmitThunk } from "../../../store/thunks/otherMedicalSubmitThunk";
import type { ApplicantTab, MedicalSection, MedicalTestRow } from "../../../types/drs.types";
import type { MedicalFieldConfig } from "./medicalFieldConfig";
import { otherMedicalFieldConfig } from "./otherMedicalFieldConfig";

type OtherMedicalsFormProps = {
  applicationId: string;
  roleType: string;
  memberType: ApplicantTab;
  medicalSections?: MedicalSection[];
};

type FieldKind = "text" | "date" | "number" | "select";

type FormValues = Record<string, string>;
type FormErrors = Record<string, string>;

type ParsedField = {
  id: string;
  row: number;
  testCode: string;
  section: string;
  label: string;
  kind: FieldKind;
  required: boolean;
  options: string[];
};

type ParsedSection = {
  key: string;
  label: string;
  testCode: string;
  fields: ParsedField[];
};

const normalizeString = (value?: string) => (value ?? "").trim();
const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const getDisplaySectionTitle = (value: string) => {
  const upper = value.toUpperCase();
  const titleMap: Record<string, string> = {
    "2D ECHO": "2D Echo",
    "DOBUTAMINE STRESS ECHOCARDIOGRAM": "Dobutamine Stress Echocardiogram",
    "EXERCISE STRESS ECHOCARDIOGRAM": "Exercise Stress Echocardiogram",
    "BLOOD UREA AND NITRO": "Blood Urea and Nitro",
    "MICROALBUMINURIA": "Microalbuminuria",
    "PAP SMEAR": "PAP Smear",
    "STOOL TEST": "Stool Test",
  };

  return titleMap[upper] ?? value;
};

const cleanOptionLabel = (value: string) => {
  const stripped = normalizeString(value).replace(/^\d+\.?\s*/, "");
  const normalized = stripped.replace(/\s+/g, " ").trim();
  if (!normalized || normalized.toLowerCase().includes("system.xml")) {
    return "";
  }

  if (normalized.toLowerCase() === "abnoramal") {
    return "Abnormal";
  }

  return normalized;
};

const parseContinuationOptions = (value: string) => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return [] as string[];
  }

  if (/^1\s*to\s*18\s*selectable\s*values$/i.test(normalized)) {
    return Array.from({ length: 18 }, (_, index) => String(index + 1));
  }

  const cleaned = cleanOptionLabel(normalized);
  return cleaned ? [cleaned] : [];
};

const getFieldKind = (row: MedicalFieldConfig, options: string[]): FieldKind => {
  const type = normalizeString(row.type).toLowerCase();
  const fieldHint = normalizeString(row.field).toLowerCase();

  if (options.length > 0 || fieldHint.includes("select")) {
    return "select";
  }

  if (type.includes("date") || fieldHint.includes("date")) {
    return "date";
  }

  if (fieldHint.includes("enter values") || type.includes("fraction") || type.includes("rate") || type.includes("mets")) {
    return "number";
  }

  return "text";
};

const isRequiredField = (row: MedicalFieldConfig) => normalizeString(row.mandatory).toLowerCase() === "yes";

const buildSections = (rows: MedicalFieldConfig[]): ParsedSection[] => {
  const sortedRows = [...rows].sort((a, b) => a.row - b.row);
  const sections = new Map<string, ParsedSection>();
  let lastField: ParsedField | null = null;

  for (const row of sortedRows) {
    const section = normalizeString(row.section);
    const type = normalizeString(row.type);

    if (section && type) {
      const sectionKey = section;
      if (!sections.has(sectionKey)) {
        sections.set(sectionKey, {
          key: sectionKey,
          label: getDisplaySectionTitle(sectionKey),
          testCode: normalizeString(row.testCode),
          fields: [],
        });
      }

      const parsedField: ParsedField = {
        id: row.id,
        row: row.row,
        testCode: normalizeString(row.testCode),
        section,
        label: type,
        kind: "text",
        required: isRequiredField(row),
        options: parseContinuationOptions(row.field),
      };

      parsedField.kind = getFieldKind(row, parsedField.options);
      sections.get(sectionKey)?.fields.push(parsedField);
      lastField = parsedField;
      continue;
    }

    if (!section && !type && lastField) {
      const nextOptions = parseContinuationOptions(row.field);
      if (nextOptions.length > 0) {
        const existing = new Set(lastField.options);
        for (const option of nextOptions) {
          if (!existing.has(option)) {
            lastField.options.push(option);
            existing.add(option);
          }
        }
        if (lastField.kind !== "select") {
          lastField.kind = "select";
        }
      }
    }
  }

  return Array.from(sections.values()).map((section) => ({
    ...section,
    fields: section.fields.sort((a, b) => a.row - b.row),
  }));
};

const OtherMedicalsForm = ({ applicationId, roleType, memberType, medicalSections = [] }: OtherMedicalsFormProps) => {
  const dispatch = useAppDispatch();
  const [formValues, setFormValues] = useState<FormValues>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");

  const sections = useMemo(() => buildSections(otherMedicalFieldConfig), []);
  const activeSectionKey = selectedSection || sections[0]?.key || "";
  const activeSection = useMemo(
    () => sections.find((section) => section.key === activeSectionKey),
    [activeSectionKey, sections]
  );

  const sectionOptions = useMemo(
    () => sections.map((section) => ({ label: section.label, value: section.key })),
    [sections]
  );

  const mockRowsForActiveSection = useMemo(() => {
    if (!activeSection) {
      return [] as MedicalTestRow[];
    }

    const sectionKey = normalizeKey(activeSection.key);
    const sectionLabelKey = normalizeKey(activeSection.label);
    const matchedSection = medicalSections.find((section) => {
      const titleKey = normalizeKey(section.title);
      return titleKey === sectionKey || titleKey === sectionLabelKey || sectionKey.includes(titleKey) || titleKey.includes(sectionKey);
    });

    return matchedSection?.rows ?? [];
  }, [activeSection, medicalSections]);

  const mockRowColumns: Column<MedicalTestRow>[] = [
    {
      key: "parameter",
      header: "Parameter",
      width: "28%",
      render: (value) => value,
    },
    {
      key: "value",
      header: "Value",
      width: "16%",
      render: (value) => value,
    },
    {
      key: "unit",
      header: "Unit",
      width: "16%",
      render: (value) => value,
    },
    {
      key: "normalRange",
      header: "Normal Range",
      width: "20%",
      render: (value) => value,
    },
    {
      key: "status",
      header: "Status",
      width: "20%",
      render: (value) => (
        <Typography sx={{ color: value === "abnormal" ? "#DE2C3B" : "#0F8A3D", fontWeight: 600, textTransform: "capitalize" }}>
          {value}
        </Typography>
      ),
    },
  ];

  const handleValueChange = (fieldId: string, value: string) => {
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

    for (const field of activeSection?.fields ?? []) {
      const value = normalizeString(formValues[field.id]);

      if (field.required && !value) {
        nextErrors[field.id] = "This field is required.";
        continue;
      }

      if (value && field.kind === "date" && !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        nextErrors[field.id] = "Use DD/MM/YYYY format.";
        continue;
      }

      if (value && field.kind === "number" && Number.isNaN(Number(value))) {
        nextErrors[field.id] = "Enter a valid number.";
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

    if (!activeSection) {
      setSubmitMessage("No other medical test configuration is available.");
      return;
    }

    if (!validateSection()) {
      setSubmitMessage("Please resolve the highlighted other medical fields.");
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitMessage(null);

      const response = await dispatch(otherMedicalSubmitThunk({
        applicationId,
        roleType,
        memberType,
        testCode: activeSection.testCode || activeSection.fields[0]?.testCode || "",
        fields: activeSection.fields.map((field) => ({
          id: field.id,
          section: field.section,
          type: field.label,
          field: field.kind,
          value: formValues[field.id] ?? "",
        })),
      })).unwrap();

      setSubmitMessage(response.message || "Other medical details submitted successfully.");
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Failed to submit other medical details.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!activeSection) {
    return <Typography sx={{ color: "#6B7280", mt: 1 }}>No Other Medicals configuration found in Sheet 3.</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
      <Box sx={{ maxWidth: 360 }}>
        <CustomSelect
          label="Select Test"
          value={activeSectionKey}
          onChange={setSelectedSection}
          options={sectionOptions}
          placeholder="Choose test"
        />
      </Box>

      <CustomAccordion title={activeSection.label} defaultExpanded>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {mockRowsForActiveSection.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1E1E1E", mb: 1 }}>
                Existing Medical Data (from mock)
              </Typography>
              <CustomTable<MedicalTestRow> columns={mockRowColumns} data={mockRowsForActiveSection} />
            </Box>
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
          {activeSection.fields.map((field) => {
            const label = `${field.label}${field.required ? " *" : ""}`;
            const value = formValues[field.id] ?? "";
            const error = formErrors[field.id];

            if (field.kind === "select") {
              const selectOptions = field.options.map((option) => ({ label: option, value: option }));
              return (
                <Box key={field.id}>
                  <CustomSelect
                    label={label}
                    value={value}
                    onChange={(nextValue) => handleValueChange(field.id, nextValue)}
                    options={selectOptions}
                    placeholder="Select"
                  />
                  {error && <Typography sx={{ fontSize: 12, color: "#D32F2F", mt: 0.5 }}>{error}</Typography>}
                </Box>
              );
            }

            return (
              <Box key={field.id}>
                <Typography sx={{ fontSize: 12, color: "#444", mb: 0.75 }}>{label}</Typography>
                <CustomTextField
                  value={value}
                  onChange={(event) => handleValueChange(field.id, event.target.value)}
                  size="small"
                  type={field.kind === "number" ? "number" : "text"}
                  placeholder={field.kind === "date" ? "DD/MM/YYYY" : ""}
                  error={Boolean(error)}
                  helperText={error || " "}
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
        </Box>
      </CustomAccordion>

      {submitMessage && (
        <Typography sx={{ color: submitMessage.toLowerCase().includes("failed") || submitMessage.toLowerCase().includes("highlighted") ? "#DE2C3B" : "#0F8A3D" }}>
          {submitMessage}
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <CustomButton onClick={handleSubmit} disabled={submitLoading} sx={{ minWidth: 190, borderRadius: "999px" }}>
          {submitLoading ? "Submitting..." : "Submit Other Medical"}
        </CustomButton>
      </Box>
    </Box>
  );
};

export default OtherMedicalsForm;
