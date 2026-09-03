import { Box, Typography } from "@mui/material";
import { useState, type KeyboardEvent, type ReactNode } from "react";

import CustomDialog from "../../components/ui/Dialog/Dialog";
import { KeyRightArrowIcon } from "../../icons/Icons";
//import Decision from "./DRS_Accordions/decision";
//import UWDecision from "./DRS_Accordions/UWDecision";

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

const getMemberDecision = (member: UnknownRecord): string => {
  const underwriting = toRecord(member.underwriting);
  const breDecision = toRecord(underwriting.breDecision);
  const uwDecision = toRecord(member.uwDecision);

  return displayText(
    uwDecision.decision,
    uwDecision.status,
    typeof member.uwDecision === "string" ? member.uwDecision : undefined,
    member.decision,
    breDecision.category,
    breDecision.status,
    underwriting.decision,
    toRecord(member.proposerSummary).caseStatus,
  );
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
  uwDecision,
}: MemberSelectionProps) => {
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
      decision: getMemberDecision(member),
    };
  });

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
  const policyTerm = displayText(
    baseProduct.policyTerm,
    baseProduct.term,
    applicationOverview.policyTerm,
  );
  const premiumTerm = displayText(
    baseProduct.premiumPaymentTerm,
    baseProduct.ppt,
    applicationOverview.premiumPaymentTerm,
  );
  const sumAssured = currency(
    baseProduct.sumAssured,
    baseProduct.appliedSA,
    applicationOverview.sumAssured,
    applicationOverview.appliedSa,
  );
  const tsa = currency(
    baseProduct.tsa,
    baseProduct.totalSumAssured,
    applicationOverview.tsa,
    applicationOverview.totalSumAssured,
  );
  const tfsa = currency(
    baseProduct.tfsa,
    baseProduct.totalFaceSumAssured,
    applicationOverview.tfsa,
    applicationOverview.totalFaceSumAssured,
  );
  const tssa = currency(
    baseProduct.tssa,
    baseProduct.totalSumAssuredAdditional,
    applicationOverview.tssa,
    applicationOverview.totalSumAssuredAdditional,
  );
  const tpsa = currency(
    baseProduct.tpsa,
    baseProduct.totalPremiumSumAssured,
    applicationOverview.tpsa,
    applicationOverview.totalPremiumSumAssured,
  );
  const coverageItems = [
    `SA - ${sumAssured}`,
    tsa !== "-" ? `TSA - ${tsa}` : null,
    tfsa !== "-" ? `TFSA - ${tfsa}` : null,
    tssa !== "-" ? `TSSA - ${tssa}` : null,
    tpsa !== "-" ? `TPSA - ${tpsa}` : null,
  ].filter(Boolean) as string[];

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
            bgcolor: "#FFEAD7",
            color: "#000000",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 3px 10px rgba(169, 33, 41, 0.16)",
          }}
        >
          <Box
            sx={{
              minWidth: 0,
              px: { xs: 1.2, sm: 2.2 },
              py: { xs: 1, sm: 1.45 },
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                alignItems: "start",
                gap: { xs: 0.75, sm: 1.25 },
              }}
            >
              <Typography
                sx={{
                  minWidth: 0,
                  color: "#000000",
                  fontSize: { xs: 10, sm: 11.5 },
                  lineHeight: 1.65,
                  fontWeight: 800,
                  overflowWrap: "anywhere",
                }}
              >
                Product:{" "}
                <Box component="span" sx={{ color: "#000000", fontWeight: 700 }}>
                  {productName}
                </Box>
                {" / "}
                Policy Term:{" "}
                <Box component="span" sx={{ color: "#000000", fontWeight: 700 }}>
                  {policyTerm}
                </Box>
                {" / "}
                Premium Term:{" "}
                <Box component="span" sx={{ color: "#000000", fontWeight: 700 }}>
                  {premiumTerm}
                </Box>
                {coverageItems.map((item) => (
                  <Box
                    component="span"
                    key={item}
                    sx={{ color: "#000000", fontWeight: 700 }}
                  >
                    {" / "}
                    {item}
                  </Box>
                ))}
              </Typography>

              <Typography
                sx={{
                  flexShrink: 0,
                  px: 1.1,
                  py: 0.45,
                  borderRadius: "16px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid rgba(169,33,41,.18)",
                  color: "#A92129",
                  fontSize: { xs: 11, sm: 13 },
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                }}
              >
                App No. - OB90377122
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 0.45,
                display: "flex",
                alignItems: "flex-start",
                gap: 0.35,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  color: "#000000",
                  fontSize: { xs: 10, sm: 11.5 },
                  lineHeight: 1.65,
                  fontWeight: 800,
                }}
              >
                Riders:
              </Typography>

              {riders.length > 0 ? (
                <Typography
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    color: "#000000",
                    fontSize: { xs: 10, sm: 11.5 },
                    lineHeight: 1.65,
                    fontWeight: 600,
                    overflowWrap: "anywhere",
                  }}
                >
                  {riders.map((rider, index) => (
                    <Box component="span" key={rider.key}>
                      {rider.name} - SA {rider.sumAssured}
                      {index < riders.length - 1 ? " / " : ""}
                    </Box>
                  ))}
                </Typography>
              ) : (
                <Typography
                  sx={{
                    color: "#000000",
                    fontSize: { xs: 10, sm: 11.5 },
                    lineHeight: 1.65,
                    fontWeight: 600,
                  }}
                >
                  No riders
                </Typography>
              )}

              {/* {riders.length > 0 && (
                <Box
                  component="button"
                  type="button"
                  onClick={() => setRiderDialogOpen(true)}
                  sx={{
                    border: 0,
                    p: 0,
                    ml: 0.5,
                    mt: 0.15,
                    bgcolor: "transparent",
                    color: "#A92129",
                    fontSize: 9,
                    fontWeight: 900,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  View details <KeyRightArrowIcon />
                </Box>
              )} */}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          mx: 0.5,
          mt: 0,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: uwDecision ? "minmax(0, 1fr) 300px" : "1fr",
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
              role="button"
              tabIndex={0}
              aria-label={`Open ${member.type} ${member.name}`}
              onClick={() => onMemberSelect(member.index)}
              onKeyDown={(event) => handleRowKeyDown(event, member.index)}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0,1fr) auto",
                  md: "150px 220px minmax(0,1fr) 150px 34px",
                },
                gap: { xs: 0.75, md: 1 },
                alignItems: "center",
                px: { xs: 1.25, md: 1.75 },
                py: 1,
                borderBottom:
                  rowIndex < members.length - 1 ? "1px solid #EEE9E6" : 0,
                cursor: "pointer",
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

              <Typography
                aria-hidden="true"
                sx={{ color: "#A92129", fontSize: 22, fontWeight: 700, textAlign: "center" }}
              >
                ›
              </Typography>
            </Box>
          );
        })}
      </Box>

      {uwDecision && (
        <Box
          component="aside"
          sx={{
            minWidth: 0,
            overflow: "hidden",
            border: "1px solid #DED8D5",
            borderRadius: 1.5,
            bgcolor: "#FFFFFF",
            boxShadow: "0 2px 7px rgba(60, 42, 35, 0.07)",
          }}
        >
          <Box
            sx={{
              px: 1.15,
              py: 0.75,
              borderBottom: "1px solid #E9E3E0",
              bgcolor: "#E45F14",
            }}
          >
            <Typography
              sx={{
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: 900,
                lineHeight: 1.2,
              }}
            >
              UW Decision
            </Typography>
          </Box>

          {uwDecision}
        </Box>
      )}
      </Box>

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
