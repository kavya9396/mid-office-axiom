import { Box, Typography } from "@mui/material";
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import CustomSelect from "../../../../components/ui/Select/Select";
import CustomTextField from "../../../../components/ui/TextField/TextField";
import mastersMockData from "../../../../../mock/drs/masters.mock.json";
import {
  type MedicalFinalConfigField,
  type OtherMedicalsFieldConfig,
  getOtherMedicalsSubSectionFormFields,
  CBC_TABLE_ROWS,
  LFT_TABLE_ROWS,
  LIPIDS_TABLE_ROWS,
  OGTT_TABLE_ROWS,
  SMA12_TABLE_ROWS,
  TFT_TABLE_ROWS,
  S13_TABLE_ROWS,
  RUA_TABLE_ROWS,
  OTHER_MEDICALS_CBC_GROUP_SECTION_LABEL,
  OTHER_MEDICALS_LFT_SECTION_LABEL,
  OTHER_MEDICALS_LIPIDS_SECTION_LABEL,
  OTHER_MEDICALS_OGTT_GROUP_SECTION_LABEL,
  OTHER_MEDICALS_SMA12_GROUP_SECTION_LABEL,
  OTHER_MEDICALS_TFT_GROUP_SECTION_LABEL,
  OTHER_MEDICALS_S13_GROUP_SECTION_LABEL,
  OTHER_MEDICALS_RUA_GROUP_SECTION_LABEL,
} from "./otherMedicalsConfig";
import type { OtherMedicalTableData } from "./otherMedicals.types";

type OtherMedicalsFormProps = {
  selectedSubSection?: string;
  fields: MedicalFinalConfigField[];
  isEditing?: boolean;
};

export type OtherMedicalsFormHandle = {
  validateForm: () => boolean;
  getFormValues: () => Record<string, string>;
  getTableData: () => OtherMedicalTableData;
  setFormValues: (values: Record<string, string>) => void;
  beginEdit: () => void;
  resetEdit: () => void;
  commitEdit: () => void;
};

type MedicalTableData = Record<string, { value: string; labStart: string; labEnd: string; unit: string; findings: string }>;

type OtherMedicalsEditSnapshot = {
  formValues: Record<string, string>;
  cbcTableData: MedicalTableData;
  lftTableData: MedicalTableData;
  lipidsTableData: MedicalTableData;
  ogttTableData: MedicalTableData;
  sma12TableData: MedicalTableData;
  tftTableData: MedicalTableData;
  s13TableData: MedicalTableData;
  ruaTableData: MedicalTableData;
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
    gender: toOptionList(getMasterArray(masterData, "gender")),
    negative_positive_reactive: toOptionList(getMasterArray(masterData, "negative_positive_reactive")),
    rua_sugar_glycosuria: toOptionList(getMasterArray(masterData, "rua_sugar_glycosuria")),
    rua_albumin_proteinuria: toOptionList(getMasterArray(masterData, "rua_albumin_proteinuria")),
    rua_rbc_haematuria: toOptionList(getMasterArray(masterData, "rua_rbc_haematuria")),
    rua_ketone_bodies: toOptionList(getMasterArray(masterData, "rua_ketone_bodies")),
    rua_urine_colour: toOptionList(getMasterArray(masterData, "rua_urine_colour")),
    rua_urine_appearance: toOptionList(getMasterArray(masterData, "rua_urine_appearance")),
    rua_urobilinogen: toOptionList(getMasterArray(masterData, "rua_urobilinogen")),
    rua_present_absent: toOptionList(getMasterArray(masterData, "rua_present_absent")),
  };
};

