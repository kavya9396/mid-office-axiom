import type { ApplicantTab, DRSData, SummaryResponse } from "../../types/drs.types";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const mapGenderToDisplayValue = (gender: string): SummaryResponse["proposerSummary"]["gender"] => {
  const normalizedGender = gender.trim().toUpperCase();

  if (normalizedGender === "M" || normalizedGender === "MALE") {
    return "Male";
  }

  if (normalizedGender === "F" || normalizedGender === "FEMALE") {
    return "Female";
  }

  return "Other";
};

const mapMemberType = (memberTypeValue: string | undefined, index: number): ApplicantTab => {
  const normalized = memberTypeValue?.trim().toUpperCase() ?? "";

  if (normalized === "PROPOSER" || normalized.includes("PR")) {
    return "proposer";
  }

  if (normalized === "LIFEASSURED1" || normalized === "LIFE ASSURED 1") {
    return "lifeassured1";
  }

  if (normalized === "LIFEASSURED2" || normalized === "LIFE ASSURED 2") {
    return "lifeassured2";
  }

  if (normalized.includes("LA") || normalized.includes("LIFE")) {
    return index === 1 ? "lifeassured1" : "lifeassured2";
  }

  if (index === 0) {
    return "proposer";
  }

  if (index === 1) {
    return "lifeassured1";
  }

  return "lifeassured2";
};

export const isFormalTaskRole = (roleType: string) => {
  const normalizedRoleType = roleType.trim().toUpperCase().replace(/\s+/g, "_");
  return normalizedRoleType === "DVT_FORMAL_TASK" || normalizedRoleType === "GUW_FORMAL_TASK";
};

export const buildFormalMemberProfile = (data?: DRSData | null): Partial<SummaryResponse> | undefined => {
  const dataRecord = data as unknown as UnknownRecord;
  const summaryEntries = Array.isArray(dataRecord?.summary)
    ? (dataRecord.summary as UnknownRecord[])
    : [];
  const customerDetails = Array.isArray(dataRecord?.customerDetails)
    ? (dataRecord.customerDetails as UnknownRecord[])
    : [];

  if (summaryEntries.length === 0 && customerDetails.length === 0) {
    return undefined;
  }

  const selectedSummaryEntry = summaryEntries[0] ?? {};
  const currentCustomer = customerDetails[0] ?? {};
  const summaryPersonal = toRecord(selectedSummaryEntry.personalDetails);
  const customerPersonal = toRecord(currentCustomer.personalDetails);
  const personalDetails = Object.keys(summaryPersonal).length > 0 ? summaryPersonal : customerPersonal;

  const memberType = mapMemberType(
    String(selectedSummaryEntry.memberType ?? currentCustomer.lifeType ?? ""),
    0,
  );

  return {
    memberType,
    proposerSummary: {
      title: String(personalDetails.title ?? ""),
      firstName: String(personalDetails.firstName ?? ""),
      middleName: String(personalDetails.middleName ?? ""),
      lastName: String(personalDetails.lastName ?? ""),
      dob: String(personalDetails.dob ?? ""),
      age: Number(personalDetails.age ?? 0),
      gender: mapGenderToDisplayValue(String(personalDetails.gender ?? "")),
      profileImage: String(personalDetails.profileImage ?? ""),
      caseStatus: String(personalDetails.caseStatus ?? ""),
    },
  };
};

export const getFormalHeaderData = (profile?: Partial<SummaryResponse>) => {
  const proposerSummary = profile?.proposerSummary;

  return {
    name: [proposerSummary?.firstName, proposerSummary?.middleName, proposerSummary?.lastName].filter(Boolean).join(" ") || "-",
    dob: proposerSummary?.dob ?? "-",
    age: proposerSummary?.age && proposerSummary.age > 0 ? proposerSummary.age : "-",
    gender: proposerSummary?.gender ?? "-",
    profileImage: proposerSummary?.profileImage ?? "",
    caseStatus: proposerSummary?.caseStatus ?? "",
    occupation: "-",
    annualIncome: undefined,
    email: "-",
    mobile: "-",
  };
};