// export type MedicalFinalConfigField = {
//   id: string | number;
//   section: string;
//   field: string;
// };

// export type OtherMedicalsFieldType = "text" | "number" | "date" | "dropdown";
// export type OtherMedicalsValidation = "alpha" | "numeric";

// export type OtherMedicalsFieldConfig = {
//   id: string;
//   label: string;
//   type: OtherMedicalsFieldType;
//   required: boolean;
//   editable: boolean;
//   masterKey?: "medical_type" | "gender" | "negative_positive_reactive";
//   validation?: OtherMedicalsValidation;
//   disableFutureDate?: boolean;
// };

// export type CBCTableRowConfig = {
//   id: string;
//   parameter: string;
//   required: boolean;
//   conditionalRequirement?: "differential_or_absolute";
// };

// export type LFTTableRowConfig = {
//   id: string;
//   parameter: string;
//   required: boolean;
// };

// export type LipidsTableRowConfig = {
//   id: string;
//   parameter: string;
//   required: boolean;
// };

// export type OGTTTableRowConfig = {
//   id: string;
//   parameter: string;
//   required: boolean;
// };

// export type SMA12TableRowConfig = {
//   id: string;
//   parameter: string;
//   required: boolean;
//   conditionalRequirement?: "fbs_or_rbs";
// };

// export type TFTTableRowConfig = {
//   id: string;
//   parameter: string;
//   required: boolean;
// };

// export type S13TableRowConfig = {
//   id: string;
//   parameter: string;
//   required: boolean;
//   conditionalRequirement?: "fbs_or_rbs";
// };

// export type RUATableRowConfig = {
//   id: string;
//   parameter: string;
//   required: boolean;
//   fieldType: "dropdown" | "text";
//   validation?: "numeric";
//   masterKey?: "rua_sugar_glycosuria" | "rua_albumin_proteinuria" | "rua_rbc_haematuria" | "rua_ketone_bodies" | "rua_urine_colour" | "rua_urine_appearance" | "negative_positive_reactive" | "rua_urobilinogen" | "rua_present_absent";
// };

// export const OTHER_MEDICALS_BLOOD_SUGAR_RANDOM_SECTION_LABEL = "Blood Sugar Random";
// export const OTHER_MEDICALS_CBC_GROUP_SECTION_LABEL = "CBC Group";
// export const OTHER_MEDICALS_COT_SECTION_LABEL = "COT";
// export const OTHER_MEDICALS_GHB_SECTION_LABEL = "GHB";
// export const OTHER_MEDICALS_HBA1C_SECTION_LABEL = "HBA1C";
// export const OTHER_MEDICALS_HBSAG_SECTION_LABEL = "HBSAG";
// export const OTHER_MEDICALS_HIV_ELISA_SECTION_LABEL = "HIV Elisa";
// export const OTHER_MEDICALS_LFT_SECTION_LABEL = "LFT";
// export const OTHER_MEDICALS_LIPIDS_SECTION_LABEL = "LIPIDS";
// export const OTHER_MEDICALS_OGTT_GROUP_SECTION_LABEL = "OGTT Group";
// export const OTHER_MEDICALS_PPBS_SECTION_LABEL = "PPBS";
// export const OTHER_MEDICALS_RUA_GROUP_SECTION_LABEL = "RUA Group";
// export const OTHER_MEDICALS_SERUM_COTININE_SECTION_LABEL = "SERUM COTININE";
// export const OTHER_MEDICALS_SMA12_GROUP_SECTION_LABEL = "SMA12 Group";
// export const OTHER_MEDICALS_TFT_GROUP_SECTION_LABEL = "TFT Group";
// export const OTHER_MEDICALS_FBS_SECTION_LABEL = "FBS";
// export const OTHER_MEDICALS_S13_GROUP_SECTION_LABEL = "S13 Group";
// export const OTHER_MEDICALS_HIV_WESTERN_BLOT_SECTION_LABEL = "HIV Western Blot";
// export const OTHER_MEDICALS_HCV_SECTION_LABEL = "HCV";
// export const OTHER_MEDICALS_MICROALBUMINURIA_SECTION_LABEL = "MICROALBUMINURIA";
// export const OTHER_MEDICALS_PSA_SECTION_LABEL = "PSA";

// export const BLOOD_SUGAR_RANDOM_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   {
//     id: "medicalType",
//     label: "Medical Type",
//     type: "dropdown",
//     required: false,
//     editable: true,
//     masterKey: "medical_type",
//   },
//   {
//     id: "date",
//     label: "Date",
//     type: "date",
//     required: false,
//     editable: true,
//     disableFutureDate: true,
//   },
//   {
//     id: "value",
//     label: "Value",
//     type: "text",
//     required: true,
//     editable: true,
//     validation: "numeric",
//   },
//   {
//     id: "findings",
//     label: "Findings",
//     type: "text",
//     required: false,
//     editable: false,
//   },
//   {
//     id: "examineeName",
//     label: "Examinee Name",
//     type: "text",
//     required: true,
//     editable: true,
//   },
//   {
//     id: "examineeAge",
//     label: "Examinee Age",
//     type: "text",
//     required: false,
//     editable: true,
//     validation: "numeric",
//   },
//   {
//     id: "examineeGender",
//     label: "Examinee Gender",
//     type: "dropdown",
//     required: false,
//     editable: true,
//     masterKey: "gender",
//   },
//   {
//     id: "diagnosticCentreName",
//     label: "Diagnostic Centre Name",
//     type: "text",
//     required: false,
//     editable: true,
//   },
//   {
//     id: "diagnosticCentreAddress",
//     label: "Diagnostic Centre Address",
//     type: "text",
//     required: false,
//     editable: true,
//   },
//   {
//     id: "diagnosticCentrePincode",
//     label: "Diagnostic Centre Pincode",
//     type: "text",
//     required: false,
//     editable: true,
//     validation: "numeric",
//   },
//   {
//     id: "doctorName",
//     label: "Doctor Name",
//     type: "text",
//     required: false,
//     editable: true,
//   },
//   {
//     id: "doctorRegistrationNo",
//     label: "Doctor Registration No",
//     type: "text",
//     required: false,
//     editable: true,
//   },
//   {
//     id: "labRangeValueStart",
//     label: "Lab Range Value (Start range)",
//     type: "text",
//     required: false,
//     editable: true,
//   },
//   {
//     id: "labRangeValueEnd",
//     label: "Lab Range Value (End range)",
//     type: "text",
//     required: false,
//     editable: true,
//   },
//   {
//     id: "unitsValue",
//     label: "Units Value",
//     type: "text",
//     required: false,
//     editable: true,
//   },
// ];

