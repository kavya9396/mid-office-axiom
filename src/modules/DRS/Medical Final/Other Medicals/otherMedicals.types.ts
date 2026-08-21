export type OtherMedicalParameter = {
  paramName: string;
  paramValue: string;
  paramUnits?: string;
  refRangeFrom?: string;
  refRangeTo?: string;
  findings?: string;
};

export type OtherMedicalResponseParameter = {
  applicationNumber?: string;
  partyId?: string;
  paramName?: string;
  paramValue?: string;
  paramUnits?: string | null;
  refRangeFrom?: string | null;
  refRangeTo?: string | null;
  findings?: string | null;
  findingsCalculated?: string | null;
};

export type OtherMedicalResponseSection = {
  testCode?: string;
  testDtlId?: number;
  headerStatus?: string;
  medicalType?: string;
  reqFlag?: string;
  parameters?: OtherMedicalResponseParameter[];
  rowsInserted?: number;
  rowsUpdated?: number;
};

export type OtherMedicalSectionPayload = {
  medicalType: string;
  testDate: string;
  doctorName: string;
  doctorRegNo: string;
  centreName: string;
  centreAddress: string;
  pincode: string;
  parameters: OtherMedicalParameter[];
};

export type OtherMedicalSectionKey =
  | "blood_sugar_random"
  | "cbc_group"
  | "cot"
  | "ghb"
  | "hba1c"
  | "hbsag"
  | "hiv_elisa"
  | "lft"
  | "lipids"
  | "ogtt_group"
  | "ppbs"
  | "rua_group"
  | "serum_cotinine"
  | "sma12_group"
  | "tft_group"
  | "fbs"
  | "s13_group"
  | "hiv_western_blot"
  | "hcv"
  | "microalbuminuria"
  | "psa";

export type OtherMedicalSaveRequest = {
  applicationNumber: string;
  partyId: string;
  createdBy: string;
  sections: Partial<
    Record<OtherMedicalSectionKey, OtherMedicalSectionPayload>
  >;
};

export type OtherMedicalSaveResponse = {
  response_code?: number;
  error?: boolean;
  message?: string;
  data?: {
    applicationNumber?: string;
    partyId?: string;
    sections?: Partial<
      Record<
        OtherMedicalSectionKey,
        OtherMedicalResponseSection
      >
    >;
  };
};

export type OtherMedicalTableRowValue = {
  value: string;
  labStart: string;
  labEnd: string;
  unit: string;
  findings: string;
};

export type OtherMedicalTableData = Record<
  string,
  OtherMedicalTableRowValue
>;