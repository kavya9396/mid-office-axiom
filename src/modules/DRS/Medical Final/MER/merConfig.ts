export type MedicalFinalConfigField = {
  id: string | number;
  section: string;
  field: string;
};

export type MerSubSectionFieldType = "text" | "number" | "date" | "dropdown";
export type MerSubSectionValidation = "alpha" | "numeric";
export type MerSubSectionRequiredWhen = {
  fieldId: string;
  value: string;
};

export type MerSubSectionFieldConfig = {
  id: string;
  label: string;
  type: MerSubSectionFieldType;
  required: boolean;
  editable: boolean;
  masterKey?:
    | "yes_no"
    | "place_of_examination"
    | "gender"
    | "mer_education_sd"
    | "mer_occupation_sd"
    | "family_relation"
    | "dead_or_alive";
  validation?: MerSubSectionValidation;
  requiredWhen?: MerSubSectionRequiredWhen;
  defaultValue?: string;
};

export const MER_SECTION_LABEL = "MER";
export const HABIT_AND_ADDICTIONS_SECTION_LABEL = "Habit and Addictions";
export const MEASUREMENT_SECTION_LABEL = "Measurement";
export const FAMILY_HISTORY_AND_HEALTH_STATUS_SECTION_LABEL = "Family history and health status";
export const BLOOD_PRESSURE_AND_PULSE_DETAILS_SECTION_LABEL = "Blood pressure and Pulse details";
export const PULSE_RATE_DETAILS_SECTION_LABEL = "Question Table";

export const MER_PRIMARY_SUBSECTION_FORM_FIELDS: MerSubSectionFieldConfig[] = [
  { id: "applicationNo", label: "Application No.", type: "text", required: false, editable: false },
  { id: "firstName", label: "First Name", type: "text", required: true, editable: true, validation: "alpha" },
  { id: "lastName", label: "Last Name", type: "text", required: false, editable: true, validation: "alpha" },
  { id: "isMerNameSameAsProposalName", label: "Is MER name same as proposal name?", type: "dropdown", required: true, editable: true, masterKey: "yes_no" },
  { id: "placeOfExamination", label: "Place of Examination", type: "dropdown", required: true, editable: true, masterKey: "place_of_examination" },
  { id: "gender", label: "Gender", type: "dropdown", required: true, editable: true, masterKey: "gender" },
  { id: "nameOfMe", label: "Name of ME", type: "text", required: true, editable: true, validation: "alpha" },
  { id: "meCode", label: "ME Code", type: "text", required: true, editable: true },
  { id: "isIdentityProofAndApplicationPhotoMatch", label: "Is Identity Proof and Application Photo Match", type: "dropdown", required: false, editable: true, masterKey: "yes_no" },
  { id: "examineeDob", label: "Examinee DOB", type: "date", required: true, editable: true },
  { id: "examTime", label: "Examination Time", type: "text", required: false, editable: true },
  { id: "examineeEducationSd", label: "Examinee Education SD", type: "dropdown", required: false, editable: true, masterKey: "mer_education_sd" },
  { id: "examineeOccupationSd", label: "Examinee Occupation SD", type: "dropdown", required: false, editable: true, masterKey: "mer_occupation_sd" },
  { id: "examineeIncomeSd", label: "Examinee Income SD", type: "number", required: false, editable: true, validation: "numeric" },
  { id: "anyPreviousLifeInsurancePolicyDeclinePostponeOrIssuedOnRevisedTermSd", label: "Any previous life Insurance policy decline/Postpone/issued on revised term SD", type: "dropdown", required: false, editable: true, masterKey: "yes_no" },
  { id: "examineePhotoIdProof", label: "Examinee Photo ID Proof", type: "text", required: true, editable: true },
  { id: "examineeContactNo", label: "Examinee Contact No", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "faceMatchScore", label: "Face match Score", type: "text", required: false, editable: true },
  { id: "diagnosticCentreName", label: "Diagnostic Centre Name", type: "text", required: false, editable: true },
  { id: "diagnosticCentreAddress", label: "Diagnostic Centre Address", type: "text", required: false, editable: true },
  { id: "diagnosticCentrePincode", label: "Diagnostic Centre Pincode", type: "text", required: false, editable: true, validation: "numeric" },
  { id: "dateOfExamination", label: "Date of Examination", type: "date", required: true, editable: true },
];