// export const COT_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "negative_positive_reactive" },
//   { id: "findings", label: "Findings", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
//   { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
//   { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
// ];
// export const CBC_GROUP_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
// ];

// export const CBC_TABLE_ROWS: CBCTableRowConfig[] = [
//   { id: "hemoglobin", parameter: "Hemoglobin(Hb)", required: true },
//   { id: "rbc", parameter: "RBC", required: true },
//   { id: "wbc", parameter: "WBC", required: true },
//   { id: "platelets", parameter: "Platelets", required: true },
//   { id: "pcv", parameter: "PCV", required: true },
//   { id: "mcv", parameter: "MCV", required: true },
//   { id: "differential_neutrophil", parameter: "Differential_Neutrophil", required: false, conditionalRequirement: "differential_or_absolute" },
//   { id: "differential_lymphocyte", parameter: "Differential_Lymphocyte", required: false, conditionalRequirement: "differential_or_absolute" },
//   { id: "differential_eosinophil", parameter: "Differential_Eosinophil", required: false, conditionalRequirement: "differential_or_absolute" },
//   { id: "differential_monocyte", parameter: "Differential_Monocyte", required: false, conditionalRequirement: "differential_or_absolute" },
//   { id: "differential_basophil", parameter: "Differential_Basophil", required: false, conditionalRequirement: "differential_or_absolute" },
//   { id: "esr", parameter: "Esr", required: true },
//   { id: "absolute_neutrophil", parameter: "Absolute_Neutrophil", required: false, conditionalRequirement: "differential_or_absolute" },
//   { id: "absolute_lymphocyte", parameter: "Absolute_Lymphocyte", required: false, conditionalRequirement: "differential_or_absolute" },
//   { id: "absolute_eosinophil", parameter: "Absolute_Eosinophil", required: false, conditionalRequirement: "differential_or_absolute" },
//   { id: "absolute_monocyte", parameter: "Absolute_Monocyte", required: false, conditionalRequirement: "differential_or_absolute" },
//   { id: "absolute_basophil", parameter: "Absolute_Basophil", required: false, conditionalRequirement: "differential_or_absolute" },
//   { id: "mpv", parameter: "MPV", required: false },
//   { id: "pdw", parameter: "PDW", required: false },
//   { id: "mch", parameter: "MCH", required: false },
//   { id: "mchc", parameter: "MCHC", required: false },
//   { id: "rdw", parameter: "RDW", required: false },
//   { id: "rbc_morphology", parameter: "RBC_Morphology", required: false },
//   { id: "wbc_morphology", parameter: "WBC_Morphology", required: false },
//   { id: "platelet_morphology", parameter: "Platelet_Morphology", required: false },
// ];

// export const GHB_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "value", label: "Value", type: "text", required: true, editable: true, validation: "numeric" },
//   { id: "findings", label: "Findings", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
//   { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
//   { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
// ];

// export const HBA1C_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "value", label: "Value", type: "text", required: true, editable: true, validation: "numeric" },
//   { id: "findings", label: "Findings", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
//   { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
//   { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
// ];

// export const HBSAG_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "negative_positive_reactive" },
//   { id: "findings", label: "Findings", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
//   { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
//   { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
// ];

// export const HIV_ELISA_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "negative_positive_reactive" },
//   { id: "findings", label: "Findings", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
//   { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
//   { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
// ];

// export const LFT_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
// ];

// export const LFT_TABLE_ROWS: LFTTableRowConfig[] = [
//   { id: "sgpt_alt", parameter: "SGPT/ALT", required: true },
//   { id: "sgot_ast", parameter: "SGOT/AST", required: true },
//   { id: "ggt", parameter: "GGT", required: true },
//   { id: "serum_bilirubin_total", parameter: "Serum Bilirubin-Total", required: true },
//   { id: "direct", parameter: "Direct", required: true },
//   { id: "indirect", parameter: "Indirect", required: true },
//   { id: "serum_protein_total", parameter: "Serum Protein- Total", required: true },
//   { id: "albumin", parameter: "Albumin", required: true },
//   { id: "globulin", parameter: "Globulin=(Total-Albumin)", required: true },
//   { id: "alkaline_phosphate", parameter: "Alkaline Phosphate", required: true },
//   { id: "albumin_globulin_ratio", parameter: "Albumin/Globulin_Ratio", required: true },
// ];

// export const LIPIDS_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
// ];

// export const LIPIDS_TABLE_ROWS: LipidsTableRowConfig[] = [
//   { id: "total_cholesterol_tc", parameter: "Total Cholesterol: TC", required: true },
//   { id: "triglycerides_tg", parameter: "Triglycerides: TG", required: true },
//   { id: "hdl", parameter: "HDL", required: true },
//   { id: "ldl", parameter: "LDL", required: true },
//   { id: "vldl", parameter: "VLDL", required: false },
//   { id: "tc_hdl_ratio", parameter: "TC/HDL Ratio", required: true },
// ];

// export const OGTT_GROUP_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
// ];

// export const OGTT_TABLE_ROWS: OGTTTableRowConfig[] = [
//   { id: "ogtt1", parameter: "OGTT1", required: true },
//   { id: "ogtt2", parameter: "OGTT2", required: true },
//   { id: "ogtt3", parameter: "OGTT3", required: true },
// ];

// export const PPBS_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "value", label: "Value", type: "text", required: true, editable: true, validation: "numeric" },
//   { id: "findings", label: "Findings", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
//   { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
//   { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
// ];

// export const RUA_GROUP_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
// ];

