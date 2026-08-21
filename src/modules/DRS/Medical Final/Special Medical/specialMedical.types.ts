export type SpecialMedicalSectionKey =
  | "2decho"
  | "blood_urea_and_nitro"
  | "cxr"
  | "dobutamine_stress_echocardiogram"
  | "exercise_stress_echocardiogram"
  | "ecg"
  | "mammogram"
  | "pap_smear"
  | "pft"
  | "stool_test"
  | "tmt"
  | "usg"
  | "fundoscopy_test";

export type MedicalCalculatedParameter = {
  applicationNumber?: string;
  partyId?: string;
  paramName?: string;
  paramValue?: string;
  paramUnits?: string | null;
  refRangeFrom?: string | null;
  refRangeTo?: string | null;
  findings?: string | null;
  ejectionFraction?: string | number | null;
  ejectionResult?: string | null;
  rejectionAbnormality?: string | null;
  remarks?: string | null;
  axis?: string | null;
  heartRate?: string | number | null;
  heartRateFindings?: string | null;
  result?: string | null;
  inspiration?: string | number | null;
  expiration?: string | number | null;
  fev1?: string | number | null;
  fvc?: string | number | null;
  rv?: string | number | null;
  rc?: string | number | null;
  mets?: string | number | null;
  findingsCalculated?: string | null;
};

export type SpecialMedicalSectionPayload = {
  testCode?: string;
  testDtlId?: number;
  headerStatus?: string;
  medicalType?: string;
  testDate?: string;
  reqFlag?: string;
  parameters?: MedicalCalculatedParameter[];
  rowsInserted?: number;
  rowsUpdated?: number;
};

export type SpecialMedicalSaveRequest = {
  applicationNumber: string;
  partyId: string;
  createdBy: string;
  sections: Partial<
    Record<
      SpecialMedicalSectionKey,
      SpecialMedicalSectionPayload
    >
  >;
};

export type SpecialMedicalSaveResponse = {
  response_code?: number;
  error?: boolean;
  message?: string;
  data?: {
    applicationNumber?: string;
    partyId?: string;
    clientType?: string;
    medAppDtlId?: number;
    examId?: number;
    sections?: Partial<
      Record<
        SpecialMedicalSectionKey,
        SpecialMedicalSectionPayload
      >
    >;
  };
};