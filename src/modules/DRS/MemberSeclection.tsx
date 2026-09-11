import { Box, IconButton, SvgIcon, Tooltip, Typography } from "@mui/material";
import { useState, type KeyboardEvent, type ReactNode } from "react";

import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

import CustomDialog from "../../components/ui/Dialog/Dialog";
//import { KeyRightArrowIcon } from "../../icons/Icons";
//import Decision from "./DRS_Accordions/decision";

type UnknownRecord = Record<string, unknown>;

interface MemberSelectionProps {
  applicationNumber?: string;
  source?: unknown;
  onMemberSelect: (memberIndex: number) => void;
  stickyTop?: number | string;
  uwDecision?: ReactNode;
}

interface DisplayMember {
  index: number;
  key: string;
  type: string;
  name: string;
  demographics: string[];
  decision: string;
  details: Array<[string, string]>;
}

interface RiderSummary {
  key: string;
  name: string;
  sumAssured: string;
  policyTerm: string;
  premiumTerm: string;
  premium: string;
}

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const hasValue = (value: unknown): boolean =>
  value !== undefined &&
  value !== null &&
  String(value).trim() !== "";

const firstValue = (...values: unknown[]): unknown =>
  values.find(hasValue);

const displayText = (...values: unknown[]): string => {
  const value = firstValue(...values);
  return hasValue(value) ? String(value).trim() : "-";
};

const currency = (...values: unknown[]): string => {
  const value = firstValue(...values);

  if (!hasValue(value)) {
    return "-";
  }

  const rawValue = String(value).trim();
  const numericValue = Number(rawValue.replace(/,/g, ""));

  if (!Number.isFinite(numericValue)) {
    return rawValue.startsWith("₹") ? rawValue : `₹${rawValue}`;
  }

  return `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(numericValue)}`;
};