// export const RUA_TABLE_ROWS: RUATableRowConfig[] = [
//   { id: "sugar_glycosuria", parameter: "Sugar/Glycosuria", required: true, fieldType: "dropdown", masterKey: "rua_sugar_glycosuria" },
//   { id: "albumin_proteinuria", parameter: "Albumin/Proteinuria", required: true, fieldType: "dropdown", masterKey: "rua_albumin_proteinuria" },
//   { id: "rbc_haematuria", parameter: "RBC/Haematuria", required: true, fieldType: "dropdown", masterKey: "rua_rbc_haematuria" },
//   { id: "wbc_pus_pyuria", parameter: "WBC/PUS/Pyuria", required: true, fieldType: "text", validation: "numeric" },
//   { id: "epithelial_cells", parameter: "Epithelial Cells", required: true, fieldType: "text", validation: "numeric" },
//   { id: "gravity", parameter: "Gravity", required: true, fieldType: "text", validation: "numeric" },
//   { id: "ketone_bodies", parameter: "Ketone Bodies", required: true, fieldType: "dropdown", masterKey: "rua_ketone_bodies" },
//   { id: "urine_colour", parameter: "Urine Colour", required: false, fieldType: "dropdown", masterKey: "rua_urine_colour" },
//   { id: "urine_ph", parameter: "Urine PH", required: false, fieldType: "text", validation: "numeric" },
//   { id: "urine_quantity", parameter: "Urine Quantity", required: false, fieldType: "text", validation: "numeric" },
//   { id: "urine_appearance", parameter: "Urine Appearance", required: false, fieldType: "dropdown", masterKey: "rua_urine_appearance" },
//   { id: "urine_blood", parameter: "Urine Blood", required: false, fieldType: "dropdown", masterKey: "negative_positive_reactive" },
//   { id: "urine_nitrite", parameter: "Urine Nitrite", required: false, fieldType: "dropdown", masterKey: "negative_positive_reactive" },
//   { id: "urine_bile_salts", parameter: "Urine Bile Salts", required: false, fieldType: "dropdown", masterKey: "negative_positive_reactive" },
//   { id: "urine_bile_pigment", parameter: "Urine Bile Pigment", required: false, fieldType: "dropdown", masterKey: "negative_positive_reactive" },
//   { id: "urine_bilirubin", parameter: "Urine Bilirubin", required: false, fieldType: "dropdown", masterKey: "negative_positive_reactive" },
//   { id: "urine_urobilinogen", parameter: "Urine Urobilinogen", required: false, fieldType: "dropdown", masterKey: "rua_urobilinogen" },
//   { id: "urine_bacteria", parameter: "Urine Bacteria", required: false, fieldType: "dropdown", masterKey: "rua_present_absent" },
//   { id: "urine_casts", parameter: "Urine Casts", required: false, fieldType: "dropdown", masterKey: "rua_present_absent" },
//   { id: "urine_crystal", parameter: "Urine Crystal", required: false, fieldType: "dropdown", masterKey: "rua_present_absent" },
//   { id: "urine_deposit", parameter: "Urine Deposit", required: false, fieldType: "dropdown", masterKey: "rua_present_absent" }
// ];

// export const SERUM_COTININE_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "negative_positive_reactive" },
//   { id: "findings", label: "Findings", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
//   { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
//   { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
// ];

// export const SMA12_GROUP_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
// ];

// export const SMA12_TABLE_ROWS: SMA12TableRowConfig[] = [
//   { id: "sgpt_alt", parameter: "SGPT/ALT", required: true },
//   { id: "sgot_ast", parameter: "SGOT/AST", required: true },
//   { id: "ggt", parameter: "GGT", required: true },
//   { id: "serum_bilirubin_total", parameter: "Serum Bilirubin-Total", required: true },
//   { id: "direct", parameter: "Direct", required: true },
//   { id: "indirect", parameter: "Indirect=(Total-Direct)", required: true },
//   { id: "serum_protein_total", parameter: "Serum Protein-Total", required: true },
//   { id: "albumin", parameter: "Albumin", required: true },
//   { id: "globulin", parameter: "Globulin=(Total-Albumin)", required: true },
//   { id: "albumin_globulin_ratio", parameter: "Albumin/Globulin_Ratio", required: true },
//   { id: "alkaline_phosphate", parameter: "Alkaline Phosphate", required: true },
//   { id: "serum_creatinine", parameter: "Serum Creatinine", required: true },
//   { id: "serum_calcium", parameter: "Serum Calcium", required: false },
//   { id: "serum_uric_acid", parameter: "Serum Uric Acid", required: false },
//   { id: "rbs", parameter: "RBS", required: false, conditionalRequirement: "fbs_or_rbs" },
//   { id: "fbs", parameter: "FBS", required: false, conditionalRequirement: "fbs_or_rbs" },
//   { id: "total_cholesterol_tc", parameter: "Total Cholesterol: TC", required: true },
//   { id: "triglycerides_tg", parameter: "Triglycerides: TG", required: true },
//   { id: "hdl", parameter: "HDL", required: true },
//   { id: "ldl", parameter: "LDL", required: true },
//   { id: "vldl", parameter: "VLDL", required: false },
//   { id: "tc_hdl_ratio", parameter: "TC/HDL Ratio", required: true },
// ];

// export const TFT_GROUP_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
// ];

// export const TFT_TABLE_ROWS: TFTTableRowConfig[] = [
//   { id: "triiodothyronine_t3", parameter: "Triiodothyronine-T3", required: true },
//   { id: "thyroxin_t4", parameter: "Thyroxin-T4", required: true },
//   { id: "thyroid_stimulating_tsh", parameter: "Thyroid Stimulating - Tsh Harmones", required: true },
// ];

// export const FBS_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "negative_positive_reactive" },
//   { id: "findings", label: "Findings", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
//   { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
//   { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
// ];

// export const S13_GROUP_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
// ];

// export const S13_TABLE_ROWS: S13TableRowConfig[] = [
//   { id: "sgpt_alt", parameter: "SGPT/ALT", required: true },
//   { id: "sgot_ast", parameter: "SGOT/AST", required: true },
//   { id: "ggt", parameter: "GGT", required: true },
//   { id: "serum_bilirubin_total", parameter: "Serum Bilirubin-Total", required: true },
//   { id: "direct", parameter: "Direct", required: true },
//   { id: "indirect", parameter: "Indirect=(Total-Direct)", required: true },
//   { id: "serum_protein_total", parameter: "Serum Protein-Total", required: true },
//   { id: "albumin", parameter: "Albumin", required: true },
//   { id: "globulin", parameter: "Globulin=(Total-Albumin)", required: true },
//   { id: "albumin_globulin_ratio", parameter: "Albumin/Globulin_Ratio", required: true },
//   { id: "alkaline_phosphate", parameter: "Alkaline Phosphate", required: true },
//   { id: "serum_creatinine", parameter: "Serum Creatinine", required: true },
//   { id: "serum_calcium", parameter: "Serum Calcium", required: false },
//   { id: "serum_uric_acid", parameter: "Serum Uric Acid", required: false },
//   { id: "rbs", parameter: "RBS", required: false, conditionalRequirement: "fbs_or_rbs" },
//   { id: "fbs", parameter: "FBS", required: false, conditionalRequirement: "fbs_or_rbs" },
//   { id: "total_cholesterol_tc", parameter: "Total Cholesterol: TC", required: true },
//   { id: "triglycerides_tg", parameter: "Triglycerides: TG", required: true },
//   { id: "hdl", parameter: "HDL", required: true },
//   { id: "ldl", parameter: "LDL", required: true },
//   { id: "vldl", parameter: "VLDL", required: false },
//   { id: "tc_hdl_ratio", parameter: "TC/HDL Ratio", required: true },
// ];