export const MER_HABIT_AND_ADDICTIONS_SUBSECTION_FORM_FIELDS: MerSubSectionFieldConfig[] = [
  {
    id: "cigarettesBeedisCigar",
    label: "Cigarettes/beedis/cigar",
    type: "dropdown",
    required: true,
    editable: true,
    masterKey: "yes_no",
  },
  {
    id: "cigarettesBeedisCigarQuant",
    label: "Cigarettes/beedis/cigar Quant",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
    requiredWhen: { fieldId: "cigarettesBeedisCigar", value: "Yes" },
  },
  {
    id: "cigarettesBeedisCigarYear",
    label: "Cigarettes/beedis/cigar Year",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
    requiredWhen: { fieldId: "cigarettesBeedisCigar", value: "Yes" },
  },
  {
    id: "gutkaSnuffPaan",
    label: "Gutka / snuff / paan etc.",
    type: "dropdown",
    required: true,
    editable: true,
    masterKey: "yes_no",
  },
  {
    id: "gutkaSnuffPaanQuant",
    label: "Gutka / snuff / paan etc. Quant",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
    requiredWhen: { fieldId: "gutkaSnuffPaan", value: "Yes" },
  },
  {
    id: "gutkaSnuffPaanYear",
    label: "Gutka / snuff / paan etc. Year",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
    requiredWhen: { fieldId: "gutkaSnuffPaan", value: "Yes" },
  },
  {
    id: "narcoticConsumption",
    label: "Narcotic Consumption",
    type: "dropdown",
    required: true,
    editable: true,
    masterKey: "yes_no",
  },
  {
    id: "narcoticConsumptionQuant",
    label: "Narcotic Consumption Quant",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
    requiredWhen: { fieldId: "narcoticConsumption", value: "Yes" },
  },
  {
    id: "narcoticConsumptionYear",
    label: "Narcotic Consumption Year",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
    requiredWhen: { fieldId: "narcoticConsumption", value: "Yes" },
  },
  {
    id: "beerWineHardLiquor",
    label: "Beer/Wine/Hard liquor",
    type: "dropdown",
    required: true,
    editable: true,
    masterKey: "yes_no",
  },
  {
    id: "beerWineHardLiquorQuant",
    label: "Beer/Wine/Hard liquor Quant",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
    requiredWhen: { fieldId: "beerWineHardLiquor", value: "Yes" },
  },
  {
    id: "beerWineHardLiquorYear",
    label: "Beer/Wine/Hard liquor Year",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
    requiredWhen: { fieldId: "beerWineHardLiquor", value: "Yes" },
  },
];

export const MER_MEASUREMENT_SUBSECTION_FORM_FIELDS: MerSubSectionFieldConfig[] = [
  {
    id: "heightCms",
    label: "Height (cms)",
    type: "number",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "heightFts",
    label: "Height (Fts)",
    type: "number",
    required: false,
    editable: false,
    validation: "numeric",
  },
  {
    id: "inches",
    label: "Inches",
    type: "number",
    required: false,
    editable: false,
    validation: "numeric",
  },
  {
    id: "weightKgs",
    label: "Weight (Kgs)",
    type: "number",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "waistCms",
    label: "Waist (cms)",
    type: "number",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "hipsCms",
    label: "Hips (cms)",
    type: "number",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "bmi",
    label: "BMI",
    type: "text",
    required: false,
    editable: false,
  },
];

export const MER_FAMILY_HISTORY_AND_HEALTH_STATUS_SUBSECTION_FORM_FIELDS: MerSubSectionFieldConfig[] = [
  // Father row
  {
    id: "fatherRelation",
    label: "Relation",
    type: "text",
    required: false,
    editable: false,
    defaultValue: "Father",
  },
  {
    id: "fatherAge",
    label: "Age",
    type: "number",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "fatherHealthStatus",
    label: "Health Status",
    type: "text",
    required: false,
    editable: true,
    validation: "alpha",
  },
  {
    id: "fatherDeadOrAlive",
    label: "Dead or Alive",
    type: "dropdown",
    required: false,
    editable: true,
    masterKey: "dead_or_alive",
  },
  // Mother row
  {
    id: "motherRelation",
    label: "Relation",
    type: "text",
    required: false,
    editable: false,
    defaultValue: "Mother",
  },
  {
    id: "motherAge",
    label: "Age",
    type: "number",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "motherHealthStatus",
    label: "Health Status",
    type: "text",
    required: false,
    editable: true,
    validation: "alpha",
  },
  {
    id: "motherDeadOrAlive",
    label: "Dead or Alive",
    type: "dropdown",
    required: false,
    editable: true,
    masterKey: "dead_or_alive",
  },
  // Other relation row
  {
    id: "otherRelation",
    label: "Relation",
    type: "dropdown",
    required: false,
    editable: true,
    masterKey: "family_relation",
  },
  {
    id: "otherAge",
    label: "Age",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
  },
  {
    id: "otherHealthStatus",
    label: "Health Status",
    type: "text",
    required: false,
    editable: true,
    validation: "alpha",
  },
  {
    id: "otherDeadOrAlive",
    label: "Dead or Alive",
    type: "dropdown",
    required: false,
    editable: true,
    masterKey: "dead_or_alive",
  },
];

