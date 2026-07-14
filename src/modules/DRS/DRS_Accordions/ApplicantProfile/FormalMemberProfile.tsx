import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import CustomTabs from "../../../../components/ui/Tabs/Tabs";
import { GridSection, type GridItem } from "../../../../components/layout/GridSection";
import type { Column } from "../../../../components/ui/Table/Table";
import CustomTable from "../../../../components/ui/Table/Table";
import type { ApplicantTab, SummaryResponse } from "../../../../types/drs.types";
import type { RootState } from "../../../../store/store";
import { formatDOB, toDisplayValue } from "../../../../utils/helpers";
import CustomButton from "../../../../components/ui/Button/Button";

type RiskSectionKey = "medical" | "financial" | "other";

type RiskCardData = {
  key: RiskSectionKey;
  label: string;
  subLabel: string;
  isHealthy: boolean;
};

const toRec = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const hasVals = (v: Record<string, unknown> | null): boolean =>
  !!v && Object.values(v).some((x) => (typeof x === "string" ? x.trim() !== "" : x != null));

const firstNonEmpty = (src: Record<string, unknown>, keys: string[], fb = "STD"): string => {
  for (const k of keys) {
    const val = src[k];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return fb;
};

const FORMAL_RISK_PARAMS: Record<RiskSectionKey, Record<string, string[]>> = {
  medical: {
    brePhysicalMedicalDecision: ["STP", "STD", "STANDARD", "STANDARD 1"],
    breTeleVideoMerDecision: ["STANDARD", "STANDARD 1", "STP", "STD"],
    biuMedicalStatus: ["Y"],
  },
  financial: {
    breFinancialDecision: ["FSTP", "STD", "STANDARD"],
    biuFinancialStatus: ["N"],
  },
  other: {
    ptlrResponse: ["STANDARD"],
    drcResponse: ["NO"],
    adverseIIB: ["NO"],
  },
};

const normVal = (v: unknown) =>
  String(v ?? "").trim().toUpperCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

const evalRisk = (section: RiskSectionKey, payload: Record<string, unknown>): boolean => {
  const rules = FORMAL_RISK_PARAMS[section];
  return Object.entries(rules).every(([key, expected]) => {
    const cur = normVal(payload[key]);
    if (!cur) return false;
    return expected.map(normVal).includes(cur);
  });
};

type FormalMemberProfileProps = {
  profile?: Partial<SummaryResponse>;
  onEdit?: () => void;
};

type MemberSectionTab = "personalKyc" | "contactAddress" | "nominee";

type FormalNomineeRow = {
  nomineeName: string;
  nomineeDOB: string;
  gender: string;
  relationship: string;
  sharePercentage: number;
};

type FormalAppointeeRow = {
  appointeeName: string;
  appointeeGender: string;
  appointeeDOB: string;
  appointeeRelationship: string;
};

const memberSectionTabs: Array<{ key: MemberSectionTab; label: string }> = [
  { key: "personalKyc", label: "Personal" },
  { key: "contactAddress", label: "Contact" },
  { key: "nominee", label: "Nominee" },
];

const mapMemberType = (memberTypeValue: string | undefined, index: number): ApplicantTab => {
  const normalized = memberTypeValue?.trim().toUpperCase() ?? "";

  if (normalized === "PROPOSER" || normalized.includes("PR")) return "proposer";
  if (normalized === "LIFEASSURED1" || normalized === "LIFE ASSURED 1") return "lifeassured1";
  if (normalized === "LIFEASSURED2" || normalized === "LIFE ASSURED 2") return "lifeassured2";
  if (normalized.includes("LA") || normalized.includes("LIFE")) return index === 1 ? "lifeassured1" : "lifeassured2";
  if (index === 0) return "proposer";
  if (index === 1) return "lifeassured1";
  return "lifeassured2";
};

const formalNomineeColumns: Column<FormalNomineeRow>[] = [
  { key: "nomineeName", header: "Nominee Name", width: "18%" },
  { key: "nomineeDOB", header: "Nominee DOB", width: "16%" },
  { key: "gender", header: "Gender", width: "14%" },
  { key: "relationship", header: "Relationship", width: "18%" },
  { key: "sharePercentage", header: "Share %", width: "14%" },
];

const formalAppointeeColumns: Column<FormalAppointeeRow>[] = [
  { key: "appointeeName", header: "Appointee Name", width: "26%" },
  { key: "appointeeGender", header: "Appointee Gender", width: "18%" },
  { key: "appointeeDOB", header: "Appointee DOB", width: "20%" },
  { key: "appointeeRelationship", header: "Appointee Relationship", width: "20%" },
];

const calculateAgeFromDob = (dobValue: string | undefined): number | "-" => {
  if (!dobValue) return "-";

  const dob = new Date(dobValue);
  if (Number.isNaN(dob.getTime())) return "-";

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age >= 0 ? age : "-";
};

const FormalMemberProfile = ({ profile, onEdit }: FormalMemberProfileProps) => {
  const [activeSectionTab, setActiveSectionTab] = useState<MemberSectionTab>("personalKyc");
  const { data } = useSelector((state: RootState) => state.drs);
  const roleType = localStorage.getItem("roleType") ?? "";
  const showRiskAnalytics = roleType === "GUW Formal Pool";

  const selectedMemberType =
    profile?.memberType ??
    ((localStorage.getItem("drsSelectedApplicantTab") as ApplicantTab | null) ?? "proposer");

  const selectedSummaryEntry = useMemo(() => {
    const dataRecord = data as unknown as Record<string, unknown>;
    const summaryEntries = Array.isArray(dataRecord?.summary)
      ? (dataRecord.summary as Array<Record<string, unknown>>)
      : [];

    const summaryWithTabs = summaryEntries.map((entry, index) => ({
      entry,
      memberType: mapMemberType(String(entry.memberType ?? ""), index),
    }));

    return (
      summaryWithTabs.find((item) => item.memberType === selectedMemberType)?.entry ??
      summaryEntries[0] ??
      {}
    );
  }, [data, selectedMemberType]);

  const riskCards: RiskCardData[] = useMemo(() => {
    const dataRecord = data as unknown as Record<string, unknown>;
    const externalAPIs = toRec(dataRecord?.externalAPIs);
    const activeSummaryEntry =
      (data as unknown as Record<string, unknown>)?.summary &&
      Array.isArray((data as unknown as Record<string, unknown>).summary)
        ? ((data as unknown as Record<string, unknown>).summary as Array<Record<string, unknown>>)[0]
        : {};
    const activeRiskAnalytics = Array.isArray((activeSummaryEntry as Record<string, unknown>)?.riskAnalytics)
      ? toRec(((activeSummaryEntry as Record<string, unknown>).riskAnalytics as unknown[])[0])
      : null;

    const medicalBreOutput = hasVals(toRec(externalAPIs?.medicalBreOutput))
      ? toRec(externalAPIs?.medicalBreOutput)
      : toRec(activeRiskAnalytics?.medicalRisk);

    const financialBreOutput = hasVals(toRec(externalAPIs?.financialBreOutput))
      ? toRec(externalAPIs?.financialBreOutput)
      : toRec(activeRiskAnalytics?.financialRisk);

    const otherRiskOutput = toRec(activeRiskAnalytics?.otherRisk);

    const cards: RiskCardData[] = [];

    if (hasVals(medicalBreOutput)) {
      cards.push({
        key: "medical",
        label: "Medical",
        subLabel: `BRE Medical Decision - ${firstNonEmpty(medicalBreOutput!, ["breMedicalDecision", "medicalDecision", "brePhysicalMedicalDecision"])}`,
        isHealthy: evalRisk("medical", medicalBreOutput!),
      });
    }

    if (hasVals(financialBreOutput)) {
      cards.push({
        key: "financial",
        label: "Financial",
        subLabel: `BRE Financial Decision - ${firstNonEmpty(financialBreOutput!, ["breFinancialDecision", "financialDecision"])}`,
        isHealthy: evalRisk("financial", financialBreOutput!),
      });
    }

    if (hasVals(otherRiskOutput)) {
      cards.push({
        key: "other",
        label: "Other Risks",
        subLabel: `BRE Decision - ${firstNonEmpty(otherRiskOutput!, ["ptlrResponse", "decision"])}`,
        isHealthy: evalRisk("other", otherRiskOutput!),
      });
    }

    return cards;
  }, [data]);

  const selectedPersonalDetails =
    selectedSummaryEntry && typeof selectedSummaryEntry.personalDetails === "object"
      ? (selectedSummaryEntry.personalDetails as Record<string, unknown>)
      : {};

  const resolvedDob = String(profile?.proposerSummary?.dob ?? selectedPersonalDetails.dob ?? "");
  const resolvedAge = Number(profile?.proposerSummary?.age ?? 0) > 0
    ? profile?.proposerSummary?.age
    : calculateAgeFromDob(resolvedDob);

  const personalItems: GridItem[] = [
    { label: "Title", value: toDisplayValue(profile?.proposerSummary?.title ?? selectedPersonalDetails.title) },
    { label: "First Name", value: toDisplayValue(profile?.proposerSummary?.firstName ?? selectedPersonalDetails.firstName) },
    { label: "Middle Name", value: toDisplayValue(profile?.proposerSummary?.middleName ?? selectedPersonalDetails.middleName) },
    { label: "Last Name", value: toDisplayValue(profile?.proposerSummary?.lastName ?? selectedPersonalDetails.lastName) },
    { label: "DOB", value: toDisplayValue(formatDOB(resolvedDob)) },
    { label: "Age", value: toDisplayValue(resolvedAge) },
    { label: "Gender", value: toDisplayValue(profile?.proposerSummary?.gender ?? selectedPersonalDetails.gender) },
    { label: "Member Id", value: toDisplayValue(selectedSummaryEntry.clientId ?? selectedSummaryEntry.memberId) },
  ];

  const summaryAddresses = Array.isArray(selectedSummaryEntry.address)
    ? (selectedSummaryEntry.address as Array<Record<string, unknown>>)
    : [];

  const permanentAddressFallback =
    summaryAddresses.find((item) => String(item.type ?? "").toLowerCase() === "permanent") ??
    summaryAddresses[0] ??
    {};

  const permanentAddressItems: GridItem[] = [
    { label: "Address Line 1", value: toDisplayValue(profile?.permanentAddressDetails?.addressLine1 ?? permanentAddressFallback.addressLine1) },
    { label: "Address Line 2", value: toDisplayValue(profile?.permanentAddressDetails?.addressLine2 ?? permanentAddressFallback.addressLine2) },
    { label: "Landmark", value: toDisplayValue(profile?.permanentAddressDetails?.landmark ?? permanentAddressFallback.landmark) },
    { label: "City", value: toDisplayValue(profile?.permanentAddressDetails?.city ?? permanentAddressFallback.city) },
    { label: "State", value: toDisplayValue(profile?.permanentAddressDetails?.state ?? permanentAddressFallback.state) },
    {
      label: "Country of Residence",
      value: toDisplayValue(profile?.permanentAddressDetails?.country ?? permanentAddressFallback.residingCountry),
    },
    { label: "Pincode", value: toDisplayValue(profile?.permanentAddressDetails?.pincode ?? permanentAddressFallback.pinCode) },
  ];

  const fallbackNominees = Array.isArray(selectedSummaryEntry?.nominee)
    ? selectedSummaryEntry.nominee
    : [];
  const fallbackAppointees = Array.isArray(selectedSummaryEntry?.appointee)
    ? selectedSummaryEntry.appointee
    : [];

  const nominees: FormalNomineeRow[] =
    profile?.nominees && profile.nominees.length > 0
      ? profile.nominees.map((item) => ({
          nomineeName: toDisplayValue(item.nomineeName),
          nomineeDOB: toDisplayValue(item.nomineeDOB),
          gender: toDisplayValue(item.gender),
          relationship: toDisplayValue(item.relationship),
          sharePercentage: Number(item.sharePercentage ?? 0),
        }))
      : fallbackNominees.map((item) => ({
          nomineeName: toDisplayValue([item.firstName, item.lastName].filter(Boolean).join(" ")),
          nomineeDOB: toDisplayValue(formatDOB(item.dob)),
          gender: toDisplayValue(item.gender),
          relationship: toDisplayValue(item.proposerNomineeRelation),
          sharePercentage: Number(item.percentage ?? 0),
        }));

  const appointees: FormalAppointeeRow[] =
    profile?.nominees && profile.nominees.length > 0
      ? profile.nominees.map((item) => ({
          appointeeName: toDisplayValue(item.appointeeName),
          appointeeGender: toDisplayValue(item.appointeeGender),
          appointeeDOB: toDisplayValue(item.appointeeDOB),
          appointeeRelationship: toDisplayValue(item.appointeeRelationship),
        }))
      : fallbackAppointees.map((item) => ({
          appointeeName: toDisplayValue([item.firstName, item.lastName].filter(Boolean).join(" ")),
          appointeeGender: toDisplayValue(item.gender),
          appointeeDOB: toDisplayValue(formatDOB(item.dob)),
          appointeeRelationship: toDisplayValue(item.relationWithNominee),
        }));

  const visibleMemberSectionTabs = memberSectionTabs.filter(
    (tab) => tab.key !== "nominee" || nominees.length > 0 || appointees.length > 0,
  );
  const effectiveActiveSectionTab = visibleMemberSectionTabs.some((tab) => tab.key === activeSectionTab)
    ? activeSectionTab
    : "personalKyc";

  let content: React.ReactNode = (
    <>
      {nominees.length > 0 ? (
        <CustomTable<FormalNomineeRow>
          title="Nominee Details"
          columns={formalNomineeColumns}
          data={nominees}
        />
      ) : (
        <Typography sx={{ fontSize: "14px", fontWeight: 700 }}>
          No nominees have been selected
        </Typography>
      )}

      <Box sx={{ mt: 2 }}>
        {appointees.length > 0 ? (
          <CustomTable<FormalAppointeeRow>
            title="Appointee Details"
            columns={formalAppointeeColumns}
            data={appointees}
          />
        ) : (
          <Typography sx={{ fontSize: "14px", fontWeight: 700 }}>
            No appointees have been selected
          </Typography>
        )}
      </Box>
    </>
  );
  if (effectiveActiveSectionTab === "personalKyc") {
    content = (
      <Box sx={{ p: 2, borderRadius: 2, backgroundColor: "#F6F6F6" }}>
        <Typography sx={{ color: "#444", fontSize: "14px", fontWeight: 700, mb: 1 }}>
          Personal Details
        </Typography>
        <GridSection columns={6} items={personalItems} backgroundColor="transparent" />
      </Box>
    );
  } else if (effectiveActiveSectionTab === "contactAddress") {
    content = (
      <Box sx={{ p: 2, borderRadius: 2, backgroundColor: "#F6F6F6" }}>
        <Typography sx={{ color: "#444", fontSize: "14px", fontWeight: 700, mb: 1 }}>
          Permanent Address
        </Typography>
        <GridSection columns={3} items={permanentAddressItems} backgroundColor="transparent" />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      {roleType === "DVT_FORMAL_TASK" && onEdit && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", mt: 0.5 }}>
          <CustomButton
            variant="outlined"
            onClick={onEdit}
            sx={{ borderRadius: "50px", paddingX: "24px" }}
          >
            Edit
          </CustomButton>
        </Box>
      )}
      <Box sx={{ display: "flex", justifyContent: "center", my: 1, width: "100%" }}>
        <CustomTabs
          tabs={visibleMemberSectionTabs}
          value={effectiveActiveSectionTab}
          onChange={setActiveSectionTab}
        />
      </Box>

      {showRiskAnalytics && riskCards.length > 0 && (
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#2b2b2b", mb: 1.5, lineHeight: 1.2 }}>
            Risk Analytics
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              width: "100%",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
            }}
          >
            {riskCards.map((item) => {
              const statusColor = item.isHealthy ? "#3AAE42" : "#D32F2F";
              return (
                <Box
                  key={item.key}
                  sx={{
                    width: "100%",
                    border: "1px solid #dfdfdf",
                    borderLeft: `3px solid ${statusColor}`,
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1f1f1f", lineHeight: 1.2 }}>
                      {item.label}
                    </Typography>
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `1.5px solid ${statusColor}`,
                        color: statusColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      {item.isHealthy ? "✓" : "!"}
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      display: "inline-flex",
                      borderRadius: "999px",
                      border: "1px solid #dddddd",
                      backgroundColor: "#f2f2f2",
                      px: 1.5,
                      py: 0.4,
                      fontSize: "13px",
                      color: "#4a4a4a",
                    }}
                  >
                    {item.subLabel}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {content}
    </Box>
  );
};

export default FormalMemberProfile;