// export const HIV_WESTERN_BLOT_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "negative_positive_reactive" },
//   { id: "findings", label: "Findings", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
//   { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
//   { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
// ];

// export const HCV_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "negative_positive_reactive" },
//   { id: "findings", label: "Findings", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
//   { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
//   { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
// ];

// export const MICROALBUMINURIA_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "findings", label: "Findings", type: "text", required: true, editable: true, validation: "numeric" },
//   { id: "result", label: "Result", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
//   { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
//   { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
// ];

// export const PSA_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "findings", label: "Findings", type: "text", required: true, editable: true, validation: "numeric" },
//   { id: "result", label: "Result", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
//   { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
//   { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
//   { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
// ];

// const normalizeSectionName = (section?: string) => (section ?? "").trim().toLowerCase();

// export const getOtherMedicalsSubSectionFormFields = (selectedSubSection?: string): OtherMedicalsFieldConfig[] => {
//   const normalized = normalizeSectionName(selectedSubSection);

//   if (normalized === normalizeSectionName(OTHER_MEDICALS_BLOOD_SUGAR_RANDOM_SECTION_LABEL)) {
//     return BLOOD_SUGAR_RANDOM_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_CBC_GROUP_SECTION_LABEL)) {
//     return CBC_GROUP_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_COT_SECTION_LABEL)) {
//     return COT_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_GHB_SECTION_LABEL)) {
//     return GHB_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_HBA1C_SECTION_LABEL)) {
//     return HBA1C_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_HBSAG_SECTION_LABEL)) {
//     return HBSAG_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_HIV_ELISA_SECTION_LABEL)) {
//     return HIV_ELISA_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_LFT_SECTION_LABEL)) {
//     return LFT_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_LIPIDS_SECTION_LABEL)) {
//     return LIPIDS_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_OGTT_GROUP_SECTION_LABEL)) {
//     return OGTT_GROUP_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_PPBS_SECTION_LABEL)) {
//     return PPBS_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_RUA_GROUP_SECTION_LABEL)) {
//     return RUA_GROUP_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_SERUM_COTININE_SECTION_LABEL)) {
//     return SERUM_COTININE_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_SMA12_GROUP_SECTION_LABEL)) {
//     return SMA12_GROUP_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_TFT_GROUP_SECTION_LABEL)) {
//     return TFT_GROUP_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_FBS_SECTION_LABEL)) {
//     return FBS_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_S13_GROUP_SECTION_LABEL)) {
//     return S13_GROUP_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_HIV_WESTERN_BLOT_SECTION_LABEL)) {
//     return HIV_WESTERN_BLOT_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_HCV_SECTION_LABEL)) {
//     return HCV_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_MICROALBUMINURIA_SECTION_LABEL)) {
//     return MICROALBUMINURIA_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(OTHER_MEDICALS_PSA_SECTION_LABEL)) {
//     return PSA_SUBSECTION_FORM_FIELDS;
//   }

//   return [];
// };

// export const getOtherMedicalsConfig = (): MedicalFinalConfigField[] => {
//   const bloodSugarRandomFields = BLOOD_SUGAR_RANDOM_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_BLOOD_SUGAR_RANDOM_SECTION_LABEL,
//     field: field.label,
//   }));

//   const cbcGroupFields = CBC_GROUP_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_CBC_GROUP_SECTION_LABEL,
//     field: field.label,
//   }));

//   const cotFields = COT_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_COT_SECTION_LABEL,
//     field: field.label,
//   }));

//   const ghbFields = GHB_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_GHB_SECTION_LABEL,
//     field: field.label,
//   }));

//   const hba1cFields = HBA1C_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_HBA1C_SECTION_LABEL,
//     field: field.label,
//   }));

//   const hbsagFields = HBSAG_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_HBSAG_SECTION_LABEL,
//     field: field.label,
//   }));

//   const hivElisaFields = HIV_ELISA_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_HIV_ELISA_SECTION_LABEL,
//     field: field.label,
//   }));

//   const lftFields = LFT_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_LFT_SECTION_LABEL,
//     field: field.label,
//   }));

//   const lipidsFields = LIPIDS_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_LIPIDS_SECTION_LABEL,
//     field: field.label,
//   }));

//   const ogttGroupFields = OGTT_GROUP_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_OGTT_GROUP_SECTION_LABEL,
//     field: field.label,
//   }));

//   const ppbsFields = PPBS_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_PPBS_SECTION_LABEL,
//     field: field.label,
//   }));

//   const ruaGroupFields = RUA_GROUP_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_RUA_GROUP_SECTION_LABEL,
//     field: field.label,
//   }));

//   const serumCotinineFields = SERUM_COTININE_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_SERUM_COTININE_SECTION_LABEL,
//     field: field.label,
//   }));

//   const sma12GroupFields = SMA12_GROUP_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_SMA12_GROUP_SECTION_LABEL,
//     field: field.label,
//   }));

//   const tftGroupFields = TFT_GROUP_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_TFT_GROUP_SECTION_LABEL,
//     field: field.label,
//   }));

//   const fbsFields = FBS_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_FBS_SECTION_LABEL,
//     field: field.label,
//   }));

//   const s13GroupFields = S13_GROUP_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_S13_GROUP_SECTION_LABEL,
//     field: field.label,
//   }));

//   const hivWesternBlotFields = HIV_WESTERN_BLOT_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_HIV_WESTERN_BLOT_SECTION_LABEL,
//     field: field.label,
//   }));

//   const hcvFields = HCV_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_HCV_SECTION_LABEL,
//     field: field.label,
//   }));

//   const microalbuminuriaFields = MICROALBUMINURIA_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_MICROALBUMINURIA_SECTION_LABEL,
//     field: field.label,
//   }));

//   const psaFields = PSA_SUBSECTION_FORM_FIELDS.map((field) => ({
//     id: field.id,
//     section: OTHER_MEDICALS_PSA_SECTION_LABEL,
//     field: field.label,
//   }));