export const MER_BLOOD_PRESSURE_DETAILS_SUBSECTION_FORM_FIELDS: MerSubSectionFieldConfig[] = [
  {
    id: "systolic1",
    label: "Systolic",
    type: "number",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "systolic2",
    label: "Systolic2",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
  },
  {
    id: "systolic3",
    label: "Systolic3",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
  },
  {
    id: "avgSystolic",
    label: "Avg Systolic",
    type: "number",
    required: false,
    editable: false,
  },
  {
    id: "diastolic1",
    label: "Diastolic",
    type: "number",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "diastolic2",
    label: "Diastolic2",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
  },
  {
    id: "diastolic3",
    label: "Diastolic3",
    type: "number",
    required: false,
    editable: true,
    validation: "numeric",
  },
  {
    id: "avgDiastolic",
    label: "Avg Diastolic",
    type: "number",
    required: false,
    editable: false,
  },
  {
    id: "pulseRate",
    label: "Pulse Rate",
    type: "text",
    required: true,
    editable: true,
    validation: "numeric",
  },
  {
    id: "pulseRemarks",
    label: "Pulse Remarks",
    type: "text",
    required: true,
    editable: true,
  },
];

export const MER_PULSE_RATE_DETAILS_SUBSECTION_FORM_FIELDS: MerSubSectionFieldConfig[] = [
  { id: "1.a", label: "Are you the examinees medical attendant?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "2.a", label: "Is there any abnormality in general appearance?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "2.b", label: "Describe Build - Normal / thin / muscular / obese / stocky", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "2.c", label: "Has there been any significant weight gain or weight loss?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "3.a", label: "Has been hospitalized for accident/Medical treatment/ Surgery(if yes,please give details , Date and Duration of the ailment)", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "3.b", label: "Has undergone any path tests(including HIV and HBsAg)/ Radiological Tests/ Cardiovascular tests/ USG/ 2D Echo/ CT Scan/ MRI/ Mammogram or any other tests. (Please specifydate/reason/findings)", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "3.c", label: "Underwent surgery , If yes , Pls Specify?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "4.a", label: "Has the examinee or his/ her spouse been tested positive or is under treatment for HIV/ AIDS/ Sexually transmitted diseases ( eg , syphilis , gonorrhea , etc.)", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "5.a", label: "Is there any evidence of oral cancer or leukoplakia?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "5.b", label: "Any history of error of refraction/ ear discharge/ perforation/ nose bleed or any other eye/ ear/ nose/ throat abnormality", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "5.c", label: "Any history of error of refraction or evidence of eye / retinal abnormality or Cataract", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "6.a", label: "Is there any history of seizures (focal or generalized) , peripheral neuritis , fainting , frequent headaches?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "6.b", label: "Is there any evidence of paresis , paralysis , abnormal gait , speech , wasting , involuntary movement , pupillary reflexes?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "7.a", label: "History of exertional dyspnea , arrhythmia , peripheral vascular disease?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "7.b", label: "Any evidence of gallop , carotid bruit , raised JVP , pedal edema , gross pallor , murmur?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "7.c", label: "If murmur is present , give the extent , grade point of maximum intensity and conduction and the probable diagnosis.", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "7.d", label: "Any history of Stenting , PTCA , CABG , Open Heart Surgery?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "8.a", label: "Is there any history of breathlessness , wheezing , cough , bronchitis , asthma , TB , rhonchi , rale , emphysema?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "8.b", label: "Any evidence of monchi, rate, emphysema?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "9.a", label: "Is the examinee on treatment for hypertension? If yes, mention medication and duration of Rx? How is the control? Any other risk factors?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "9.b", label: "Is there any evidence of end organ damage?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "10.a", label: "Is the examinee suffering from any kind of Diabetes? If Yes , since how long on what treatment?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "10.b", label: "Is there any evidence of end organ damage?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "11.a", label: "Is there any history of hernia , disease of liver , gall bladder , pancreas , stomach , intestine?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "11.b", label: "Is there any evidence of organomegaly in abdomen , pelvis & or presence of free fluid?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "11.c", label: "Is there any history of piles , fissure , fistula , ulcerative colitis?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "11.d", label: "Is there any history of jaundice? If yes , any viral markers done?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "12.a", label: "GU system: Has the examinee suffered from or is suffering from kidney , ureter , bladder disease , stones , or any other urinary disease?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "13.a", label: "Is there any evidence of endocrine , thyroid dysfunction? if yes , please give details.", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "14.a", label: "Any history of arthritis/ fracture/ joint surgery/ hyperuricemia/ gout?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "15.a", label: "Any evidence of psoriasis , eczema , varicose veins or xanthelasma?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "15.b", label: "Any operative/ non operative significants scars - burns , injuries.", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "16.a", label: "Are there any abnormalities in the testes relating to location , size and consistency? ( Please do a physical examination only in case suspicion)", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "17.a", label: "Is there any history of evidence of cancer , tumour , growth or cyst?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "17.b", label: "Has the examinee suffered from significant enlargement of lymph glands?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "18.a", label: "Is there any history of anxiety/ stress/ depression/ psychosis", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "18.b", label: "Was the examinee treated for any psychiatric ailment? If so give details about medication given and absenteeism from work , if any", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "19.a", label: "Is the examinee currently under any kind of medication?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "20.a", label: "Any adverse menstrual history and LMP?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "20.b", label: "Any history of miscarriage , abortion or MTP?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "20.c", label: "Is she now pregnant? If yes , give details of duration in weeks", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "20.d", label: "Do you suspect any disease related to breast on history? (Please do a physical examination only in case of suspicion)", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "20.e", label: "Any reason to suspect disease of pelvic organs on history? Please mention your suspicion. (No need of internal examination)", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "20.f", label: "Has she undergone any of these tests:pap smear , mammogram or ultrasound of pelvis?", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "21.a", label: "Was the examinee co-operative", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "21.b", label: "In your Opinion , is there anything about the examinees health , lifestyle or character which might unfavorable affect insurability", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
  { id: "21.c", label: "Are there any points on which you suggest further information be obtained", type: "dropdown", required: true, editable: true, masterKey: "yes_no", defaultValue: "No" },
];

const normalizeSectionName = (section?: string) => (section ?? "").trim().toLowerCase();

export const getMerSubSectionFormFields = (selectedSubSection?: string): MerSubSectionFieldConfig[] => {
  const normalized = normalizeSectionName(selectedSubSection);

  if (normalized === normalizeSectionName(HABIT_AND_ADDICTIONS_SECTION_LABEL) || normalized === "habbit and adictions") {
    return MER_HABIT_AND_ADDICTIONS_SUBSECTION_FORM_FIELDS;
  }

  if (normalized === normalizeSectionName(MEASUREMENT_SECTION_LABEL) || normalized === "measurements") {
    return MER_MEASUREMENT_SUBSECTION_FORM_FIELDS;
  }

  if (
    normalized === normalizeSectionName(FAMILY_HISTORY_AND_HEALTH_STATUS_SECTION_LABEL) ||
    normalized === "family history and health status"
  ) {
    return MER_FAMILY_HISTORY_AND_HEALTH_STATUS_SUBSECTION_FORM_FIELDS;
  }

  if (
    normalized === normalizeSectionName(BLOOD_PRESSURE_AND_PULSE_DETAILS_SECTION_LABEL) ||
    normalized === "blood pressure details"
  ) {
    return MER_BLOOD_PRESSURE_DETAILS_SUBSECTION_FORM_FIELDS;
  }

  if (
    normalized === normalizeSectionName(PULSE_RATE_DETAILS_SECTION_LABEL) ||
    normalized === "pulse rate details" ||
    normalized === "question table"
  ) {
    return MER_PULSE_RATE_DETAILS_SUBSECTION_FORM_FIELDS;
  }

  return MER_PRIMARY_SUBSECTION_FORM_FIELDS;
};

export const getMerConfig = (): MedicalFinalConfigField[] => {
  const allSubsections = [
    {
      label: MER_SECTION_LABEL,
      fields: MER_PRIMARY_SUBSECTION_FORM_FIELDS,
    },
    {
      label: HABIT_AND_ADDICTIONS_SECTION_LABEL,
      fields: MER_HABIT_AND_ADDICTIONS_SUBSECTION_FORM_FIELDS,
    },
    {
      label: MEASUREMENT_SECTION_LABEL,
      fields: MER_MEASUREMENT_SUBSECTION_FORM_FIELDS,
    },
    {
      label: FAMILY_HISTORY_AND_HEALTH_STATUS_SECTION_LABEL,
      fields: MER_FAMILY_HISTORY_AND_HEALTH_STATUS_SUBSECTION_FORM_FIELDS,
    },
    {
      label: BLOOD_PRESSURE_AND_PULSE_DETAILS_SECTION_LABEL,
      fields: MER_BLOOD_PRESSURE_DETAILS_SUBSECTION_FORM_FIELDS,
    },
    {
      label: PULSE_RATE_DETAILS_SECTION_LABEL,
      fields: MER_PULSE_RATE_DETAILS_SUBSECTION_FORM_FIELDS,
    },
  ];

  return allSubsections.flatMap((subsection) =>
    subsection.fields.map((field) => ({
      id: field.id,
      section: subsection.label,
      field: field.label,
    }))
  );
};