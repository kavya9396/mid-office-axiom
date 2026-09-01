// export type MedicalFinalConfigField = {
//   id: string | number;
//   section: string;
//   field: string;
// };

// export type SpecialMedicalFieldType = "text" | "number" | "date" | "dropdown";
// export type SpecialMedicalValidation = "alpha" | "numeric";

// export type SpecialMedicalFieldConfig = {
//   id: string;
//   label: string;
//   type: SpecialMedicalFieldType;
//   required: boolean;
//   editable: boolean;
//   masterKey?: 
//     | "medical_type" 
//     | "special_medical_findings" 
//     | "rejection_abnormality"
//     | "abnormal_normal_findings"
//     | "ecg_axis"
//     | "tmt_findings"
//     | "tmt_mets";
//   validation?: SpecialMedicalValidation;
//   disableFutureDate?: boolean;
// };

// export const SPECIAL_MEDICAL_2DECHO_SECTION_LABEL = "2DECHO";
// export const SPECIAL_MEDICAL_BLOOD_UREA_SECTION_LABEL = "BLOOD UREA and NITRO";
// export const SPECIAL_MEDICAL_CXR_SECTION_LABEL = "CXR";
// export const SPECIAL_MEDICAL_DOBUTAMINE_SECTION_LABEL = "DOBUTAMINE STRESS ECHOCARDIOGRAM";
// export const SPECIAL_MEDICAL_EXERCISE_SECTION_LABEL = "EXERCISE STRESS ECHOCARDIOGRAM";
// export const SPECIAL_MEDICAL_ECG_SECTION_LABEL = "ECG";
// export const SPECIAL_MEDICAL_MAMMOGRAM_SECTION_LABEL = "MAMMOGRAM";
// export const SPECIAL_MEDICAL_PAP_SMEAR_SECTION_LABEL = "PAP SMEAR";
// export const SPECIAL_MEDICAL_PFT_SECTION_LABEL = "PFT";
// export const SPECIAL_MEDICAL_STOOL_TEST_SECTION_LABEL = "STOOL TEST";
// export const SPECIAL_MEDICAL_TMT_SECTION_LABEL = "TMT";
// export const SPECIAL_MEDICAL_USG_SECTION_LABEL = "USG";
// export const SPECIAL_MEDICAL_FUNDOSCOPY_SECTION_LABEL = "Fundoscopy Test";

// export const SPECIAL_MEDICAL_2DECHO_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   {
//     id: "medicalType",
//     label: "Medical Type",
//     type: "dropdown",
//     required: false,
//     editable: true,
//     masterKey: "medical_type",
//   },
//   {
//     id: "testDate",
//     label: "Test Date",
//     type: "date",
//     required: false,
//     editable: true,
//     disableFutureDate: true,
//   },
//   {
//     id: "findings",
//     label: "Findings",
//     type: "dropdown",
//     required: true,
//     editable: true,
//     masterKey: "special_medical_findings",
//   },
//   {
//     id: "ejectionFraction",
//     label: "Ejection Fraction",
//     type: "number",
//     required: true,
//     editable: true,
//     validation: "numeric",
//   },
//   {
//     id: "ejectionResult",
//     label: "Ejection Result",
//     type: "text",
//     required: false,
//     editable: false,
//   },
//   {
//     id: "rejectionAbnormality",
//     label: "Rejection Abnormality",
//     type: "dropdown",
//     required: true,
//     editable: true,
//     masterKey: "rejection_abnormality",
//   },
//   {
//     id: "examineeName",
//     label: "Examinee Name",
//     type: "text",
//     required: false,
//     editable: true,
//   },
//   {
//     id: "examineeAge",
//     label: "Examinee Age",
//     type: "number",
//     required: false,
//     editable: true,
//     validation: "numeric",
//   },
//   {
//     id: "diagnosticCentreName",
//     label: "Diagnostic Centre Name",
//     type: "text",
//     required: false,
//     editable: true,
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
//     id: "remarks",
//     label: "Remarks",
//     type: "text",
//     required: false,
//     editable: true,
//   },
// ];