//   return [
//     ...bloodSugarRandomFields,
//     ...cbcGroupFields,
//     ...cotFields,
//     ...ghbFields,
//     ...hba1cFields,
//     ...hbsagFields,
//     ...hivElisaFields,
//     ...lftFields,
//     ...lipidsFields,
//     ...ogttGroupFields,
//     ...ppbsFields,
//     ...ruaGroupFields,
//     ...serumCotinineFields,
//     ...sma12GroupFields,
//     ...tftGroupFields,
//     ...fbsFields,
//     ...s13GroupFields,
//     ...hivWesternBlotFields,
//     ...hcvFields,
//     ...microalbuminuriaFields,
//     ...psaFields,
//   ];
// };

export type MedicalFinalConfigField = {
  id: string | number;
  section: string;
  field: string;
};

export type OtherMedicalsFieldType = "text" | "number" | "date" | "dropdown";
export type OtherMedicalsValidation = "alpha" | "numeric";

export type OtherMedicalsMasterKey =
  | "MEDICAL_TYPE"
  | "gender"
  | "VALUE"
  | "SUGAR_GLYCOSURIA"
  | "ALBUMIN_PROTEINURIA"
  | "RBC_HAEMATURIA"
  | "KETONE_BODIES"
  | "URINE_COLOUR"
  | "URINE_APPEARANCE";

export type OtherMedicalsFieldConfig = {
  id: string;
  label: string;
  type: OtherMedicalsFieldType;
  required: boolean;
  editable: boolean;
  masterKey?: OtherMedicalsMasterKey;
  validation?: OtherMedicalsValidation;
  disableFutureDate?: boolean;
};

export type CBCTableRowConfig = {
  id: string;
  parameter: string;
  required: boolean;
  conditionalRequirement?: "differential_or_absolute";
};

export type LFTTableRowConfig = {
  id: string;
  parameter: string;
  required: boolean;
};

export type LipidsTableRowConfig = {
  id: string;
  parameter: string;
  required: boolean;
};

export type OGTTTableRowConfig = {
  id: string;
  parameter: string;
  required: boolean;
};

export type SMA12TableRowConfig = {
  id: string;
  parameter: string;
  required: boolean;
  conditionalRequirement?: "fbs_or_rbs";
};

export type TFTTableRowConfig = {
  id: string;
  parameter: string;
  required: boolean;
};

export type S13TableRowConfig = {
  id: string;
  parameter: string;
  required: boolean;
  conditionalRequirement?: "fbs_or_rbs";
};

export type RUATableRowConfig = {
  id: string;
  parameter: string;
  required: boolean;
  fieldType: "dropdown" | "text";
  validation?: "numeric";
  masterKey?: OtherMedicalsMasterKey;
};

export const OTHER_MEDICALS_BLOOD_SUGAR_RANDOM_SECTION_LABEL = "Blood Sugar Random";
export const OTHER_MEDICALS_CBC_GROUP_SECTION_LABEL = "CBC Group";
export const OTHER_MEDICALS_COT_SECTION_LABEL = "COT";
export const OTHER_MEDICALS_GHB_SECTION_LABEL = "GHB";
export const OTHER_MEDICALS_HBA1C_SECTION_LABEL = "HBA1C";
export const OTHER_MEDICALS_HBSAG_SECTION_LABEL = "HBSAG";
export const OTHER_MEDICALS_HIV_ELISA_SECTION_LABEL = "HIV Elisa";
export const OTHER_MEDICALS_LFT_SECTION_LABEL = "LFT";
export const OTHER_MEDICALS_LIPIDS_SECTION_LABEL = "LIPIDS";
export const OTHER_MEDICALS_OGTT_GROUP_SECTION_LABEL = "OGTT Group";
export const OTHER_MEDICALS_PPBS_SECTION_LABEL = "PPBS";
export const OTHER_MEDICALS_RUA_GROUP_SECTION_LABEL = "RUA Group";
export const OTHER_MEDICALS_SERUM_COTININE_SECTION_LABEL = "SERUM COTININE";
export const OTHER_MEDICALS_SMA12_GROUP_SECTION_LABEL = "SMA12 Group";
export const OTHER_MEDICALS_TFT_GROUP_SECTION_LABEL = "TFT Group";
export const OTHER_MEDICALS_FBS_SECTION_LABEL = "FBS";
export const OTHER_MEDICALS_S13_GROUP_SECTION_LABEL = "S13 Group";
export const OTHER_MEDICALS_HIV_WESTERN_BLOT_SECTION_LABEL = "HIV Western Blot";
export const OTHER_MEDICALS_HCV_SECTION_LABEL = "HCV";
export const OTHER_MEDICALS_MICROALBUMINURIA_SECTION_LABEL = "MICROALBUMINURIA";
export const OTHER_MEDICALS_PSA_SECTION_LABEL = "PSA";

export const BLOOD_SUGAR_RANDOM_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  {
    id: "medicalType",
    label: "Medical Type",
    type: "dropdown",
    required: false,
    editable: true,
    masterKey: "MEDICAL_TYPE",
  },
  {
    id: "date",
    label: "Date",
    type: "date",
    required: false,
    editable: true,
    disableFutureDate: true,
  },
  {
    id: "value",
    label: "Value",
    type: "text",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "findings",
    label: "Findings",
    type: "text",
    required: false,
    editable: false,
  },
  {
    id: "examineeName",
    label: "Examinee Name",
    type: "text",
    required: true,
    editable: true,
  },
  {
    id: "examineeAge",
    label: "Examinee Age",
    type: "text",
    required: false,
    editable: true,
    validation: "numeric",
  },
  {
    id: "examineeGender",
    label: "Examinee Gender",
    type: "dropdown",
    required: false,
    editable: true,
    masterKey: "gender",
  },
  {
    id: "diagnosticCentreName",
    label: "Diagnostic Centre Name",
    type: "text",
    required: false,
    editable: true,
  },
  {
    id: "diagnosticCentreAddress",
    label: "Diagnostic Centre Address",
    type: "text",
    required: false,
    editable: true,
  },
  {
    id: "diagnosticCentrePincode",
    label: "Diagnostic Centre Pincode",
    type: "text",
    required: false,
    editable: true,
    validation: "numeric",
  },
  {
    id: "doctorName",
    label: "Doctor Name",
    type: "text",
    required: false,
    editable: true,
  },
  {
    id: "doctorRegistrationNo",
    label: "Doctor Registration No",
    type: "text",
    required: false,
    editable: true,
  },
  {
    id: "labRangeValueStart",
    label: "Lab Range Value (Start range)",
    type: "text",
    required: false,
    editable: true,
  },
  {
    id: "labRangeValueEnd",
    label: "Lab Range Value (End range)",
    type: "text",
    required: false,
    editable: true,
  },
  {
    id: "unitsValue",
    label: "Units Value",
    type: "text",
    required: false,
    editable: true,
  },
];

