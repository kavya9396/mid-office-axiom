import { Box, Typography } from "@mui/material";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from "react";
import CustomSelect from "../../../../components/ui/Select/Select";
import CustomTextField from "../../../../components/ui/TextField/TextField";
import mastersMockData from "../../../../../mock/drs/masters.mock.json";
import type { MedicalFinalConfigField, MerSubSectionFieldConfig } from "./merConfig";
import { getMerSubSectionFormFields } from "./merConfig";

type MerFormProps = {
  selectedSubSection?: string;
  fields: MedicalFinalConfigField[];
  applicationNo?: string;
};

export type MerFormHandle = {
  validateForm: () => boolean;
  getFormValues: () => Record<string, string>;
  setFormValues: (nextValues: Record<string, string>) => void;
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
  values.map((option) => ({
    label: String(option.description ?? option.value ?? option.code ?? "").trim(),
    value: String(option.value ?? option.description ?? option.code ?? "").trim(),
  })).filter((option) => option.label && option.value);

const getMasterArray = (data: Record<string, unknown>, key: string): MastersOption[] => {
  const value = data[key];
  return Array.isArray(value) ? (value as MastersOption[]) : [];
};

const buildMasterOptions = () => {
  const payload = mastersMockData as unknown as MastersPayload;
  const masterData = payload.data ?? {};

  return {
    yes_no: toOptionList(getMasterArray(masterData, "yes_no")),
    place_of_examination: toOptionList(getMasterArray(masterData, "place_of_examination")),
    gender: toOptionList(getMasterArray(masterData, "gender")),
    mer_education_sd: toOptionList(getMasterArray(masterData, "mer_education_sd")),
    mer_occupation_sd: toOptionList(getMasterArray(masterData, "mer_occupation_sd")),
    family_relation: toOptionList(getMasterArray(masterData, "family_relation")),
    dead_or_alive: toOptionList(getMasterArray(masterData, "dead_or_alive")),
  };
};

const isConditionallyRequired = (
  field: MerSubSectionFieldConfig,
  values: Record<string, string>
) => {
  if (!field.requiredWhen) {
    return false;
  }

  const selectedValue = (values[field.requiredWhen.fieldId] ?? "").trim().toLowerCase();
  return selectedValue === field.requiredWhen.value.trim().toLowerCase();
};

const validateField = (
  field: MerSubSectionFieldConfig,
  value: string,
  values: Record<string, string>
) => {
  const trimmedValue = value.trim();
  const isRequired = field.required || isConditionallyRequired(field, values);

  if (isRequired && !trimmedValue) {
    return "This field is required.";
  }

  if (!trimmedValue) {
    return "";
  }

  if (field.validation === "alpha" && !/^[A-Za-z ]+$/.test(trimmedValue)) {
    return "Only alphabets are allowed.";
  }

  if (field.validation === "numeric" && !/^\d+$/.test(trimmedValue)) {
    return "Only numbers are allowed.";
  }

  return "";
};

const MerForm = forwardRef<MerFormHandle, MerFormProps>(({ selectedSubSection, applicationNo }, ref) => {
  const [formValues, setFormValuesState] = useState<Record<string, string>>({
    applicationNo: applicationNo ?? "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const masterOptions = useMemo(() => buildMasterOptions(), []);
  const subsectionFields = useMemo(
    () => getMerSubSectionFormFields(selectedSubSection),
    [selectedSubSection]
  );

  const handleValueChange = (field: MerSubSectionFieldConfig, value: string) => {
    setFormValuesState((currentValues) => ({
      ...currentValues,
      [field.id]: value,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field.id]: validateField(field, value, { ...formValues, [field.id]: value }),
    }));
  };

  const getFieldValue = (field: MerSubSectionFieldConfig) => formValues[field.id] ?? field.defaultValue ?? "";
  const getResolvedFormValues = useCallback(
    () =>
      subsectionFields.reduce<Record<string, string>>(
      (accumulator, field) => ({
        ...accumulator,
        [field.id]: formValues[field.id] ?? field.defaultValue ?? "",
      }),
      {
        applicationNo: formValues.applicationNo ?? applicationNo ?? "",
      }
      ),
    [applicationNo, formValues, subsectionFields]
  );

  useImperativeHandle(
    ref,
    () => ({
      validateForm: () => {
        const nextErrors = subsectionFields.reduce<Record<string, string>>((accumulator, field) => {
          const value = formValues[field.id] ?? field.defaultValue ?? "";
          const error = validateField(field, value, formValues);

          if (error) {
            accumulator[field.id] = error;
          }

          return accumulator;
        }, {});

        setFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
      },
      getFormValues: () => getResolvedFormValues(),
      setFormValues: (nextValues: Record<string, string>) => {
        setFormValuesState((currentValues) => ({
          ...currentValues,
          ...nextValues,
        }));
      },
    }),
    [getResolvedFormValues, formValues, subsectionFields]
  );

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 1.5,
          mt: 1,
        }}
      >
        {subsectionFields.map((field) => {
          const value = getFieldValue(field);
          const error = formErrors[field.id] ?? "";
          const options = field.masterKey ? (masterOptions[field.masterKey] ?? []) : [];
          const showRequired = field.required || isConditionallyRequired(field, formValues);

          return (
            <Box key={field.id}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 1 }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#444" }}>
                  {field.label}
                </Typography>
                {showRequired && (
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
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

MerForm.displayName = "MerForm";

export default MerForm;