// export const SPECIAL_MEDICAL_BLOOD_UREA_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   {
//     id: "medicalType",
//     label: "Medical Type",
//     type: "dropdown",
//     required: false,
//     editable: true,
//     masterKey: "medical_type",
//   },
//   {
//     id: "testDate",
//     label: "Test Date",
//     type: "date",
//     required: false,
//     editable: true,
//     disableFutureDate: true,
//   },
//   {
//     id: "bloodUrea",
//     label: "Blood Urea",
//     type: "number",
//     required: true,
//     editable: true,
//     validation: "numeric",
//   },
//   {
//     id: "bun",
//     label: "BUN",
//     type: "number",
//     required: true,
//     editable: true,
//     validation: "numeric",
//   },
//   {
//     id: "result",
//     label: "Result",
//     type: "text",
//     required: false,
//     editable: false,
//   },
//   {
//     id: "examineeName",
//     label: "Examinee Name",
//     type: "text",
//     required: false,
//     editable: true,
//   },
//   {
//     id: "examineeAge",
//     label: "Examinee Age",
//     type: "number",
//     required: false,
//     editable: true,
//     validation: "numeric",
//   },
//   {
//     id: "diagnosticCentreName",
//     label: "Diagnostic Centre Name",
//     type: "text",
//     required: false,
//     editable: true,
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
//     id: "remark",
//     label: "Remark",
//     type: "text",
//     required: false,
//     editable: true,
//   },
// ];

// export const SPECIAL_MEDICAL_CXR_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "abnormal_normal_findings" },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "remark", label: "Remark", type: "text", required: false, editable: true },
// ];

// export const SPECIAL_MEDICAL_DOBUTAMINE_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "special_medical_findings" },
//   { id: "ejectionFraction", label: "Ejection Fraction", type: "number", required: true, editable: true, validation: "numeric" },
//   { id: "ejectionResult", label: "Ejection Result", type: "text", required: false, editable: false },
//   { id: "rejectionAbnormality", label: "Rejection Abnormality", type: "dropdown", required: true, editable: true, masterKey: "rejection_abnormality" },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "remark", label: "Remark", type: "text", required: false, editable: true },
// ];

// export const SPECIAL_MEDICAL_EXERCISE_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "special_medical_findings" },
//   { id: "ejectionFraction", label: "Ejection Fraction", type: "number", required: true, editable: true, validation: "numeric" },
//   { id: "ejectionResult", label: "Ejection Result", type: "text", required: false, editable: false },
//   { id: "rejectionAbnormality", label: "Rejection Abnormality", type: "dropdown", required: true, editable: true, masterKey: "rejection_abnormality" },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "remark", label: "Remark", type: "text", required: false, editable: true },
// ];

// export const SPECIAL_MEDICAL_ECG_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "special_medical_findings" },
//   { id: "axis", label: "Axis", type: "dropdown", required: false, editable: true, masterKey: "ecg_axis" },
//   { id: "heartRate", label: "Heart Rate", type: "number", required: true, editable: true, validation: "numeric" },
//   { id: "heartRateFinding", label: "Heart Rate Finding", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "remark", label: "Remark", type: "text", required: false, editable: true },
// ];

// export const SPECIAL_MEDICAL_MAMMOGRAM_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "abnormal_normal_findings" },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "remark", label: "Remark", type: "text", required: false, editable: true },
// ];

// export const SPECIAL_MEDICAL_PAP_SMEAR_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "abnormal_normal_findings" },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "remarks", label: "Remarks", type: "text", required: false, editable: true },
// ];

// export const SPECIAL_MEDICAL_PFT_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "inspiration", label: "Inspiration", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "expiration", label: "Expiration", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "fev1", label: "FEV1", type: "number", required: true, editable: true, validation: "numeric" },
//   { id: "fvc", label: "FVC", type: "number", required: true, editable: true, validation: "numeric" },
//   { id: "fev1Fvc", label: "FEV1/FVC", type: "number", required: true, editable: true, validation: "numeric" },
//   { id: "rv", label: "RV", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "vc", label: "VC", type: "number", required: false, editable: true, validation: "numeric" },
// ];

// export const SPECIAL_MEDICAL_STOOL_TEST_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "abnormal_normal_findings" },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "remarks", label: "Remarks", type: "text", required: false, editable: true },
// ];

// export const SPECIAL_MEDICAL_TMT_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "tmt_findings" },
//   { id: "mets", label: "METS", type: "dropdown", required: true, editable: true, masterKey: "tmt_mets" },
//   { id: "heartRateFinding", label: "Heart Rate Finding", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "heartRateResult", label: "Heart Rate Result", type: "text", required: false, editable: false },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "remarks", label: "Remarks", type: "text", required: false, editable: true },
// ];