export const COT_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "VALUE" },
  { id: "findings", label: "Findings", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true, validation: "numeric" },
];
export const CBC_GROUP_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
];

export const CBC_TABLE_ROWS: CBCTableRowConfig[] = [
  { id: "hemoglobin", parameter: "Hemoglobin(Hb)", required: true },
  { id: "rbc", parameter: "RBC", required: true },
  { id: "wbc", parameter: "WBC", required: true },
  { id: "platelets", parameter: "Platelets", required: true },
  { id: "pcv", parameter: "PCV", required: true },
  { id: "mcv", parameter: "MCV", required: true },
  { id: "differential_neutrophil", parameter: "Differential_Neutrophil", required: false, conditionalRequirement: "differential_or_absolute" },
  { id: "differential_lymphocyte", parameter: "Differential_Lymphocyte", required: false, conditionalRequirement: "differential_or_absolute" },
  { id: "differential_eosinophil", parameter: "Differential_Eosinophil", required: false, conditionalRequirement: "differential_or_absolute" },
  { id: "differential_monocyte", parameter: "Differential_Monocyte", required: false, conditionalRequirement: "differential_or_absolute" },
  { id: "differential_basophil", parameter: "Differential_Basophil", required: false, conditionalRequirement: "differential_or_absolute" },
  { id: "esr", parameter: "Esr", required: true },
  { id: "absolute_neutrophil", parameter: "Absolute_Neutrophil", required: false, conditionalRequirement: "differential_or_absolute" },
  { id: "absolute_lymphocyte", parameter: "Absolute_Lymphocyte", required: false, conditionalRequirement: "differential_or_absolute" },
  { id: "absolute_eosinophil", parameter: "Absolute_Eosinophil", required: false, conditionalRequirement: "differential_or_absolute" },
  { id: "absolute_monocyte", parameter: "Absolute_Monocyte", required: false, conditionalRequirement: "differential_or_absolute" },
  { id: "absolute_basophil", parameter: "Absolute_Basophil", required: false, conditionalRequirement: "differential_or_absolute" },
  { id: "mpv", parameter: "MPV", required: false },
  { id: "pdw", parameter: "PDW", required: false },
  { id: "mch", parameter: "MCH", required: false },
  { id: "mchc", parameter: "MCHC", required: false },
  { id: "rdw", parameter: "RDW", required: false },
  { id: "rbc_morphology", parameter: "RBC_Morphology", required: false },
  { id: "wbc_morphology", parameter: "WBC_Morphology", required: false },
  { id: "platelet_morphology", parameter: "Platelet_Morphology", required: false },
];

export const GHB_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "value", label: "Value", type: "text", required: true, editable: true, validation: "numeric" },
  { id: "findings", label: "Findings", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
  { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
  { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
];

export const HBA1C_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "value", label: "Value", type: "text", required: true, editable: true, validation: "numeric" },
  { id: "findings", label: "Findings", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
  { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
  { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
];

export const HBSAG_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "VALUE" },
  { id: "findings", label: "Findings", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true, validation: "numeric" },
];

export const HIV_ELISA_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "VALUE" },
  { id: "findings", label: "Findings", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true, validation: "numeric" },
];

export const LFT_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
];

export const LFT_TABLE_ROWS: LFTTableRowConfig[] = [
  { id: "sgpt_alt", parameter: "SGPT/ALT", required: true },
  { id: "sgot_ast", parameter: "SGOT/AST", required: true },
  { id: "ggt", parameter: "GGT", required: true },
  { id: "serum_bilirubin_total", parameter: "Serum Bilirubin-Total", required: true },
  { id: "direct", parameter: "Direct", required: true },
  { id: "indirect", parameter: "Indirect", required: true },
  { id: "serum_protein_total", parameter: "Serum Protein- Total", required: true },
  { id: "albumin", parameter: "Albumin", required: true },
  { id: "globulin", parameter: "Globulin=(Total-Albumin)", required: true },
  { id: "alkaline_phosphate", parameter: "Alkaline Phosphate", required: true },
  { id: "albumin_globulin_ratio", parameter: "Albumin/Globulin_Ratio", required: true },
];

export const LIPIDS_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
];

export const LIPIDS_TABLE_ROWS: LipidsTableRowConfig[] = [
  { id: "total_cholesterol_tc", parameter: "Total Cholesterol: TC", required: true },
  { id: "triglycerides_tg", parameter: "Triglycerides: TG", required: true },
  { id: "hdl", parameter: "HDL", required: true },
  { id: "ldl", parameter: "LDL", required: true },
  { id: "vldl", parameter: "VLDL", required: false },
  { id: "tc_hdl_ratio", parameter: "TC/HDL Ratio", required: true },
];

export const OGTT_GROUP_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
];

export const OGTT_TABLE_ROWS: OGTTTableRowConfig[] = [
  { id: "ogtt1", parameter: "OGTT1", required: true },
  { id: "ogtt2", parameter: "OGTT2", required: true },
  { id: "ogtt3", parameter: "OGTT3", required: true },
];