const validateField = (field: OtherMedicalsFieldConfig, value: string) => {
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

const OtherMedicalsForm = forwardRef<OtherMedicalsFormHandle, OtherMedicalsFormProps>(({ selectedSubSection, isEditing = false }, ref) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [cbcTableData, setCbcTableData] = useState<Record<string, { value: string; labStart: string; labEnd: string; unit: string; findings: string }>>({});
  const [lftTableData, setLftTableData] = useState<Record<string, { value: string; labStart: string; labEnd: string; unit: string; findings: string }>>({});
  const [lipidsTableData, setLipidsTableData] = useState<Record<string, { value: string; labStart: string; labEnd: string; unit: string; findings: string }>>({});
  const [ogttTableData, setOgttTableData] = useState<Record<string, { value: string; labStart: string; labEnd: string; unit: string; findings: string }>>({});
  const [sma12TableData, setSma12TableData] = useState<Record<string, { value: string; labStart: string; labEnd: string; unit: string; findings: string }>>({});
  const [tftTableData, setTftTableData] = useState<Record<string, { value: string; labStart: string; labEnd: string; unit: string; findings: string }>>({});
  const [s13TableData, setS13TableData] = useState<Record<string, { value: string; labStart: string; labEnd: string; unit: string; findings: string }>>({});
  const [ruaTableData, setRuaTableData] = useState<Record<string, { value: string; labStart: string; labEnd: string; unit: string; findings: string }>>({});
  const editSnapshotRef = useRef<OtherMedicalsEditSnapshot | null>(null);

  const masterOptions = useMemo(() => buildMasterOptions(), []);
  const subsectionFields = useMemo(
    () => getOtherMedicalsSubSectionFormFields(selectedSubSection),
    [selectedSubSection]
  );

  const handleValueChange = (field: OtherMedicalsFieldConfig, value: string) => {
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

  const handleCbcTableChange = (parameterId: string, field: "value" | "labStart" | "labEnd", newValue: string) => {
    setCbcTableData((prev) => ({
      ...prev,
      [parameterId]: {
        ...prev[parameterId],
        value: prev[parameterId]?.value || "",
        labStart: prev[parameterId]?.labStart || "",
        labEnd: prev[parameterId]?.labEnd || "",
        unit: prev[parameterId]?.unit || "",
        findings: prev[parameterId]?.findings || "",
        [field]: newValue,
      },
    }));
  };

  const handleLftTableChange = (parameterId: string, field: "value" | "labStart" | "labEnd", newValue: string) => {
    setLftTableData((prev) => ({
      ...prev,
      [parameterId]: {
        ...prev[parameterId],
        value: prev[parameterId]?.value || "",
        labStart: prev[parameterId]?.labStart || "",
        labEnd: prev[parameterId]?.labEnd || "",
        unit: prev[parameterId]?.unit || "",
        findings: prev[parameterId]?.findings || "",
        [field]: newValue,
      },
    }));
  };

  const handleLipidsTableChange = (parameterId: string, field: "value" | "labStart" | "labEnd", newValue: string) => {
    setLipidsTableData((prev) => ({
      ...prev,
      [parameterId]: {
        ...prev[parameterId],
        value: prev[parameterId]?.value || "",
        labStart: prev[parameterId]?.labStart || "",
        labEnd: prev[parameterId]?.labEnd || "",
        unit: prev[parameterId]?.unit || "",
        findings: prev[parameterId]?.findings || "",
        [field]: newValue,
      },
    }));
  };

  const handleOgttTableChange = (parameterId: string, field: "value" | "labStart" | "labEnd", newValue: string) => {
    setOgttTableData((prev) => ({
      ...prev,
      [parameterId]: {
        ...prev[parameterId],
        value: prev[parameterId]?.value || "",
        labStart: prev[parameterId]?.labStart || "",
        labEnd: prev[parameterId]?.labEnd || "",
        unit: prev[parameterId]?.unit || "",
        findings: prev[parameterId]?.findings || "",
        [field]: newValue,
      },
    }));
  };

  const handleSma12TableChange = (parameterId: string, field: "value" | "labStart" | "labEnd", newValue: string) => {
    setSma12TableData((prev) => ({
      ...prev,
      [parameterId]: {
        ...prev[parameterId],
        value: prev[parameterId]?.value || "",
        labStart: prev[parameterId]?.labStart || "",
        labEnd: prev[parameterId]?.labEnd || "",
        unit: prev[parameterId]?.unit || "",
        findings: prev[parameterId]?.findings || "",
        [field]: newValue,
      },
    }));
  };

  const handleTftTableChange = (parameterId: string, field: "value" | "labStart" | "labEnd", newValue: string) => {
    setTftTableData((prev) => ({
      ...prev,
      [parameterId]: {
        ...prev[parameterId],
        value: prev[parameterId]?.value || "",
        labStart: prev[parameterId]?.labStart || "",
        labEnd: prev[parameterId]?.labEnd || "",
        unit: prev[parameterId]?.unit || "",
        findings: prev[parameterId]?.findings || "",
        [field]: newValue,
      },
    }));
  };

  const handleS13TableChange = (parameterId: string, field: "value" | "labStart" | "labEnd", newValue: string) => {
    setS13TableData((prev) => ({
      ...prev,
      [parameterId]: {
        ...prev[parameterId],
        value: prev[parameterId]?.value || "",
        labStart: prev[parameterId]?.labStart || "",
        labEnd: prev[parameterId]?.labEnd || "",
        unit: prev[parameterId]?.unit || "",
        findings: prev[parameterId]?.findings || "",
        [field]: newValue,
      },
    }));
  };

  const handleRuaTableChange = (parameterId: string, field: "value" | "labStart" | "labEnd", newValue: string) => {
    setRuaTableData((prev) => ({
      ...prev,
      [parameterId]: {
        ...prev[parameterId],
        value: prev[parameterId]?.value || "",
        labStart: prev[parameterId]?.labStart || "",
        labEnd: prev[parameterId]?.labEnd || "",
        unit: prev[parameterId]?.unit || "",
        findings: prev[parameterId]?.findings || "",
        [field]: newValue,
      },
    }));
  };

  const isCbcGroupSection = selectedSubSection === OTHER_MEDICALS_CBC_GROUP_SECTION_LABEL;
  const isLftSection = selectedSubSection === OTHER_MEDICALS_LFT_SECTION_LABEL;
  const isLipidsSection = selectedSubSection === OTHER_MEDICALS_LIPIDS_SECTION_LABEL;
  const isOgttGroupSection = selectedSubSection === OTHER_MEDICALS_OGTT_GROUP_SECTION_LABEL;
  const isSma12GroupSection = selectedSubSection === OTHER_MEDICALS_SMA12_GROUP_SECTION_LABEL;
  const isTftGroupSection = selectedSubSection === OTHER_MEDICALS_TFT_GROUP_SECTION_LABEL;
  const isS13GroupSection = selectedSubSection === OTHER_MEDICALS_S13_GROUP_SECTION_LABEL;
  const isRuaGroupSection = selectedSubSection === OTHER_MEDICALS_RUA_GROUP_SECTION_LABEL;

useImperativeHandle(
  ref,
  (): OtherMedicalsFormHandle => ({
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

    getTableData: () => {
      if (isCbcGroupSection) {
        return structuredClone(cbcTableData);
      }

      if (isLftSection) {
        return structuredClone(lftTableData);
      }

      if (isLipidsSection) {
        return structuredClone(lipidsTableData);
      }

      if (isOgttGroupSection) {
        return structuredClone(ogttTableData);
      }

      if (isSma12GroupSection) {
        return structuredClone(sma12TableData);
      }

      if (isTftGroupSection) {
        return structuredClone(tftTableData);
      }

      if (isS13GroupSection) {
        return structuredClone(s13TableData);
      }

      if (isRuaGroupSection) {
        return structuredClone(ruaTableData);
      }

      return {};
    },

    setFormValues: (nextValues: Record<string, string>) => {
      setFormValues((currentValues) => ({
        ...currentValues,
        ...nextValues,
      }));
    },

    beginEdit: () => {
      editSnapshotRef.current = {
        formValues: structuredClone(formValues),
        cbcTableData: structuredClone(cbcTableData),
        lftTableData: structuredClone(lftTableData),
        lipidsTableData: structuredClone(lipidsTableData),
        ogttTableData: structuredClone(ogttTableData),
        sma12TableData: structuredClone(sma12TableData),
        tftTableData: structuredClone(tftTableData),
        s13TableData: structuredClone(s13TableData),
        ruaTableData: structuredClone(ruaTableData),
      };
    },
    resetEdit: () => {
      const snapshot = editSnapshotRef.current;
      if (snapshot) {
        setFormValues(snapshot.formValues);
        setCbcTableData(snapshot.cbcTableData);
        setLftTableData(snapshot.lftTableData);
        setLipidsTableData(snapshot.lipidsTableData);
        setOgttTableData(snapshot.ogttTableData);
        setSma12TableData(snapshot.sma12TableData);
        setTftTableData(snapshot.tftTableData);
        setS13TableData(snapshot.s13TableData);
        setRuaTableData(snapshot.ruaTableData);
      }
      setFormErrors({});
      editSnapshotRef.current = null;
    },
    commitEdit: () => {
      editSnapshotRef.current = null;
      setFormErrors({});
    },
  }),
  [
    subsectionFields,
    formValues,
    cbcTableData,
    lftTableData,
    lipidsTableData,
    ogttTableData,
    sma12TableData,
    tftTableData,
    s13TableData,
    ruaTableData,
    isCbcGroupSection,
    isLftSection,
    isLipidsSection,
    isOgttGroupSection,
    isSma12GroupSection,
    isTftGroupSection,
    isS13GroupSection,
    isRuaGroupSection,
  ]
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
          No field configuration found for this Other Medicals subsection.
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
                    type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
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

      {/* CBC Table - Rendered below the form fields for CBC Group section */}
      {isCbcGroupSection && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 600, mb: 2, color: "#1F2937" }}>
            CBC Test Parameters
          </Typography>
          
          <Box sx={{ 
            border: "1px solid #E5E7EB", 
            borderRadius: "8px", 
            overflow: "hidden",
            backgroundColor: "#fff"
          }}>
            {/* Table Header */}
            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr",
              backgroundColor: "#F9FAFB",
              borderBottom: "1px solid #E5E7EB",
              padding: "12px 16px",
              fontWeight: 600,
              fontSize: "13px",
              color: "#374151"
            }}>
              <Box>Parameter</Box>
              <Box>Value</Box>
              <Box>Unit</Box>
              <Box>Normal Range</Box>
              <Box>Status</Box>
            </Box>

            {/* Table Rows */}
            {CBC_TABLE_ROWS.map((row) => {
              const rowData = cbcTableData[row.id] || { value: "", labStart: "", labEnd: "", unit: "", findings: "" };
              const isRequired = row.required;

              return (
                <Box 
                  key={row.id}
                  sx={{ 
                    display: "grid", 
                    gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr",
                    borderBottom: "1px solid #E5E7EB",
                    padding: "12px 16px",
                    alignItems: "center",
                    gap: 2,
                    "&:last-child": {
                      borderBottom: "none"
                    },
                    "&:hover": {
                      backgroundColor: "#F9FAFB"
                    }
                  }}
                >
                  {/* Parameter Name */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontSize: "14px", color: "#1F2937" }}>
                      {row.parameter}
                    </Typography>
                    {isRequired && (
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>
                    )}
                    {row.conditionalRequirement && (
                      <Typography sx={{ fontSize: 11, color: "#6B7280", fontStyle: "italic" }}>
                        (any one)
                      </Typography>
                    )}
                  </Box>

                  {/* Value Input */}
                  <CustomTextField
                    fullWidth
                    size="small"
                    value={rowData.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        handleCbcTableChange(row.id, "value", val);
                      }
                    }}
                    placeholder="Enter value"
                    sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }}
                  />

                  {/* Unit (non-editable, from API) */}
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>
                    {rowData.unit || "-"}
                  </Typography>

                  {/* Normal Range (Lab Start - Lab End) */}
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <CustomTextField
                      fullWidth
                      size="small"
                      value={rowData.labStart}
                      onChange={(e) => handleCbcTableChange(row.id, "labStart", e.target.value)}
                      placeholder="Min"
                      sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }}
                    />
                    <Typography sx={{ color: "#9CA3AF", fontSize: "14px" }}>-</Typography>
                    <CustomTextField
                      fullWidth
                      size="small"
                      value={rowData.labEnd}
                      onChange={(e) => handleCbcTableChange(row.id, "labEnd", e.target.value)}
                      placeholder="Max"
                      sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }}
                    />
                  </Box>

                  {/* Findings/Status (non-editable, from API) */}
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>
                    {rowData.findings || "-"}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* LFT Table - Rendered below the form fields for LFT section */}
      {isLftSection && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 600, mb: 2, color: "#1F2937" }}>
            LFT Test Parameters
          </Typography>
          
          <Box sx={{ 
            border: "1px solid #E5E7EB", 
            borderRadius: "8px", 
            overflow: "hidden",
            backgroundColor: "#fff"
          }}>
            {/* Table Header */}
            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr",
              backgroundColor: "#F9FAFB",
              borderBottom: "1px solid #E5E7EB",
              padding: "12px 16px",
              fontWeight: 600,
              fontSize: "13px",
              color: "#374151"
            }}>
              <Box>Parameter</Box>
              <Box>Value</Box>
              <Box>Unit</Box>
              <Box>Normal Range</Box>
              <Box>Status</Box>
            </Box>

            {/* Table Rows */}
            {LFT_TABLE_ROWS.map((row) => {
              const rowData = lftTableData[row.id] || { value: "", labStart: "", labEnd: "", unit: "", findings: "" };
              const isRequired = row.required;

              return (
                <Box 
                  key={row.id}
                  sx={{ 
                    display: "grid", 
                    gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr",
                    borderBottom: "1px solid #E5E7EB",
                    padding: "12px 16px",
                    alignItems: "center",
                    gap: 2,
                    "&:last-child": {
                      borderBottom: "none"
                    },
                    "&:hover": {
                      backgroundColor: "#F9FAFB"
                    }
                  }}
                >
                  {/* Parameter Name */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontSize: "14px", color: "#1F2937" }}>
                      {row.parameter}
                    </Typography>
                    {isRequired && (
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>
                    )}
                  </Box>

                  {/* Value Input */}
                  <CustomTextField
                    fullWidth
                    size="small"
                    value={rowData.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        handleLftTableChange(row.id, "value", val);
                      }
                    }}
                    placeholder="Enter value"
                    sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }}
                  />

                  {/* Unit (non-editable, from API) */}
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>
                    {rowData.unit || "-"}
                  </Typography>

                  {/* Normal Range (Lab Start - Lab End) */}
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <CustomTextField
                      fullWidth
                      size="small"
                      value={rowData.labStart}
                      onChange={(e) => handleLftTableChange(row.id, "labStart", e.target.value)}
                      placeholder="Min"
                      sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }}
                    />
                    <Typography sx={{ color: "#9CA3AF", fontSize: "14px" }}>-</Typography>
                    <CustomTextField
                      fullWidth
                      size="small"
                      value={rowData.labEnd}
                      onChange={(e) => handleLftTableChange(row.id, "labEnd", e.target.value)}
                      placeholder="Max"
                      sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }}
                    />
                  </Box>

                  {/* Findings/Status (non-editable, from API) */}
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>
                    {rowData.findings || "-"}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* LIPIDS Table */}
      {isLipidsSection && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 600, mb: 2, color: "#1F2937" }}>
            LIPIDS Test Parameters
          </Typography>
          
          <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr", backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", fontWeight: 600, fontSize: "13px", color: "#374151" }}>
              <Box>Parameter</Box>
              <Box>Value</Box>
              <Box>Unit</Box>
              <Box>Normal Range</Box>
              <Box>Status</Box>
            </Box>
            {LIPIDS_TABLE_ROWS.map((row) => {
              const rowData = lipidsTableData[row.id] || { value: "", labStart: "", labEnd: "", unit: "", findings: "" };
              return (
                <Box key={row.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", alignItems: "center", gap: 2, "&:last-child": { borderBottom: "none" }, "&:hover": { backgroundColor: "#F9FAFB" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontSize: "14px", color: "#1F2937" }}>{row.parameter}</Typography>
                    {row.required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
                  </Box>
                  <CustomTextField fullWidth size="small" value={rowData.value} onChange={(e) => { const val = e.target.value; if (val === "" || /^\d*\.?\d*$/.test(val)) { handleLipidsTableChange(row.id, "value", val); } }} placeholder="Enter value" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>{rowData.unit || "-"}</Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <CustomTextField fullWidth size="small" value={rowData.labStart} onChange={(e) => handleLipidsTableChange(row.id, "labStart", e.target.value)} placeholder="Min" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                    <Typography sx={{ color: "#9CA3AF", fontSize: "14px" }}>-</Typography>
                    <CustomTextField fullWidth size="small" value={rowData.labEnd} onChange={(e) => handleLipidsTableChange(row.id, "labEnd", e.target.value)} placeholder="Max" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                  </Box>
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>{rowData.findings || "-"}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* OGTT Table */}
      {isOgttGroupSection && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 600, mb: 2, color: "#1F2937" }}>
            OGTT Test Parameters
          </Typography>
          
          <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr", backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", fontWeight: 600, fontSize: "13px", color: "#374151" }}>
              <Box>Parameter</Box>
              <Box>Value</Box>
              <Box>Unit</Box>
              <Box>Normal Range</Box>
              <Box>Status</Box>
            </Box>
            {OGTT_TABLE_ROWS.map((row) => {
              const rowData = ogttTableData[row.id] || { value: "", labStart: "", labEnd: "", unit: "", findings: "" };
              return (
                <Box key={row.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", alignItems: "center", gap: 2, "&:last-child": { borderBottom: "none" }, "&:hover": { backgroundColor: "#F9FAFB" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontSize: "14px", color: "#1F2937" }}>{row.parameter}</Typography>
                    {row.required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
                  </Box>
                  <CustomTextField fullWidth size="small" value={rowData.value} onChange={(e) => { const val = e.target.value; if (val === "" || /^\d*\.?\d*$/.test(val)) { handleOgttTableChange(row.id, "value", val); } }} placeholder="Enter value" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>{rowData.unit || "-"}</Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <CustomTextField fullWidth size="small" value={rowData.labStart} onChange={(e) => handleOgttTableChange(row.id, "labStart", e.target.value)} placeholder="Min" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                    <Typography sx={{ color: "#9CA3AF", fontSize: "14px" }}>-</Typography>
                    <CustomTextField fullWidth size="small" value={rowData.labEnd} onChange={(e) => handleOgttTableChange(row.id, "labEnd", e.target.value)} placeholder="Max" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                  </Box>
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>{rowData.findings || "-"}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* SMA12 Table */}
      {isSma12GroupSection && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 600, mb: 2, color: "#1F2937" }}>
            SMA12 Test Parameters
          </Typography>
          
          <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr", backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", fontWeight: 600, fontSize: "13px", color: "#374151" }}>
              <Box>Parameter</Box>
              <Box>Value</Box>
              <Box>Unit</Box>
              <Box>Normal Range</Box>
              <Box>Status</Box>
            </Box>
            {SMA12_TABLE_ROWS.map((row) => {
              const rowData = sma12TableData[row.id] || { value: "", labStart: "", labEnd: "", unit: "", findings: "" };
              return (
                <Box key={row.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", alignItems: "center", gap: 2, "&:last-child": { borderBottom: "none" }, "&:hover": { backgroundColor: "#F9FAFB" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontSize: "14px", color: "#1F2937" }}>{row.parameter}</Typography>
                    {row.required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
                    {row.conditionalRequirement && <Typography sx={{ fontSize: 11, color: "#6B7280", fontStyle: "italic" }}>(any one)</Typography>}
                  </Box>
                  <CustomTextField fullWidth size="small" value={rowData.value} onChange={(e) => { const val = e.target.value; if (val === "" || /^\d*\.?\d*$/.test(val)) { handleSma12TableChange(row.id, "value", val); } }} placeholder="Enter value" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>{rowData.unit || "-"}</Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <CustomTextField fullWidth size="small" value={rowData.labStart} onChange={(e) => handleSma12TableChange(row.id, "labStart", e.target.value)} placeholder="Min" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                    <Typography sx={{ color: "#9CA3AF", fontSize: "14px" }}>-</Typography>
                    <CustomTextField fullWidth size="small" value={rowData.labEnd} onChange={(e) => handleSma12TableChange(row.id, "labEnd", e.target.value)} placeholder="Max" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                  </Box>
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>{rowData.findings || "-"}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* TFT Table */}
      {isTftGroupSection && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 600, mb: 2, color: "#1F2937" }}>
            TFT Test Parameters
          </Typography>
          
          <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr", backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", fontWeight: 600, fontSize: "13px", color: "#374151" }}>
              <Box>Parameter</Box>
              <Box>Value</Box>
              <Box>Unit</Box>
              <Box>Normal Range</Box>
              <Box>Status</Box>
            </Box>
            {TFT_TABLE_ROWS.map((row) => {
              const rowData = tftTableData[row.id] || { value: "", labStart: "", labEnd: "", unit: "", findings: "" };
              return (
                <Box key={row.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", alignItems: "center", gap: 2, "&:last-child": { borderBottom: "none" }, "&:hover": { backgroundColor: "#F9FAFB" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontSize: "14px", color: "#1F2937" }}>{row.parameter}</Typography>
                    {row.required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
                  </Box>
                  <CustomTextField fullWidth size="small" value={rowData.value} onChange={(e) => { const val = e.target.value; if (val === "" || /^\d*\.?\d*$/.test(val)) { handleTftTableChange(row.id, "value", val); } }} placeholder="Enter value" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>{rowData.unit || "-"}</Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <CustomTextField fullWidth size="small" value={rowData.labStart} onChange={(e) => handleTftTableChange(row.id, "labStart", e.target.value)} placeholder="Min" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                    <Typography sx={{ color: "#9CA3AF", fontSize: "14px" }}>-</Typography>
                    <CustomTextField fullWidth size="small" value={rowData.labEnd} onChange={(e) => handleTftTableChange(row.id, "labEnd", e.target.value)} placeholder="Max" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                  </Box>
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>{rowData.findings || "-"}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* S13 Table */}
      {isS13GroupSection && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 600, mb: 2, color: "#1F2937" }}>
            S13 Test Parameters
          </Typography>
          
          <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr", backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", fontWeight: 600, fontSize: "13px", color: "#374151" }}>
              <Box>Parameter</Box>
              <Box>Value</Box>
              <Box>Unit</Box>
              <Box>Normal Range</Box>
              <Box>Status</Box>
            </Box>
            {S13_TABLE_ROWS.map((row) => {
              const rowData = s13TableData[row.id] || { value: "", labStart: "", labEnd: "", unit: "", findings: "" };
              return (
                <Box key={row.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", alignItems: "center", gap: 2, "&:last-child": { borderBottom: "none" }, "&:hover": { backgroundColor: "#F9FAFB" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontSize: "14px", color: "#1F2937" }}>{row.parameter}</Typography>
                    {row.required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
                    {row.conditionalRequirement && <Typography sx={{ fontSize: 11, color: "#6B7280", fontStyle: "italic" }}>(any one)</Typography>}
                  </Box>
                  <CustomTextField fullWidth size="small" value={rowData.value} onChange={(e) => { const val = e.target.value; if (val === "" || /^\d*\.?\d*$/.test(val)) { handleS13TableChange(row.id, "value", val); } }} placeholder="Enter value" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>{rowData.unit || "-"}</Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <CustomTextField fullWidth size="small" value={rowData.labStart} onChange={(e) => handleS13TableChange(row.id, "labStart", e.target.value)} placeholder="Min" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                    <Typography sx={{ color: "#9CA3AF", fontSize: "14px" }}>-</Typography>
                    <CustomTextField fullWidth size="small" value={rowData.labEnd} onChange={(e) => handleS13TableChange(row.id, "labEnd", e.target.value)} placeholder="Max" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                  </Box>
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>{rowData.findings || "-"}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* RUA Group Table */}
      {isRuaGroupSection && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 600, mb: 2, color: "#1F2937" }}>
            RUA Test Parameters
          </Typography>
          
          <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr", backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", fontWeight: 600, fontSize: "13px", color: "#374151" }}>
              <Box>Parameter</Box>
              <Box>Value</Box>
              <Box>Unit</Box>
              <Box>Normal Range</Box>
              <Box>Status</Box>
            </Box>
            {RUA_TABLE_ROWS.map((row) => {
              const rowData = ruaTableData[row.id] || { value: "", labStart: "", labEnd: "", unit: "", findings: "" };
              const masterKey = row.masterKey as keyof typeof masterOptions;
              const options = masterKey ? (masterOptions[masterKey] ?? []) : [];
              
              return (
                <Box key={row.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 2fr 1fr", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", alignItems: "center", gap: 2, "&:last-child": { borderBottom: "none" }, "&:hover": { backgroundColor: "#F9FAFB" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontSize: "14px", color: "#1F2937" }}>{row.parameter}</Typography>
                    {row.required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
                  </Box>
                  
                  {/* Value field - Dropdown or Text */}
                  {row.fieldType === "dropdown" ? (
                    <CustomSelect
                      value={rowData.value}
                      onChange={(nextValue) => handleRuaTableChange(row.id, "value", nextValue)}
                      options={options}
                      placeholder="Select"
                    />
                  ) : (
                    <CustomTextField
                      fullWidth
                      size="small"
                      value={rowData.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (row.validation === "numeric") {
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            handleRuaTableChange(row.id, "value", val);
                          }
                        } else {
                          handleRuaTableChange(row.id, "value", val);
                        }
                      }}
                      placeholder="Enter value"
                      sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }}
                    />
                  )}
                  
                  {/* Unit - Display as text */}
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>{rowData.unit || "-"}</Typography>
                  
                  {/* Normal Range - Min-Max inputs */}
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <CustomTextField fullWidth size="small" value={rowData.labStart} onChange={(e) => handleRuaTableChange(row.id, "labStart", e.target.value)} placeholder="Min" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                    <Typography sx={{ color: "#9CA3AF", fontSize: "14px" }}>-</Typography>
                    <CustomTextField fullWidth size="small" value={rowData.labEnd} onChange={(e) => handleRuaTableChange(row.id, "labEnd", e.target.value)} placeholder="Max" sx={{ "& .MuiInputBase-root": { fontSize: "14px" } }} />
                  </Box>
                  
                  {/* Status - Display as text */}
                  <Typography sx={{ fontSize: "14px", color: "#374151" }}>{rowData.findings || "-"}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
});

OtherMedicalsForm.displayName = "OtherMedicalsForm";

export default OtherMedicalsForm;