// export const SPECIAL_MEDICAL_USG_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "abnormal_normal_findings" },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "remarks", label: "Remarks", type: "text", required: false, editable: true },
// ];

// export const SPECIAL_MEDICAL_FUNDOSCOPY_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
//   { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "medical_type" },
//   { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
//   { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "abnormal_normal_findings" },
//   { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
//   { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
//   { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
//   { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
//   { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
//   { id: "remarks", label: "Remarks", type: "text", required: false, editable: true },
// ];

// const normalizeSectionName = (section?: string) => (section ?? "").trim().toLowerCase();

// export const getSpecialMedicalSubSectionFormFields = (selectedSubSection?: string): SpecialMedicalFieldConfig[] => {
//   const normalized = normalizeSectionName(selectedSubSection);

//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_2DECHO_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_2DECHO_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_BLOOD_UREA_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_BLOOD_UREA_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_CXR_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_CXR_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_DOBUTAMINE_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_DOBUTAMINE_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_EXERCISE_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_EXERCISE_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_ECG_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_ECG_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_MAMMOGRAM_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_MAMMOGRAM_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_PAP_SMEAR_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_PAP_SMEAR_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_PFT_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_PFT_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_STOOL_TEST_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_STOOL_TEST_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_TMT_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_TMT_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_USG_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_USG_SUBSECTION_FORM_FIELDS;
//   }
//   if (normalized === normalizeSectionName(SPECIAL_MEDICAL_FUNDOSCOPY_SECTION_LABEL)) {
//     return SPECIAL_MEDICAL_FUNDOSCOPY_SUBSECTION_FORM_FIELDS;
//   }

//   return [];
// };

// export const getSpecialMedicalConfig = (): MedicalFinalConfigField[] => {
//   const allSubsections = [
//     { label: SPECIAL_MEDICAL_2DECHO_SECTION_LABEL, fields: SPECIAL_MEDICAL_2DECHO_SUBSECTION_FORM_FIELDS },
//     { label: SPECIAL_MEDICAL_BLOOD_UREA_SECTION_LABEL, fields: SPECIAL_MEDICAL_BLOOD_UREA_SUBSECTION_FORM_FIELDS },
//     { label: SPECIAL_MEDICAL_CXR_SECTION_LABEL, fields: SPECIAL_MEDICAL_CXR_SUBSECTION_FORM_FIELDS },
//     { label: SPECIAL_MEDICAL_DOBUTAMINE_SECTION_LABEL, fields: SPECIAL_MEDICAL_DOBUTAMINE_SUBSECTION_FORM_FIELDS },
//     { label: SPECIAL_MEDICAL_EXERCISE_SECTION_LABEL, fields: SPECIAL_MEDICAL_EXERCISE_SUBSECTION_FORM_FIELDS },
//     { label: SPECIAL_MEDICAL_ECG_SECTION_LABEL, fields: SPECIAL_MEDICAL_ECG_SUBSECTION_FORM_FIELDS },
//     { label: SPECIAL_MEDICAL_MAMMOGRAM_SECTION_LABEL, fields: SPECIAL_MEDICAL_MAMMOGRAM_SUBSECTION_FORM_FIELDS },
//     { label: SPECIAL_MEDICAL_PAP_SMEAR_SECTION_LABEL, fields: SPECIAL_MEDICAL_PAP_SMEAR_SUBSECTION_FORM_FIELDS },
//     { label: SPECIAL_MEDICAL_PFT_SECTION_LABEL, fields: SPECIAL_MEDICAL_PFT_SUBSECTION_FORM_FIELDS },
//     { label: SPECIAL_MEDICAL_STOOL_TEST_SECTION_LABEL, fields: SPECIAL_MEDICAL_STOOL_TEST_SUBSECTION_FORM_FIELDS },
//     { label: SPECIAL_MEDICAL_TMT_SECTION_LABEL, fields: SPECIAL_MEDICAL_TMT_SUBSECTION_FORM_FIELDS },
//     { label: SPECIAL_MEDICAL_USG_SECTION_LABEL, fields: SPECIAL_MEDICAL_USG_SUBSECTION_FORM_FIELDS },
//     { label: SPECIAL_MEDICAL_FUNDOSCOPY_SECTION_LABEL, fields: SPECIAL_MEDICAL_FUNDOSCOPY_SUBSECTION_FORM_FIELDS },
//   ];

