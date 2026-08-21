import { Box, Typography } from "@mui/material";
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import CustomSelect from "../../../../components/ui/Select/Select";
import CustomTextField from "../../../../components/ui/TextField/TextField";
import mastersMockData from "../../../../../mock/drs/masters.mock.json";
import {
  type MedicalFinalConfigField,
  type SpecialMedicalFieldConfig,
  getSpecialMedicalSubSectionFormFields,
} from "./specialMedicalConfig";
import type { MedicalCalculatedParameter } from "./specialMedical.types";

type SpecialMedicalFormProps = {
  selectedSubSection?: string;
  fields: MedicalFinalConfigField[];
  isEditing?: boolean;
};

export type SpecialMedicalFormHandle = {
  validateForm: () => boolean;
  getFormValues: () => Record<string, string>;
  setFormValues: (
    values: Record<string, string>
  ) => void;
  setCalculatedFindings: (
    parameters: MedicalCalculatedParameter[]
  ) => void;
  beginEdit: () => void;
  resetEdit: () => void;
  commitEdit: () => void;
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

const SpecialMedicalForm = forwardRef<SpecialMedicalFormHandle, SpecialMedicalFormProps>(({ selectedSubSection, isEditing = false }, ref) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const editSnapshotRef = useRef<Record<string, string> | null>(null);

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

useImperativeHandle(
  ref,
  (): SpecialMedicalFormHandle => ({
    validateForm: () => {
      const nextErrors = subsectionFields.reduce<
        Record<string, string>
      >((errors, field) => {
        const value = formValues[field.id] ?? "";
        const error = validateField(field, value);

        if (error) {
          errors[field.id] = error;
        }

        return errors;
      }, {});

      setFormErrors(nextErrors);

      return Object.keys(nextErrors).length === 0;
    },

    getFormValues: () =>
      subsectionFields.reduce<Record<string, string>>(
        (values, field) => {
          values[field.id] = formValues[field.id] ?? "";
          return values;
        },
        {}
      ),

    setFormValues: (
      nextValues: Record<string, string>
    ) => {
      setFormValues((currentValues) => ({
        ...currentValues,
        ...nextValues,
      }));
    },

    setCalculatedFindings: (
      parameters: MedicalCalculatedParameter[]
    ) => {
      const calculatedFinding = parameters.find(
        (parameter) =>
          String(
            parameter.findingsCalculated ?? ""
          ).trim() !== ""
      )?.findingsCalculated;

      setFormValues((currentValues) => ({
        ...currentValues,
        findingsCalculated:
          calculatedFinding == null
            ? ""
            : String(calculatedFinding),
      }));
    },

    beginEdit: () => {
      editSnapshotRef.current =
        structuredClone(formValues);
    },

    resetEdit: () => {
      if (editSnapshotRef.current) {
        setFormValues(
          structuredClone(editSnapshotRef.current)
        );
      }

      setFormErrors({});
      editSnapshotRef.current = null;
    },

    commitEdit: () => {
      editSnapshotRef.current = null;
      setFormErrors({});
    },
  }),
  [formValues, subsectionFields]
);

  return (
    <Box
      component="fieldset"
      disabled={!isEditing}
      sx={{
        border: 0,
        p: 0,
        m: 0,
        minWidth: 0,
        "& .MuiOutlinedInput-root.Mui-disabled": { backgroundColor: "#F3F4F6" },
      }}
    >
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
                    disabled={!isEditing || !field.editable}
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
                    disabled={!isEditing || !field.editable}
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
});

SpecialMedicalForm.displayName = "SpecialMedicalForm";

export default SpecialMedicalForm;
