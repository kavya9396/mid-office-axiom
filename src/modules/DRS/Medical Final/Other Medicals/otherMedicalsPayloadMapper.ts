import {
  CBC_TABLE_ROWS,
  LFT_TABLE_ROWS,
  LIPIDS_TABLE_ROWS,
  OGTT_TABLE_ROWS,
  RUA_TABLE_ROWS,
  S13_TABLE_ROWS,
  SMA12_TABLE_ROWS,
  TFT_TABLE_ROWS,
} from "./otherMedicalsConfig";

import type {
  OtherMedicalParameter,
  OtherMedicalSaveRequest,
  OtherMedicalSectionKey,
  OtherMedicalTableData,
} from "./otherMedicals.types";

type TableRowConfig = {
  id: string;
  parameter: string;
};

type BuildOtherMedicalRequestArgs = {
  applicationNumber: string;
  partyId: string;
  createdBy: string;
  selectedSubSection: string;
  values: Record<string, string>;
  tableData: OtherMedicalTableData;
};

const normalize = (value?: string) =>
  String(value ?? "").trim().toLowerCase();

const sectionKeyMap: Record<string, OtherMedicalSectionKey> = {
  "blood sugar random": "blood_sugar_random",
  "cbc group": "cbc_group",
  cot: "cot",
  ghb: "ghb",
  hba1c: "hba1c",
  hbsag: "hbsag",
  "hiv elisa": "hiv_elisa",
  lft: "lft",
  lipids: "lipids",
  "ogtt group": "ogtt_group",
  ppbs: "ppbs",
  "rua group": "rua_group",
  "serum cotinine": "serum_cotinine",
  "sma12 group": "sma12_group",
  "tft group": "tft_group",
  fbs: "fbs",
  "s13 group": "s13_group",
  "hiv western blot": "hiv_western_blot",
  hcv: "hcv",
  microalbuminuria: "microalbuminuria",
  psa: "psa",
};

const tableRowsBySection: Partial<
  Record<OtherMedicalSectionKey, TableRowConfig[]>
> = {
  cbc_group: CBC_TABLE_ROWS,
  lft: LFT_TABLE_ROWS,
  lipids: LIPIDS_TABLE_ROWS,
  ogtt_group: OGTT_TABLE_ROWS,
  rua_group: RUA_TABLE_ROWS,
  sma12_group: SMA12_TABLE_ROWS,
  tft_group: TFT_TABLE_ROWS,
  s13_group: S13_TABLE_ROWS,
};

const findingsSections = new Set<OtherMedicalSectionKey>([
  "cot",
  "hbsag",
  "hiv_elisa",
  "serum_cotinine",
  "hiv_western_blot",
  "hcv",
]);

const resultSections = new Set<OtherMedicalSectionKey>([
  "microalbuminuria",
  "psa",
]);

const removeEmptyOptionalValues = (
  parameter: OtherMedicalParameter
): OtherMedicalParameter =>
  Object.fromEntries(
    Object.entries(parameter).filter(
      ([key, value]) =>
        key === "paramName" ||
        key === "paramValue" ||
        String(value ?? "").trim() !== ""
    )
  ) as OtherMedicalParameter;

const mapTableParameters = (
  sectionKey: OtherMedicalSectionKey,
  tableData: OtherMedicalTableData
): OtherMedicalParameter[] => {
  const rows = tableRowsBySection[sectionKey] ?? [];

  return rows.map((row) => {
    const data = tableData[row.id];

    return removeEmptyOptionalValues({
      paramName: row.parameter,
      paramValue: data?.value ?? "",
      paramUnits: data?.unit ?? "",
      refRangeFrom: data?.labStart ?? "",
      refRangeTo: data?.labEnd ?? "",
      findings: data?.findings ?? "",
    });
  });
};

const mapSingleParameter = (
  sectionKey: OtherMedicalSectionKey,
  values: Record<string, string>
): OtherMedicalParameter => {
  const paramName = findingsSections.has(sectionKey)
    ? "Findings"
    : resultSections.has(sectionKey)
      ? "Result"
      : "Value";

  const paramValue = resultSections.has(sectionKey)
    ? values.findings ?? values.result ?? ""
    : values.value ?? values.findings ?? "";

  return removeEmptyOptionalValues({
    paramName,
    paramValue,
    paramUnits: values.unitsValue ?? "",
    refRangeFrom: values.labRangeValueStart ?? "",
    refRangeTo: values.labRangeValueEnd ?? "",
    findings: findingsSections.has(sectionKey)
      ? paramValue
      : values.findings ?? "",
  });
};

export const buildOtherMedicalRequest = ({
  applicationNumber,
  partyId,
  createdBy,
  selectedSubSection,
  values,
  tableData,
}: BuildOtherMedicalRequestArgs): OtherMedicalSaveRequest => {
  const sectionKey = sectionKeyMap[normalize(selectedSubSection)];

  if (!sectionKey) {
    throw new Error(
      `Unsupported Other Medical subsection: ${selectedSubSection}`
    );
  }

  const tableRows = tableRowsBySection[sectionKey];

  const parameters = tableRows
    ? mapTableParameters(sectionKey, tableData)
    : [mapSingleParameter(sectionKey, values)];

  return {
    applicationNumber,
    partyId,
    createdBy,
    sections: {
      [sectionKey]: {
        medicalType: values.medicalType ?? "",
        testDate: values.testDate ?? values.date ?? "",
        doctorName: values.doctorName ?? "",
        doctorRegNo: values.doctorRegistrationNo ?? "",
        centreName: values.diagnosticCentreName ?? "",
        centreAddress: values.diagnosticCentreAddress ?? "",
        pincode: values.diagnosticCentrePincode ?? "",
        parameters,
      },
    },
  };
};