export const PPBS_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "value", label: "Value", type: "text", required: true, editable: true, validation: "numeric" },
  { id: "findings", label: "Findings", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
  { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
  { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
];

export const RUA_GROUP_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
];

export const RUA_TABLE_ROWS: RUATableRowConfig[] = [
  { id: "sugar_glycosuria", parameter: "Sugar/Glycosuria", required: true, fieldType: "dropdown", masterKey: "SUGAR_GLYCOSURIA" },
  { id: "albumin_proteinuria", parameter: "Albumin/Proteinuria", required: true, fieldType: "dropdown", masterKey: "ALBUMIN_PROTEINURIA" },
  { id: "rbc_haematuria", parameter: "RBC/Haematuria", required: true, fieldType: "dropdown", masterKey: "RBC_HAEMATURIA" },
  { id: "wbc_pus_pyuria", parameter: "WBC/PUS/Pyuria", required: true, fieldType: "text", validation: "numeric" },
  { id: "epithelial_cells", parameter: "Epithelial Cells", required: true, fieldType: "text", validation: "numeric" },
  { id: "gravity", parameter: "Gravity", required: true, fieldType: "text", validation: "numeric" },
  { id: "ketone_bodies", parameter: "Ketone Bodies", required: true, fieldType: "dropdown", masterKey: "KETONE_BODIES" },
  { id: "urine_colour", parameter: "Urine Colour", required: false, fieldType: "dropdown", masterKey: "URINE_COLOUR" },
  { id: "urine_ph", parameter: "Urine PH", required: false, fieldType: "text", validation: "numeric" },
  { id: "urine_quantity", parameter: "Urine Quantity", required: false, fieldType: "text", validation: "numeric" },
  { id: "urine_appearance", parameter: "Urine Appearance", required: false, fieldType: "dropdown", masterKey: "URINE_APPEARANCE" },
  { id: "urine_blood", parameter: "Urine Blood", required: false, fieldType: "dropdown", masterKey: "VALUE" },
  { id: "urine_nitrite", parameter: "Urine Nitrite", required: false, fieldType: "dropdown", masterKey: "VALUE" },
  { id: "urine_bile_salts", parameter: "Urine Bile Salts", required: false, fieldType: "dropdown", masterKey: "VALUE" },
  { id: "urine_bile_pigment", parameter: "Urine Bile Pigment", required: false, fieldType: "dropdown", masterKey: "VALUE" },
  { id: "urine_bilirubin", parameter: "Urine Bilirubin", required: false, fieldType: "dropdown", masterKey: "VALUE" },
  { id: "urine_urobilinogen", parameter: "Urine Urobilinogen", required: false, fieldType: "dropdown", masterKey: "KETONE_BODIES" },
  { id: "urine_bacteria", parameter: "Urine Bacteria", required: false, fieldType: "dropdown", masterKey: "KETONE_BODIES" },
  { id: "urine_casts", parameter: "Urine Casts", required: false, fieldType: "dropdown", masterKey: "KETONE_BODIES" },
  { id: "urine_crystal", parameter: "Urine Crystal", required: false, fieldType: "dropdown", masterKey: "KETONE_BODIES" },
  { id: "urine_deposit", parameter: "Urine Deposit", required: false, fieldType: "dropdown", masterKey: "KETONE_BODIES" }
];

export const SERUM_COTININE_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "VALUE" },
  { id: "findings", label: "Findings", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true, validation: "numeric" },
];

export const SMA12_GROUP_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
];

export const SMA12_TABLE_ROWS: SMA12TableRowConfig[] = [
  { id: "sgpt_alt", parameter: "SGPT/ALT", required: true },
  { id: "sgot_ast", parameter: "SGOT/AST", required: true },
  { id: "ggt", parameter: "GGT", required: true },
  { id: "serum_bilirubin_total", parameter: "Serum Bilirubin-Total", required: true },
  { id: "direct", parameter: "Direct", required: true },
  { id: "indirect", parameter: "Indirect=(Total-Direct)", required: true },
  { id: "serum_protein_total", parameter: "Serum Protein-Total", required: true },
  { id: "albumin", parameter: "Albumin", required: true },
  { id: "globulin", parameter: "Globulin=(Total-Albumin)", required: true },
  { id: "albumin_globulin_ratio", parameter: "Albumin/Globulin_Ratio", required: true },
  { id: "alkaline_phosphate", parameter: "Alkaline Phosphate", required: true },
  { id: "serum_creatinine", parameter: "Serum Creatinine", required: true },
  { id: "serum_calcium", parameter: "Serum Calcium", required: false },
  { id: "serum_uric_acid", parameter: "Serum Uric Acid", required: false },
  { id: "rbs", parameter: "RBS", required: false, conditionalRequirement: "fbs_or_rbs" },
  { id: "fbs", parameter: "FBS", required: false, conditionalRequirement: "fbs_or_rbs" },
  { id: "total_cholesterol_tc", parameter: "Total Cholesterol: TC", required: true },
  { id: "triglycerides_tg", parameter: "Triglycerides: TG", required: true },
  { id: "hdl", parameter: "HDL", required: true },
  { id: "ldl", parameter: "LDL", required: true },
  { id: "vldl", parameter: "VLDL", required: false },
  { id: "tc_hdl_ratio", parameter: "TC/HDL Ratio", required: true },
];

export const TFT_GROUP_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
];

export const TFT_TABLE_ROWS: TFTTableRowConfig[] = [
  { id: "triiodothyronine_t3", parameter: "Triiodothyronine-T3", required: true },
  { id: "thyroxin_t4", parameter: "Thyroxin-T4", required: true },
  { id: "thyroid_stimulating_tsh", parameter: "Thyroid Stimulating - Tsh Harmones", required: true },
];

export const FBS_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "value", label: "Value", type: "text", required: true, editable: true, validation: "numeric" },
  { id: "findings", label: "Findings", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
  { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
  { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
];

export const S13_GROUP_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
];

export const S13_TABLE_ROWS: S13TableRowConfig[] = [
  { id: "sgpt_alt", parameter: "SGPT/ALT", required: true },
  { id: "sgot_ast", parameter: "SGOT/AST", required: true },
  { id: "ggt", parameter: "GGT", required: true },
  { id: "serum_bilirubin_total", parameter: "Serum Bilirubin-Total", required: true },
  { id: "direct", parameter: "Direct", required: true },
  { id: "indirect", parameter: "Indirect=(Total-Direct)", required: true },
  { id: "serum_protein_total", parameter: "Serum Protein-Total", required: true },
  { id: "albumin", parameter: "Albumin", required: true },
  { id: "globulin", parameter: "Globulin=(Total-Albumin)", required: true },
  { id: "albumin_globulin_ratio", parameter: "Albumin/Globulin_Ratio", required: true },
  { id: "alkaline_phosphate", parameter: "Alkaline Phosphate", required: true },
  { id: "serum_creatinine", parameter: "Serum Creatinine", required: true },
  { id: "serum_calcium", parameter: "Serum Calcium", required: false },
  { id: "serum_uric_acid", parameter: "Serum Uric Acid", required: false },
  { id: "rbs", parameter: "RBS", required: false, conditionalRequirement: "fbs_or_rbs" },
  { id: "fbs", parameter: "FBS", required: false, conditionalRequirement: "fbs_or_rbs" },
  { id: "total_cholesterol_tc", parameter: "Total Cholesterol: TC", required: true },
  { id: "triglycerides_tg", parameter: "Triglycerides: TG", required: true },
  { id: "hdl", parameter: "HDL", required: true },
  { id: "ldl", parameter: "LDL", required: true },
  { id: "vldl", parameter: "VLDL", required: false },
  { id: "tc_hdl_ratio", parameter: "TC/HDL Ratio", required: true },
];

export const HIV_WESTERN_BLOT_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "VALUE" },
  { id: "findings", label: "Findings", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true, validation: "numeric" },
];

export const HCV_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "value", label: "Value", type: "dropdown", required: true, editable: true, masterKey: "VALUE" },
  { id: "findings", label: "Findings", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true, validation: "numeric" },
];