//   return allSubsections.flatMap((subsection) =>
//     subsection.fields.map((field) => ({
//       id: field.id,
//       section: subsection.label,
//       field: field.label,
//     }))
//   );
// };


export type MedicalFinalConfigField = {
  id: string | number;
  section: string;
  field: string;
};

export type SpecialMedicalFieldType = "text" | "number" | "date" | "dropdown";
export type SpecialMedicalValidation = "alpha" | "numeric";

export type SpecialMedicalMasterKey =
  | "MEDICAL_TYPE"
  | "FINDINGS"
  | "SM_FINDINGS"
  | "AXIS"
  | "FINDINGS_RESULT"
  | "METS";

export type SpecialMedicalFieldConfig = {
  id: string;
  label: string;
  type: SpecialMedicalFieldType;
  required: boolean;
  editable: boolean;
  masterKey?: SpecialMedicalMasterKey;
  validation?: SpecialMedicalValidation;
  disableFutureDate?: boolean;
};

export const SPECIAL_MEDICAL_2DECHO_SECTION_LABEL = "2DECHO";
export const SPECIAL_MEDICAL_BLOOD_UREA_SECTION_LABEL = "BLOOD UREA and NITRO";
export const SPECIAL_MEDICAL_CXR_SECTION_LABEL = "CXR";
export const SPECIAL_MEDICAL_DOBUTAMINE_SECTION_LABEL = "DOBUTAMINE STRESS ECHOCARDIOGRAM";
export const SPECIAL_MEDICAL_EXERCISE_SECTION_LABEL = "EXERCISE STRESS ECHOCARDIOGRAM";
export const SPECIAL_MEDICAL_ECG_SECTION_LABEL = "ECG";
export const SPECIAL_MEDICAL_MAMMOGRAM_SECTION_LABEL = "MAMMOGRAM";
export const SPECIAL_MEDICAL_PAP_SMEAR_SECTION_LABEL = "PAP SMEAR";
export const SPECIAL_MEDICAL_PFT_SECTION_LABEL = "PFT";
export const SPECIAL_MEDICAL_STOOL_TEST_SECTION_LABEL = "STOOL TEST";
export const SPECIAL_MEDICAL_TMT_SECTION_LABEL = "TMT";
export const SPECIAL_MEDICAL_USG_SECTION_LABEL = "USG";
export const SPECIAL_MEDICAL_FUNDOSCOPY_SECTION_LABEL = "Fundoscopy Test";

export const SPECIAL_MEDICAL_2DECHO_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  {
    id: "medicalType",
    label: "Medical Type",
    type: "dropdown",
    required: false,
    editable: true,
    masterKey: "MEDICAL_TYPE",
  },
  {
    id: "testDate",
    label: "Test Date",
    type: "date",
    required: false,
    editable: true,
    disableFutureDate: true,
  },
  {
    id: "findings",
    label: "Findings",
    type: "dropdown",
    required: true,
    editable: true,
    masterKey: "FINDINGS",
  },
  {
    id: "ejectionFraction",
    label: "Ejection Fraction",
    type: "number",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "ejectionResult",
    label: "Ejection Result",
    type: "text",
    required: false,
    editable: false,
  },
  {
    id: "rejectionAbnormality",
    label: "Rejection Abnormality",
    type: "dropdown",
    required: true,
    editable: true,
    masterKey: "SM_FINDINGS",
  },
  {
    id: "examineeName",
    label: "Examinee Name",
    type: "text",
    required: false,
    editable: true,
  },
  {
    id: "examineeAge",
    label: "Examinee Age",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
  },
  {
    id: "diagnosticCentreName",
    label: "Diagnostic Centre Name",
    type: "text",
    required: false,
    editable: true,
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
    id: "remarks",
    label: "Remarks",
    type: "text",
    required: false,
    editable: true,
  },
];

export const SPECIAL_MEDICAL_BLOOD_UREA_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  {
    id: "medicalType",
    label: "Medical Type",
    type: "dropdown",
    required: false,
    editable: true,
    masterKey: "MEDICAL_TYPE",
  },
  {
    id: "testDate",
    label: "Test Date",
    type: "date",
    required: false,
    editable: true,
    disableFutureDate: true,
  },
  {
    id: "bloodUrea",
    label: "Blood Urea",
    type: "number",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "bun",
    label: "BUN",
    type: "number",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "result",
    label: "Result",
    type: "text",
    required: false,
    editable: false,
  },
  {
    id: "examineeName",
    label: "Examinee Name",
    type: "text",
    required: false,
    editable: true,
  },
  {
    id: "examineeAge",
    label: "Examinee Age",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
  },
  {
    id: "diagnosticCentreName",
    label: "Diagnostic Centre Name",
    type: "text",
    required: false,
    editable: true,
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
    id: "remark",
    label: "Remark",
    type: "text",
    required: false,
    editable: true,
  },
];

