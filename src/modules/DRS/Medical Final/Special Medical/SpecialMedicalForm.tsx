import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import CustomSelect from "../../../../components/ui/Select/Select";
import CustomTextField from "../../../../components/ui/TextField/TextField";
import mastersMockData from "../../../../../mock/drs/masters.mock.json";
import {
  type MedicalFinalConfigField,
  type SpecialMedicalFieldConfig,
  getSpecialMedicalSubSectionFormFields,
} from "./specialMedicalConfig";

type SpecialMedicalFormProps = {
  selectedSubSection?: string;
  fields: MedicalFinalConfigField[];
};

type MastersOption = {
  code?: string;
  description?: string;
  value?: string | null;
};

type MastersPayload = {
  data?: Record<string, unknown>;
};

const toOptionList = (values: MastersOption[] = []) =>
  values
    .map((option) => ({
      label: String(option.description ?? option.value ?? option.code ?? "").trim(),
      value: String(option.value ?? option.description ?? option.code ?? "").trim(),
    }))
    .filter((option) => option.label && option.value);

const getMasterArray = (data: Record<string, unknown>, key: string): MastersOption[] => {
  const value = data[key];
  return Array.isArray(value) ? (value as MastersOption[]) : [];
};

const buildMasterOptions = () => {
  const payload = mastersMockData as unknown as MastersPayload;
  const masterData = payload.data ?? {};

  return {
    medical_type: toOptionList(getMasterArray(masterData, "medical_type")),
    special_medical_findings: toOptionList(getMasterArray(masterData, "special_medical_findings")),
    rejection_abnormality: toOptionList(getMasterArray(masterData, "rejection_abnormality")),
    abnormal_normal_findings: toOptionList(getMasterArray(masterData, "abnormal_normal_findings")),
    ecg_axis: toOptionList(getMasterArray(masterData, "ecg_axis")),
    tmt_findings: toOptionList(getMasterArray(masterData, "tmt_findings")),
    tmt_mets: toOptionList(getMasterArray(masterData, "tmt_mets")),
  };
};

const validateField = (field: SpecialMedicalFieldConfig, value: string) => {
  const trimmedValue = value.trim();

  if (field.required && !trimmedValue) {
    return "This field is required.";
  }

  if (!trimmedValue) {
    return "";
  }

  if (field.validation === "numeric" && !/^\d+$/.test(trimmedValue)) {
    return "Only numbers are allowed.";
  }

  if (field.type === "date" && field.disableFutureDate) {
    const selectedDate = new Date(trimmedValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!Number.isNaN(selectedDate.getTime()) && selectedDate > today) {
      return "Future date is not allowed.";
    }
  }

  return "";
};

const SpecialMedicalForm = ({ selectedSubSection }: SpecialMedicalFormProps) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const masterOptions = useMemo(() => buildMasterOptions(), []);
  const subsectionFields = useMemo(
    () => getSpecialMedicalSubSectionFormFields(selectedSubSection),
    [selectedSubSection]
  );

  const handleValueChange = (field: SpecialMedicalFieldConfig, value: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field.id]: value,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field.id]: validateField(field, value),
    }));
  };

  const maxDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <Box>
      {subsectionFields.length === 0 ? (
        <Typography sx={{ color: "#667085", fontSize: 13 }}>
          No field configuration found for this Special Medical subsection.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: 1.5,
            mt: 1,
          }}
        >
          {subsectionFields.map((field) => {
            const value = formValues[field.id] ?? "";
            const error = formErrors[field.id] ?? "";
            const options = field.masterKey ? (masterOptions[field.masterKey] ?? []) : [];

            return (
              <Box key={field.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 1 }}>
                  <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#444" }}>
                    {field.label}
                  </Typography>
                  {field.required && (
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>
                  )}
                </Box>

                {field.type === "dropdown" ? (
                  <CustomSelect
                    value={value}
                    onChange={(nextValue) => handleValueChange(field, nextValue)}
                    options={options}
                    placeholder="Select"
                    disabled={!field.editable}
                    error={Boolean(error)}
                    helperText={error || " "}
                  />
                ) : (
                  <CustomTextField
                    fullWidth
                    size="small"
                    type={field.type === "date" ? "date" : (field.type === "number" ? "number" : "text")}
                    value={value}
                    onChange={(event) => handleValueChange(field, event.target.value)}
                    disabled={!field.editable}
                    error={Boolean(error)}
                    helperText={error || " "}
                    placeholder={field.type === "date" ? "YYYY-MM-DD" : ""}
                    sx={
                      !field.editable
                        ? {
                            "& .MuiInputBase-root": {
                              backgroundColor: "#F3F4F6",
                              cursor: "not-allowed",
                            },
                            "& .MuiInputBase-input": {
                              cursor: "not-allowed",
                            },
                          }
                        : undefined
                    }
                    slotProps={
                      field.type === "date" && field.disableFutureDate
                        ? {
                            htmlInput: {
                              max: maxDate,
                            },
                          }
                        : undefined
                    }
                  />
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default SpecialMedicalForm;