export const MICROALBUMINURIA_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "findings", label: "Findings", type: "text", required: true, editable: true, validation: "numeric" },
  { id: "result", label: "Result", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
  { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
  { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
];

export const PSA_SUBSECTION_FORM_FIELDS: OtherMedicalsFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "findings", label: "Findings", type: "text", required: true, editable: true, validation: "numeric" },
  { id: "result", label: "Result", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: true, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "examineeGender", label: "Examinee Gender", type: "dropdown", required: false, editable: true, masterKey: "gender" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "labRangeValueStart", label: "Lab Range Value (Start range)", type: "text", required: false, editable: true },
  { id: "labRangeValueEnd", label: "Lab Range Value (End range)", type: "text", required: false, editable: true },
  { id: "unitsValue", label: "Units Value", type: "text", required: false, editable: true },
];

const normalizeSectionName = (section?: string) => (section ?? "").trim().toLowerCase();

export const getOtherMedicalsSubSectionFormFields = (selectedSubSection?: string): OtherMedicalsFieldConfig[] => {
  const normalized = normalizeSectionName(selectedSubSection);

  if (normalized === normalizeSectionName(OTHER_MEDICALS_BLOOD_SUGAR_RANDOM_SECTION_LABEL)) {
    return BLOOD_SUGAR_RANDOM_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_CBC_GROUP_SECTION_LABEL)) {
    return CBC_GROUP_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_COT_SECTION_LABEL)) {
    return COT_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_GHB_SECTION_LABEL)) {
    return GHB_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_HBA1C_SECTION_LABEL)) {
    return HBA1C_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_HBSAG_SECTION_LABEL)) {
    return HBSAG_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_HIV_ELISA_SECTION_LABEL)) {
    return HIV_ELISA_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_LFT_SECTION_LABEL)) {
    return LFT_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_LIPIDS_SECTION_LABEL)) {
    return LIPIDS_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_OGTT_GROUP_SECTION_LABEL)) {
    return OGTT_GROUP_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_PPBS_SECTION_LABEL)) {
    return PPBS_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_RUA_GROUP_SECTION_LABEL)) {
    return RUA_GROUP_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_SERUM_COTININE_SECTION_LABEL)) {
    return SERUM_COTININE_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_SMA12_GROUP_SECTION_LABEL)) {
    return SMA12_GROUP_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_TFT_GROUP_SECTION_LABEL)) {
    return TFT_GROUP_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_FBS_SECTION_LABEL)) {
    return FBS_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_S13_GROUP_SECTION_LABEL)) {
    return S13_GROUP_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_HIV_WESTERN_BLOT_SECTION_LABEL)) {
    return HIV_WESTERN_BLOT_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_HCV_SECTION_LABEL)) {
    return HCV_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_MICROALBUMINURIA_SECTION_LABEL)) {
    return MICROALBUMINURIA_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(OTHER_MEDICALS_PSA_SECTION_LABEL)) {
    return PSA_SUBSECTION_FORM_FIELDS;
  }

  return [];
};

export const getOtherMedicalsConfig = (): MedicalFinalConfigField[] => {
  const bloodSugarRandomFields = BLOOD_SUGAR_RANDOM_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_BLOOD_SUGAR_RANDOM_SECTION_LABEL,
    field: field.label,
  }));

  const cbcGroupFields = CBC_GROUP_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_CBC_GROUP_SECTION_LABEL,
    field: field.label,
  }));

  const cotFields = COT_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_COT_SECTION_LABEL,
    field: field.label,
  }));

  const ghbFields = GHB_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_GHB_SECTION_LABEL,
    field: field.label,
  }));

  const hba1cFields = HBA1C_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_HBA1C_SECTION_LABEL,
    field: field.label,
  }));

  const hbsagFields = HBSAG_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_HBSAG_SECTION_LABEL,
    field: field.label,
  }));

  const hivElisaFields = HIV_ELISA_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_HIV_ELISA_SECTION_LABEL,
    field: field.label,
  }));

  const lftFields = LFT_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_LFT_SECTION_LABEL,
    field: field.label,
  }));

  const lipidsFields = LIPIDS_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_LIPIDS_SECTION_LABEL,
    field: field.label,
  }));

  const ogttGroupFields = OGTT_GROUP_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_OGTT_GROUP_SECTION_LABEL,
    field: field.label,
  }));

  const ppbsFields = PPBS_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_PPBS_SECTION_LABEL,
    field: field.label,
  }));

  const ruaGroupFields = RUA_GROUP_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_RUA_GROUP_SECTION_LABEL,
    field: field.label,
  }));

  const serumCotinineFields = SERUM_COTININE_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_SERUM_COTININE_SECTION_LABEL,
    field: field.label,
  }));

  const sma12GroupFields = SMA12_GROUP_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_SMA12_GROUP_SECTION_LABEL,
    field: field.label,
  }));

  const tftGroupFields = TFT_GROUP_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_TFT_GROUP_SECTION_LABEL,
    field: field.label,
  }));

  const fbsFields = FBS_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_FBS_SECTION_LABEL,
    field: field.label,
  }));

  const s13GroupFields = S13_GROUP_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_S13_GROUP_SECTION_LABEL,
    field: field.label,
  }));

  const hivWesternBlotFields = HIV_WESTERN_BLOT_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_HIV_WESTERN_BLOT_SECTION_LABEL,
    field: field.label,
  }));

  const hcvFields = HCV_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_HCV_SECTION_LABEL,
    field: field.label,
  }));

  const microalbuminuriaFields = MICROALBUMINURIA_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_MICROALBUMINURIA_SECTION_LABEL,
    field: field.label,
  }));

  const psaFields = PSA_SUBSECTION_FORM_FIELDS.map((field) => ({
    id: field.id,
    section: OTHER_MEDICALS_PSA_SECTION_LABEL,
    field: field.label,
  }));

  return [
    ...bloodSugarRandomFields,
    ...cbcGroupFields,
    ...cotFields,
    ...ghbFields,
    ...hba1cFields,
    ...hbsagFields,
    ...hivElisaFields,
    ...lftFields,
    ...lipidsFields,
    ...ogttGroupFields,
    ...ppbsFields,
    ...ruaGroupFields,
    ...serumCotinineFields,
    ...sma12GroupFields,
    ...tftGroupFields,
    ...fbsFields,
    ...s13GroupFields,
    ...hivWesternBlotFields,
    ...hcvFields,
    ...microalbuminuriaFields,
    ...psaFields,
  ];
};