export const SPECIAL_MEDICAL_CXR_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "SM_FINDINGS" },
  { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "remark", label: "Remark", type: "text", required: false, editable: true },
];

export const SPECIAL_MEDICAL_DOBUTAMINE_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "FINDINGS" },
  { id: "ejectionFraction", label: "Ejection Fraction", type: "number", required: true, editable: true, validation: "numeric" },
  { id: "ejectionResult", label: "Ejection Result", type: "text", required: false, editable: false },
  { id: "rejectionAbnormality", label: "Rejection Abnormality", type: "dropdown", required: true, editable: true, masterKey: "SM_FINDINGS" },
  { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "remark", label: "Remark", type: "text", required: false, editable: true },
];

export const SPECIAL_MEDICAL_EXERCISE_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "FINDINGS" },
  { id: "ejectionFraction", label: "Ejection Fraction", type: "number", required: true, editable: true, validation: "numeric" },
  { id: "ejectionResult", label: "Ejection Result", type: "text", required: false, editable: false },
  { id: "rejectionAbnormality", label: "Rejection Abnormality", type: "dropdown", required: true, editable: true, masterKey: "SM_FINDINGS" },
  { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "remark", label: "Remark", type: "text", required: false, editable: true },
];

export const SPECIAL_MEDICAL_ECG_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "FINDINGS" },
  { id: "axis", label: "Axis", type: "dropdown", required: false, editable: true, masterKey: "AXIS" },
  { id: "heartRate", label: "Heart Rate", type: "number", required: true, editable: true, validation: "numeric" },
  { id: "heartRateFinding", label: "Heart Rate Finding", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "remark", label: "Remark", type: "text", required: false, editable: true },
];

export const SPECIAL_MEDICAL_MAMMOGRAM_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "SM_FINDINGS" },
  { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "remark", label: "Remark", type: "text", required: false, editable: true },
];

export const SPECIAL_MEDICAL_PAP_SMEAR_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "SM_FINDINGS" },
  { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "remarks", label: "Remarks", type: "text", required: false, editable: true },
];

export const SPECIAL_MEDICAL_PFT_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "date", label: "Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "inspiration", label: "Inspiration", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "expiration", label: "Expiration", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "fev1", label: "FEV1", type: "number", required: true, editable: true, validation: "numeric" },
  { id: "fvc", label: "FVC", type: "number", required: true, editable: true, validation: "numeric" },
  { id: "fev1Fvc", label: "FEV1/FVC", type: "number", required: true, editable: true, validation: "numeric" },
  { id: "rv", label: "RV", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "vc", label: "VC", type: "number", required: false, editable: true, validation: "numeric" },
];

export const SPECIAL_MEDICAL_STOOL_TEST_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "SM_FINDINGS" },
  { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "remarks", label: "Remarks", type: "text", required: false, editable: true },
];

export const SPECIAL_MEDICAL_TMT_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "FINDINGS_RESULT" },
  { id: "mets", label: "METS", type: "dropdown", required: true, editable: true, masterKey: "METS" },
  { id: "heartRateFinding", label: "Heart Rate Finding", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "heartRateResult", label: "Heart Rate Result", type: "text", required: false, editable: false },
  { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "remarks", label: "Remarks", type: "text", required: false, editable: true },
];

export const SPECIAL_MEDICAL_USG_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "SM_FINDINGS" },
  { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "remarks", label: "Remarks", type: "text", required: false, editable: true },
];

export const SPECIAL_MEDICAL_FUNDOSCOPY_SUBSECTION_FORM_FIELDS: SpecialMedicalFieldConfig[] = [
  { id: "medicalType", label: "Medical Type", type: "dropdown", required: false, editable: true, masterKey: "MEDICAL_TYPE" },
  { id: "testDate", label: "Test Date", type: "date", required: false, editable: true, disableFutureDate: true },
  { id: "findings", label: "Findings", type: "dropdown", required: true, editable: true, masterKey: "SM_FINDINGS" },
  { id: "examineeName", label: "Examinee Name", type: "text", required: false, editable: true },
  { id: "examineeAge", label: "Examinee Age", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "doctorName", label: "Doctor Name", type: "text", required: false, editable: true },
  { id: "doctorRegistrationNo", label: "Doctor Registration No", type: "text", required: false, editable: true },
  { id: "remarks", label: "Remarks", type: "text", required: false, editable: true },
];

