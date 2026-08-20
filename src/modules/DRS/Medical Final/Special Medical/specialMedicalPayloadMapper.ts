import type {
  MedicalCalculatedParameter,
  SpecialMedicalSaveRequest,
  SpecialMedicalSectionKey,
} from "./specialMedical.types";

type BuildSpecialMedicalRequestArgs = {
  applicationNumber: string;
  partyId: string;
  createdBy: string;
  selectedSubSection: string;
  values: Record<string, string>;
};

type SectionDefinition = {
  key: SpecialMedicalSectionKey;
  testCode: string;
  parameters: Array<{
    fieldId: string;
    paramName: string;
    unit?: string;
    findings?: boolean;
    remarks?: boolean;
  }>;
};

const normalize = (value?: string) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const COMMON_FINDINGS_PARAMETER = {
  fieldId: "findings",
  paramName: "Findings",
  findings: true,
};

const sectionDefinitions: Record<string, SectionDefinition> = {
  "2decho": {
    key: "2decho",
    testCode: "2DECHO",
    parameters: [
      COMMON_FINDINGS_PARAMETER,
      {
        fieldId: "ejectionFraction",
        paramName: "Ejection Fraction",
        unit: "%",
      },
      {
        fieldId: "ejectionResult",
        paramName: "Ejection Result",
      },
      {
        fieldId: "rejectionAbnormality",
        paramName: "Rejection Abnormality",
      },
    ],
  },

  "blood urea and nitro": {
    key: "blood_urea_and_nitro",
    testCode: "BUN",
    parameters: [
      {
        fieldId: "bloodUrea",
        paramName: "Blood Urea",
      },
      {
        fieldId: "bun",
        paramName: "BUN",
      },
      {
        fieldId: "result",
        paramName: "Result",
      },
    ],
  },

  cxr: {
    key: "cxr",
    testCode: "CXR",
    parameters: [COMMON_FINDINGS_PARAMETER],
  },

  "dobutamine stress echocardiogram": {
    key: "dobutamine_stress_echocardiogram",
    testCode: "DSE",
    parameters: [
      COMMON_FINDINGS_PARAMETER,
      {
        fieldId: "ejectionFraction",
        paramName: "Ejection Fraction",
        unit: "%",
      },
      {
        fieldId: "ejectionResult",
        paramName: "Ejection Result",
      },
      {
        fieldId: "rejectionAbnormality",
        paramName: "Rejection Abnormality",
      },
    ],
  },

  "exercise stress echocardiogram": {
    key: "exercise_stress_echocardiogram",
    testCode: "ESE",
    parameters: [
      COMMON_FINDINGS_PARAMETER,
      {
        fieldId: "ejectionFraction",
        paramName: "Ejection Fraction",
        unit: "%",
      },
      {
        fieldId: "ejectionResult",
        paramName: "Ejection Result",
      },
      {
        fieldId: "rejectionAbnormality",
        paramName: "Rejection Abnormality",
      },
    ],
  },

  ecg: {
    key: "ecg",
    testCode: "ECG",
    parameters: [
      COMMON_FINDINGS_PARAMETER,
      {
        fieldId: "axis",
        paramName: "Axis",
      },
      {
        fieldId: "heartRate",
        paramName: "Heart Rate",
        unit: "bpm",
      },
      {
        fieldId: "heartRateFinding",
        paramName: "Heart Rate Finding",
      },
    ],
  },

  mammogram: {
    key: "mammogram",
    testCode: "MAMMO",
    parameters: [COMMON_FINDINGS_PARAMETER],
  },

  "pap smear": {
    key: "pap_smear",
    testCode: "PAP",
    parameters: [COMMON_FINDINGS_PARAMETER],
  },

  pft: {
    key: "pft",
    testCode: "PFT",
    parameters: [
      {
        fieldId: "fev1",
        paramName: "FEV1",
      },
      {
        fieldId: "fvc",
        paramName: "FVC",
      },
      {
        fieldId: "fev1Fvc",
        paramName: "FEV1/FVC",
      },
      {
        fieldId: "inspiration",
        paramName: "Inspiration",
      },
      {
        fieldId: "expiration",
        paramName: "Expiration",
      },
      {
        fieldId: "rv",
        paramName: "RV",
      },
      {
        fieldId: "vc",
        paramName: "VC",
      },
    ],
  },

  "stool test": {
    key: "stool_test",
    testCode: "STOOL",
    parameters: [COMMON_FINDINGS_PARAMETER],
  },

  tmt: {
    key: "tmt",
    testCode: "TMT",
    parameters: [
      COMMON_FINDINGS_PARAMETER,
      {
        fieldId: "mets",
        paramName: "METS",
      },
      {
        fieldId: "heartRateFinding",
        paramName: "Heart Rate",
        unit: "bpm",
      },
      {
        fieldId: "heartRateResult",
        paramName: "Heart Rate Result",
      },
    ],
  },

  usg: {
    key: "usg",
    testCode: "USG",
    parameters: [COMMON_FINDINGS_PARAMETER],
  },

  "fundoscopy test": {
    key: "fundoscopy_test",
    testCode: "FUNDO",
    parameters: [COMMON_FINDINGS_PARAMETER],
  },
};

const removeEmptyOptionalValues = (
  parameter: MedicalCalculatedParameter,
): MedicalCalculatedParameter =>
  Object.fromEntries(
    Object.entries(parameter).filter(
      ([key, value]) =>
        key === "paramName" ||
        key === "paramValue" ||
        String(value ?? "").trim() !== "",
    ),
  ) as MedicalCalculatedParameter;

const buildParameter = (
  definition: SectionDefinition["parameters"][number],
  values: Record<string, string>,
): MedicalCalculatedParameter => {
  const value = values[definition.fieldId] ?? "";
  const remarks = values.remarks ?? values.remark ?? "";

  return removeEmptyOptionalValues({
    paramName: definition.paramName,
    paramValue: value,
    paramUnits: definition.unit ?? "",
    findings: definition.findings ? value : "",
    remarks: definition.findings ? remarks : "",
  });
};

export const buildSpecialMedicalRequest = ({
  applicationNumber,
  partyId,
  createdBy,
  selectedSubSection,
  values,
}: BuildSpecialMedicalRequestArgs): SpecialMedicalSaveRequest => {
  const definition = sectionDefinitions[normalize(selectedSubSection)];

  if (!definition) {
    throw new Error(
      `Unsupported Special Medical subsection: ${selectedSubSection}`,
    );
  }

  return {
    applicationNumber,
    partyId,
    createdBy,
    sections: {
      [definition.key]: {
        testCode: definition.testCode,
        medicalType: values.medicalType ?? "",
        testDate: values.testDate ?? values.date ?? "",
        reqFlag: "N",
        parameters: definition.parameters
          .map((parameter) => buildParameter(parameter, values))
          .filter(
            (parameter) => String(parameter.paramValue ?? "").trim() !== "",
          ),
      },
    },
  };
};