const formatMemberType = (value: unknown, index: number): string => {
  const memberType = String(value ?? "").trim();

  if (!memberType) {
    return `Member ${index + 1}`;
  }

  const lifeAssuredMatch = memberType.match(/^life\s*assured\s*(\d+)$/i) ??
    memberType.match(/^lifeassured(\d+)$/i);

  if (lifeAssuredMatch) {
    return `Life Assured ${lifeAssuredMatch[1]}`;
  }

  if (/^proposer$/i.test(memberType)) {
    return "Proposer";
  }

  return memberType
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getFullName = (member: UnknownRecord): string => {
  const personal = {
    ...toRecord(member.applicantDetails),
    ...toRecord(member.personalDetails),
    ...toRecord(member.personalSummary),
    ...toRecord(member.proposerSummary),
  };

  const directName = firstValue(
    member.fullName,
    member.applicantName,
    member.name,
    personal.fullName,
    personal.applicantName,
  );

  if (hasValue(directName)) {
    return String(directName).trim();
  }

  const name = [
    personal.firstName,
    personal.middleName,
    personal.lastName,
  ]
    .filter(hasValue)
    .map(String)
    .join(" ")
    .trim();

  return name || "-";
};

const getAddressCity = (member: UnknownRecord): string => {
  const addresses = Array.isArray(member.address)
    ? member.address.map(toRecord)
    : [];
  const communicationAddress = addresses.find(
    (address) => String(address.type ?? "").toLowerCase() === "communication",
  );
  const permanentAddress = addresses.find(
    (address) => String(address.type ?? "").toLowerCase() === "permanent",
  );

  return displayText(
    communicationAddress?.city,
    toRecord(member.communicationAddressDetails).city,
    permanentAddress?.city,
    toRecord(member.permanentAddressDetails).city,
  );
};

// Temporary UI demo data. Set to false to display the API UW decisions again.
const USE_DUMMY_UW_DECISIONS = true;
const DUMMY_UW_DECISIONS: Record<string, UnknownRecord> = {
  lifeassured1: {
    caseUWDecision: "Refer to HOD",
    decision: "Refer to HOD",
    remarks: "Referred to HOD for review and counter sign of the underwriting decision.",
    outlier: "Medical history requires senior underwriting review",
    fullName: "Amit Shah (Demo HOD)",
    ntid: "demo.hod",
    decisionType: "counterSign",
    hodReason: "Approval required beyond the underwriter's authority limit",
    firstUwDecision: "Standard",
    firstUwDecisionCode: "STD",
    firstUwSmokerStatus: "Non Smoker",
  },
  lifeassured2: {
    caseUWDecision: "Decline",
    decision: "Decline",
    remarks: "Declined based on adverse medical findings.",
    outlier: "Elevated HbA1c",
    decisionCode: "XXR",
    declineReason: "High than normal level of sugar as per Hemoglobin A1c test",
  },
  proposer: {
    caseUWDecision: "Standard",
    decision: "Standard",
    remarks: "Accepted at standard rates after underwriting review.",
    outlier: "None",
    decisionCode: "STD",
    smokerStatus: "Non Smoker",
  },
};

const withDummyUwDecision = (member: UnknownRecord): UnknownRecord => {
  const memberType = String(member.memberType ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const dummy = DUMMY_UW_DECISIONS[memberType];
  if (!USE_DUMMY_UW_DECISIONS || !dummy) return member;
  // Keep demo decisions self-contained so old API fields cannot leak into the modal.
  return { memberType: member.memberType, uwDecision: dummy };
};

// Resolve only this member's saved UW data; BRE is not a UW selection.
const getUwData = (member: UnknownRecord): UnknownRecord => ({
  ...toRecord(member.underwriting),
  ...member,
  ...toRecord(member.uwDecision),
});

const masterEntries = (value: unknown): UnknownRecord[] => {
  if (Array.isArray(value)) return value.flatMap(masterEntries);
  const record = toRecord(value);
  return [record, ...Object.values(record)
    .filter((item) => item !== null && typeof item === "object")
    .flatMap(masterEntries)];
};

const decisionText = (value: unknown, masters: UnknownRecord[], reason = false): string => {
  if (Array.isArray(value)) return value.map((item) => decisionText(item, masters, reason)).filter((item) => item !== "-").join(", ") || "-";
  if (value !== null && typeof value === "object") {
    const item = toRecord(value);
    return decisionText(firstValue(item.description, item.label, item.fullName, item.value, item.code, item.iibCode), masters, reason);
  }
  if (!hasValue(value)) return "-";
  const raw = String(value).trim();
  const match = masters.find((item) =>
    (reason ? [item.iibCode] : [item.code, item.key, item.value])
      .some((key) => hasValue(key) && String(key).trim() === raw));
  return displayText(match?.description, match?.label, raw);
};

const getMemberDecision = (member: UnknownRecord, masters: UnknownRecord[]): string => {
  const uw = getUwData(member);
  return decisionText(firstValue(uw.caseUWDecision, uw.decision,
    typeof member.uwDecision === "string" ? member.uwDecision : undefined,
    uw.status), masters);
};

const getDecisionDetails = (member: UnknownRecord, masters: UnknownRecord[]): Array<[string, string]> => {
  const uw = getUwData(member);
  const decision = getMemberDecision(member, masters);
  const normalize = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const kind = normalize(decision);
  const rows: Array<[string, string]> = [["Case UW Decision", decision]];
  const add = (label: string, value: unknown, reason = false) => rows.push([label, decisionText(value, masters, reason)]);
  const optional = (label: string, value: unknown, reason = false) => { if (hasValue(value)) add(label, value, reason); };
  if (!["RAISEREQUIREMENT", "RAISEREQ"].includes(kind)) add("Outlier", uw.outlier);
  const terminal = (type: string, first = false) => {
    const prefix = first ? "1st UW " : "";
    if (["STANDARD", "STD", "ACCEPT", "ACCEPTED", "BORDERLINESTANDARD", "BORSTD", "DECLINE", "REJECT", "POSTPONE", "COUNTEROFFER"].includes(type)) {
      rows.push([`${prefix}Decision Code`, displayText(first ? uw.firstUwDecisionCode : uw.decisionCode)]);
    }
    if (["STANDARD", "STD", "ACCEPT", "ACCEPTED"].includes(type)) {
      add(`${prefix}Smoker Status`, first ? uw.firstUwSmokerStatus : firstValue(uw.smokerStatus, toRecord(member.healthDetail).smokerStatus, toRecord(member.healthDetail).smoker_status));
    }
    const reasons: Record<string, [string, unknown]> = {
      DECLINE: ["Decline Reason", firstValue(uw.declineReasons, uw.declineReason)],
      REJECT: ["Reject Reason", firstValue(uw.rejectReason, uw.rejectReasons)],
      BORDERLINESTANDARD: ["Borderline Standard Reason", uw.borderlineStandardReasons],
      BORSTD: ["Borderline Standard Reason", uw.borderlineStandardReasons],
      COUNTEROFFER: ["Counter Offer Reason", uw.counterOfferReasons],
      POSTPONE: ["Postpone Reason", uw.postponeReason],
    };
    if (reasons[type]) add(`${prefix}${reasons[type][0]}`, firstValue(reasons[type][1], first ? uw.firstUwReason : firstValue(uw.reason, uw.decisionReason)), true);
    if (type === "POSTPONE") add("Postponement Period", uw.postponementPeriod);
  };
  terminal(kind);
  if (kind.startsWith("REFER")) {
    const labels: Record<string, string> = {
      REFERTOHOD: "Name of HoD", REFERTOSRUW: "Name of Sr.UW",
      REFERTOHOCMO: "Name of HO CMO", REFERTOCMO: "Name of CMO",
      REFERTORISK: "Risk Referral Reasons", REFERTOREINSURER: "Reinsurer Referral reasons",
    };
    add(labels[kind] || "Approver", firstValue(uw.fullName, uw.referralValue, uw.ntid));
    optional("Decision Type", uw.decisionType === "opinion" ? "Opinion" : uw.decisionType === "counterSign" ? "Counter Sign" : uw.decisionType);
    optional("HOD Reasons", uw.hodReason);
    optional("Sr UW Reasons", uw.srUwReason);
    optional("Referral Reason", uw.referralReason);
    optional("Parallel UW Decision", uw.parallelDecision);
    optional("Parallel Approver", firstValue(uw.parallelFullName, uw.parallelNtid));
    optional("Parallel Referral Reason", uw.parallelReferralReason);
    if (hasValue(uw.firstUwDecision)) {
      const firstDecision = decisionText(uw.firstUwDecision, masters);
      add("1st UW Decision", firstDecision);
      terminal(normalize(firstDecision), true);
    }
  }
  if (kind === "HOLD") add("Hold Reasons", firstValue(uw.holdReasons, uw.reason));
  optional("Waiver Justification", uw.waiverJustificationReason);
  optional("Waiver Justification Remarks", uw.waiverJustificationRemarks);
  return rows;
};

const getDecisionTone = (decision: string) => {
  const normalizedDecision = decision.toUpperCase();

  if (/(NON[- ]?STP|DECLIN|REJECT|DC)/.test(normalizedDecision)) {
    return { background: "#FDEBEC", border: "#F2C4C7", text: "#B3262E" };
  }

  if (/(STP|STANDARD|APPROV|ACCEPT)/.test(normalizedDecision)) {
    return { background: "#EEF8F1", border: "#B8DCC0", text: "#28743C" };
  }

  if (/(REFER|REVIEW|PENDING|TUW|RM)/.test(normalizedDecision)) {
    return { background: "#FFF3E0", border: "#F1C97C", text: "#9A6200" };
  }

  return { background: "#F4F3F2", border: "#DED9D6", text: "#665D58" };
};

const MEMBER_TONES = [
  { background: "#FFF0E8", border: "#F2C9B5", text: "#B54A00" },
  { background: "#F4F0FF", border: "#D9CCF2", text: "#6C4AA0" },
  { background: "#EAF5FB", border: "#BEDBEA", text: "#2F668F" },
];

const CompactField = ({ label, value }: { label: string; value: string }) => (
  <Box
    sx={{
      minWidth: 0,
      p: 0.7,
      border: "1px solid #E4DEDB",
      borderRadius: 1,
      bgcolor: "#FFFFFF",
    }}
  >
    <Typography sx={{ color: "#827671", fontSize: 9 }}>
      {label}
    </Typography>
    <Typography
      sx={{
        mt: 0.25,
        color: "#332D2A",
        fontSize: 11,
        fontWeight: 800,
        overflowWrap: "anywhere",
      }}
    >
      {value}
    </Typography>
  </Box>
);

const MemberSelection = ({
  applicationNumber,
  source,
  onMemberSelect,
  stickyTop = 0,
}: MemberSelectionProps) => {
  const [selectedDecisionIndex, setSelectedDecisionIndex] = useState<number | null>(null);
  const masters = masterEntries(useSelector((state: RootState) => state.drs.masters));
  const [riderDialogOpen, setRiderDialogOpen] = useState(false);
  const data = toRecord(source);
  const applicationOverview = toRecord(data.applicationOverview);
  const products = Array.isArray(applicationOverview.productDetail)
    ? applicationOverview.productDetail.map(toRecord)
    : [];
  const baseProduct =
    products.find(
      (product) => String(product.type ?? "").toLowerCase() === "base",
    ) ?? products[0] ?? applicationOverview;
  const riderRecords = Array.isArray(applicationOverview.riderDetails)
    ? applicationOverview.riderDetails.map(toRecord)
    : products.filter(
        (product) => String(product.type ?? "").toLowerCase() === "rider",
      );

  const riders: RiderSummary[] = riderRecords
    .map((rider, index) => ({
      key: displayText(rider.id, rider.productCode, `${index}`),
      name: displayText(rider.name, rider.riderName, rider.productName),
      sumAssured: currency(rider.sumAssured, rider.tsa, rider.appliedSA),
      policyTerm: displayText(rider.policyTerm, rider.term),
      premiumTerm: displayText(
        rider.premiumPaymentTerm,
        rider.ppt,
        rider.premiumTerm,
      ),
      premium: currency(rider.premium, rider.annualPremium),
    }))
    .filter((rider) => rider.name !== "-");

  const members: DisplayMember[] = (Array.isArray(data.summary)
    ? data.summary.map(toRecord)
    : []
  ).map((member, index) => {
    const personal = {
      ...toRecord(member.applicantDetails),
      ...toRecord(member.personalDetails),
      ...toRecord(member.personalSummary),
      ...toRecord(member.proposerSummary),
    };
    const finance = {
      ...toRecord(member.financialDetails),
      ...toRecord(member.applicantFinancialDetails),
    };
    const decisionMember = withDummyUwDecision(member);
    const age = toRecord(personal.age).years;
    const demographics = [
      hasValue(age) ? `${age} yrs` : null,
      firstValue(personal.gender),
      firstValue(personal.highestQualification, personal.education),
      firstValue(finance.occupation, personal.occupationType),
      hasValue(finance.annualIncome)
        ? `${currency(finance.annualIncome)} p.a.`
        : null,
      getAddressCity(member) === "-" ? null : getAddressCity(member),
    ]
      .filter(hasValue)
      .map(String);

    return {
      index,
      key: displayText(member.partyId, member.clientId, `${index}`),
      type: formatMemberType(member.memberType, index),
      name: getFullName(member),
      demographics,
      decision: getMemberDecision(decisionMember, masters),
      details: getDecisionDetails(decisionMember, masters),
    };
  });

  const selectedDecision = members.find((member) => member.index === selectedDecisionIndex) ?? null;

  const resolvedApplicationNumber = displayText(
    applicationNumber,
    data.applicationNumber,
    data.applicationNo,
    applicationOverview.applicationNumber,
    applicationOverview.applicationNo,
  );
  const productName = displayText(
    baseProduct.productName,
    baseProduct.name,
    applicationOverview.productName,
    applicationOverview.product,
  );
  const sumAssured = currency(
    baseProduct.sumAssured,
    baseProduct.appliedSA,
    applicationOverview.sumAssured,
    applicationOverview.appliedSa,
  );
  const channel = displayText(applicationOverview.channel, data.channel, "Agency");

  const parameters = [
    "TSA - ₹10,00,000",
    "TRSA - ₹5,00,000",
    "TPSA - ₹10,00,000",
    "TFSA - ₹10,00,000",
    "TSSA - ₹10,00,000",
    "ADBR TSA - ₹5,00,000",
    "ATPD TSA - ₹5,00,000",
    "CI Rider TSA - ₹3,00,000",
    "CI Rider TRSA - ₹3,00,000",
    "WOP TSA - ₹10,00,000",
    "BTBB TSA - ₹5,00,000",
    "Total Premium - ₹10,000"
  ]
    .filter((value) => value !== "-")
    .join(" / ");

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    memberIndex: number,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onMemberSelect(memberIndex);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        position: "relative",
        isolation: "isolate",
      }}
    >
      {/* Sticky relative to the page scroll area, not the browser viewport. */}
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          px: 0.5,
          py: 0.75,
          position: { xs: "static", md: "sticky" },
          top: { md: stickyTop },
          zIndex: { xs: "auto", md: 10 },
          alignSelf: "flex-start",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            width: "100%",
            boxSizing: "border-box",
            bgcolor: "#FFEAD7",
            color: "#000000",
            borderLeft: "1px solid #E45F14",
            borderRadius: "0 0 12px 0",
            // Reserve the 48px applicant photo slot plus its 12px gap.
            pl: { xs: "calc(12px + 60px)", sm: "calc(17.6px + 60px)" },
            pr: { xs: 1.5, sm: 2.2 },
            py: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "nowrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              minWidth: 0,
              pt: 0.5,
            }}
          >
            <Typography
              sx={{
                flex: "1 1 0",
                minWidth: 0,
                fontSize: { xs: 10, sm: 11.5 },
                lineHeight: 1.65,
                fontWeight: 700,
                overflowWrap: "anywhere",
              }}
            >
              <Box component="span" sx={{ fontWeight: 800 }}>Product:</Box>{" "}
              {productName} / <Box component="span" sx={{ fontWeight: 800 }}>Channel:</Box>{" "}
              {channel} / SA - {sumAssured}
            </Typography>
            <Typography
              sx={{
                flexShrink: 0,
                px: 1.5,
                py: 0.5,
                border: "1px solid #EAD8D1",
                borderRadius: "999px",
                bgcolor: "#FFFFFF",
                color: "#B71C2C",
                fontSize: { xs: 12, sm: 14 },
                fontWeight: 800,
                lineHeight: 1.4,
                whiteSpace: "nowrap",
              }}
            >
              App No. - {resolvedApplicationNumber}
            </Typography>
          </Box>
          <Typography
            sx={{
              mt: 0.45,
              fontSize: { xs: 10, sm: 11.5 },
              lineHeight: 1.65,
              fontWeight: 500,
              overflowWrap: "anywhere",
            }}
          >
            <Box component="span" sx={{ fontWeight: 800 }}>Riders:</Box>{" "}
            {riders.length > 0
              ? riders.map((rider) => `${rider.name} - SA ${rider.sumAssured}`).join(" / ")
              : "No riders"}
          </Typography>
          <Typography
            sx={{
              mt: 0.45,
              fontSize: { xs: 10, sm: 11.5 },
              lineHeight: 1.65,
              fontWeight: 500,
              overflowWrap: "anywhere",
            }}
          >
            <Box component="span" sx={{ fontWeight: 800, mr: 1 }}>
              Eligibility Parameters:
            </Box>
            {parameters}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          mx: 0.5,
          mt: 0,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr",
          },
          gap: 1,
          alignItems: "start",
        }}
      >
      <Box
        sx={{
          overflow: "hidden",
          border: "1px solid #E4DEDA",
          borderRadius: "12px",
          bgcolor: "#FFFFFF",
          boxShadow: "0 4px 16px rgba(54, 45, 40, 0.06)",
        }}
      >
        <Box sx={{ px: { xs: 1.25, md: 1.75 }, py: 1.1, borderBottom: "1px solid #EAE4E1" }}>
          <Typography sx={{ color: "#292421", fontSize: 13, fontWeight: 900 }}>
            Select Member
          </Typography>
          <Typography sx={{ mt: 0.15, color: "#817773", fontSize: 9.5 }}>
            {members.length} members are available in this application
          </Typography>
        </Box>

        <Box
          sx={{
            display: { xs: "none", md: "grid" },
            gridTemplateColumns: "150px 220px minmax(0,1fr) 150px 34px",
            gap: 1,
            px: 1.75,
            py: 0.75,
            bgcolor: "#F7F5F4",
            color: "#8A817C",
          }}
        >
          {["Life", "Name", "Details", "UW Decision", ""].map((heading) => (
            <Typography
              key={heading || "action"}
              sx={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.4 }}
            >
              {heading}
            </Typography>
          ))}
        </Box>

        {members.map((member, rowIndex) => {
          const memberTone = MEMBER_TONES[rowIndex % MEMBER_TONES.length];
          const decisionTone = getDecisionTone(member.decision);

          return (
            <Box
              key={member.key}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0,1fr) 34px",
                  md: "minmax(0,1fr) 150px 34px",
                },
                gap: { xs: 0.75, md: 1 },
                alignItems: "center",
                px: { xs: 1.25, md: 1.75 },
                py: 1,
                borderBottom:
                  rowIndex < members.length - 1 ? "1px solid #EEE9E6" : 0,
                cursor: "default",
                transition: "background-color .15s ease, transform .15s ease",
                outline: "none",
                "&:hover": { bgcolor: "#FFF9F5" },
                "&:focus-visible": {
                  bgcolor: "#FFF4EC",
                  boxShadow: "inset 3px 0 0 #E45F14",
                },
              }}
            >
              <Box
              role="button"
              tabIndex={0}
              aria-label={`Open ${member.type} ${member.name}`}
              onClick={() => onMemberSelect(member.index)}
              onKeyDown={(event) => handleRowKeyDown(event, member.index)}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "150px 220px minmax(0,1fr)" },
                  gridColumn: { xs: "1 / -1", md: "auto" },
                  gap: 1,
                  alignItems: "center",
                  minWidth: 0,
                  alignSelf: "stretch",
                  cursor: "pointer",
                  borderRadius: 1,
                  "&:focus-visible": { outline: "2px solid #E45F14", outlineOffset: 2 },
                }}
              >
              <Box
                sx={{
                  width: "fit-content",
                  minWidth: { xs: 112, md: 120 },
                  px: 1,
                  py: 0.45,
                  border: `1px solid ${memberTone.border}`,
                  borderRadius: "16px",
                  bgcolor: memberTone.background,
                  color: memberTone.text,
                  textAlign: "center",
                }}
              >
                <Typography sx={{ fontSize: 9, fontWeight: 900 }}>
                  {member.type}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  title={member.name}
                  sx={{
                    color: "#292421",
                    fontSize: 11,
                    fontWeight: 900,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {member.name}
                </Typography>
                <Typography sx={{ display: { md: "none" }, mt: 0.25, color: "#756D69", fontSize: 9 }}>
                  {member.demographics.join(" / ") || "Details unavailable"}
                </Typography>
              </Box>

              <Typography
                sx={{
                  display: { xs: "none", md: "block" },
                  minWidth: 0,
                  color: "#5C514C",
                  fontSize: 9.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {member.demographics.join(" / ") || "Details unavailable"}
              </Typography>

              </Box>

              <Box
                sx={{
                  width: "fit-content",
                  maxWidth: "100%",
                  px: 1,
                  py: 0.45,
                  border: `1px solid ${decisionTone.border}`,
                  borderRadius: "16px",
                  bgcolor: decisionTone.background,
                  color: decisionTone.text,
                }}
              >
                <Typography
                  title={member.decision}
                  sx={{
                    fontSize: 9,
                    fontWeight: 900,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {member.decision}
                </Typography>
              </Box>

              <Tooltip title="View UW decision details">
                <IconButton
                  size="small"
                  aria-label={`View UW decision details for ${member.type} ${member.name}`}
                  aria-haspopup="dialog"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedDecisionIndex(member.index);
                  }}
                  sx={{ color: "#A92129", "&:hover": { bgcolor: "#FFEAD7" } }}
                >
                  <SvgIcon fontSize="small">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            </Box>
          );
        })}
      </Box>

      </Box>

      <CustomDialog
        open={selectedDecision !== null}
        onClose={() => setSelectedDecisionIndex(null)}
        title=" "
        maxWidth="sm"
        fullWidth
      >
        {selectedDecision && (
          <Box sx={{ display: "grid", gap: 1 }}>
            <Typography sx={{ bgcolor: "#E45F14", color: "#FFFFFF", p: 1, borderRadius: 1, fontSize: 13, fontWeight: 800 }}>
              UW Decision — {selectedDecision.type}
            </Typography>
            <Typography sx={{ color: "#5C514C", fontSize: 12 }}>
              {selectedDecision.name}
            </Typography>
            <Box sx={{ display: "grid", gap: 1.5, p: 1.5, border: "1px solid #E5E0DD", borderRadius: "8px", bgcolor: "#FBF8F6" }}>
              {selectedDecision.details.map(([label, value]) => (
                <Box key={label} sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(110px, 0.8fr) minmax(0, 1.2fr)", sm: "minmax(160px, 0.8fr) minmax(0, 1.2fr)" }, gap: 1.5, alignItems: "center" }}>
                  <Typography sx={{ fontSize: 12, color: "#827671" }}>{label}</Typography>
                  <Typography sx={{ fontSize: 13, color: "#292421", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CustomDialog>

      <CustomDialog
        open={riderDialogOpen}
        onClose={() => setRiderDialogOpen(false)}
        title="Rider Details"
        maxWidth="lg"
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" },
            gap: 0.8,
            minWidth: { xs: "auto", md: 720 },
          }}
        >
          {riders.map((rider) => (
            <Box
              key={rider.key}
              sx={{
                p: 0.9,
                border: "1px solid #E4DEDB",
                borderLeft: "4px solid #A92129",
                borderRadius: 1.1,
                bgcolor: "#FAF8F7",
              }}
            >
              <Typography
                sx={{ color: "#332D2A", fontSize: 12, fontWeight: 900 }}
              >
                {rider.name}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0.7,
                  mt: 0.75,
                }}
              >
                <CompactField label="Sum assured" value={rider.sumAssured} />
                <CompactField label="Premium" value={rider.premium} />
                <CompactField label="Policy term" value={rider.policyTerm} />
                <CompactField label="Premium term" value={rider.premiumTerm} />
              </Box>
            </Box>
          ))}
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default MemberSelection;