const normalizeSectionName = (section?: string) => (section ?? "").trim().toLowerCase();

export const getSpecialMedicalSubSectionFormFields = (selectedSubSection?: string): SpecialMedicalFieldConfig[] => {
  const normalized = normalizeSectionName(selectedSubSection);

  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_2DECHO_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_2DECHO_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_BLOOD_UREA_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_BLOOD_UREA_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_CXR_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_CXR_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_DOBUTAMINE_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_DOBUTAMINE_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_EXERCISE_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_EXERCISE_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_ECG_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_ECG_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_MAMMOGRAM_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_MAMMOGRAM_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_PAP_SMEAR_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_PAP_SMEAR_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_PFT_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_PFT_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_STOOL_TEST_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_STOOL_TEST_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_TMT_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_TMT_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_USG_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_USG_SUBSECTION_FORM_FIELDS;
  }
  if (normalized === normalizeSectionName(SPECIAL_MEDICAL_FUNDOSCOPY_SECTION_LABEL)) {
    return SPECIAL_MEDICAL_FUNDOSCOPY_SUBSECTION_FORM_FIELDS;
  }

  return [];
};

export const getSpecialMedicalConfig = (): MedicalFinalConfigField[] => {
  const allSubsections = [
    { label: SPECIAL_MEDICAL_2DECHO_SECTION_LABEL, fields: SPECIAL_MEDICAL_2DECHO_SUBSECTION_FORM_FIELDS },
    { label: SPECIAL_MEDICAL_BLOOD_UREA_SECTION_LABEL, fields: SPECIAL_MEDICAL_BLOOD_UREA_SUBSECTION_FORM_FIELDS },
    { label: SPECIAL_MEDICAL_CXR_SECTION_LABEL, fields: SPECIAL_MEDICAL_CXR_SUBSECTION_FORM_FIELDS },
    { label: SPECIAL_MEDICAL_DOBUTAMINE_SECTION_LABEL, fields: SPECIAL_MEDICAL_DOBUTAMINE_SUBSECTION_FORM_FIELDS },
    { label: SPECIAL_MEDICAL_EXERCISE_SECTION_LABEL, fields: SPECIAL_MEDICAL_EXERCISE_SUBSECTION_FORM_FIELDS },
    { label: SPECIAL_MEDICAL_ECG_SECTION_LABEL, fields: SPECIAL_MEDICAL_ECG_SUBSECTION_FORM_FIELDS },
    { label: SPECIAL_MEDICAL_MAMMOGRAM_SECTION_LABEL, fields: SPECIAL_MEDICAL_MAMMOGRAM_SUBSECTION_FORM_FIELDS },
    { label: SPECIAL_MEDICAL_PAP_SMEAR_SECTION_LABEL, fields: SPECIAL_MEDICAL_PAP_SMEAR_SUBSECTION_FORM_FIELDS },
    { label: SPECIAL_MEDICAL_PFT_SECTION_LABEL, fields: SPECIAL_MEDICAL_PFT_SUBSECTION_FORM_FIELDS },
    { label: SPECIAL_MEDICAL_STOOL_TEST_SECTION_LABEL, fields: SPECIAL_MEDICAL_STOOL_TEST_SUBSECTION_FORM_FIELDS },
    { label: SPECIAL_MEDICAL_TMT_SECTION_LABEL, fields: SPECIAL_MEDICAL_TMT_SUBSECTION_FORM_FIELDS },
    { label: SPECIAL_MEDICAL_USG_SECTION_LABEL, fields: SPECIAL_MEDICAL_USG_SUBSECTION_FORM_FIELDS },
    { label: SPECIAL_MEDICAL_FUNDOSCOPY_SECTION_LABEL, fields: SPECIAL_MEDICAL_FUNDOSCOPY_SUBSECTION_FORM_FIELDS },
  ];

  return allSubsections.flatMap((subsection) =>
    subsection.fields.map((field) => ({
      id: field.id,
      section: subsection.label,
      field: field.label,
    }))
  );
};
