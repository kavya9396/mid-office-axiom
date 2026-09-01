import { Avatar, Box, Typography } from "@mui/material";
import { useState, type ReactNode } from "react";

import CustomAccordion from "../../components/ui/Accordion/Accordion";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import { KeyRightArrowIcon, UserProfileIcon } from "../../icons/Icons";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import { formatDate } from "../../utils/dataFormat";

interface ApplicantApplicationSummaryProps {
  readOnly?: boolean;
  showRiskAnalytics?: boolean;
  uwDecision?: ReactNode;
  quickLinks?: ReactNode;
  stickyTop?: number | string;
}

interface CaseSnapshotRowProps {
  breDecision: ReactNode;
  applicationOverview: ReactNode;
  applicantSummary?: ReactNode;
  riskAnalytics?: ReactNode;
  uwDecision?: ReactNode;
  quickLinks?: ReactNode;
  readOnly?: boolean;
  stickyTop?: number | string;
}

type UnknownRecord = Record<string, unknown>;
type RiskStatus = "clear" | "attention" | "unavailable";
type ApplicantDetailTab = "personal" | "kyc" | "financial";
type FieldConfig = readonly [key: string, label: string];

interface RiskDetail {
  key: string;
  label: string;
  value: unknown;
}

interface RiskCard {
  id: string;
  label: string;
  value: string;
  status: RiskStatus;
  details: RiskDetail[];
}

const MEDICAL_FIELDS: FieldConfig[] = [
  ["brePhysicalMedicalDecision", "Physical Medical Decision"],
  ["brePhysicalMedicalRemark", "Physical Medical Remark"],
  ["breTeleVideoMerDecision", "Tele/Video MER Decision"],
  ["breTeleVideoMerRemark", "Tele/Video MER Remark"],
  ["munichReMedicalDecision", "MunichRe Medical Decision"],
  ["munichReRating", "MunichRe Rating"],
  ["biuMedicalStatus", "BIU Medical Status"],
];

const FINANCIAL_FIELDS: FieldConfig[] = [
  ["breFinancialDecision", "Financial Decision"],
  ["breRemark", "Financial Remark"],
  ["financialEligibility", "Financial Eligibility"],
  ["derivedIncome", "Derived Income"],
  ["counterOfferValue", "Counter Offer Value"],
  ["additionalSA", "Additional SA"],
  ["biuFinancialStatus", "BIU Financial Status"],
];

const OTHER_RISK_FIELDS: FieldConfig[] = [
  ["ptlrResponse", "PTLR Response"],
  ["drcResponse", "DRC Response"],
  ["adverseIIB", "Adverse IIB"],
  ["criminalQuestionResponseLA", "Criminal Question Response LA"],
  ["pepQuestionResponseLA", "PEP Question Response LA"],
  ["criminalQuestionResponsePR", "Criminal Question Response PR"],
  ["pepQuestionResponsePR", "PEP Question Response PR"],
  ["previousPolicySubstandard", "Previous Policy Substandard"],
  ["avocationRelatedDisclosure", "Avocation Related Disclosure"],
  ["healthQuestionPositive", "Health Question Positive"],
  ["employmentInRiskyIndustry", "Employment In Risky Industry"],
  ["fatfOfacCountryLogin", "FATF/OFAC Country Login"],
  ["hazardousOccupation", "Hazardous Occupation"],
  ["eddFlag", "EDD Flag"],
  ["claimRiskIndicator", "Claim Risk Indicator"],
  ["faceMatchScore", "Face Match Score"],
  ["tobacco", "Tobacco"],
  ["narcotics", "Narcotics"],
];

const RISK_TONES: Record<
  RiskStatus,
  { background: string; border: string; text: string; label: string }
> = {
  clear: {
    background: "#EDF7F0",
    border: "#A9D4B3",
    text: "#26723A",
    label: "Clear",
  },
  attention: {
    background: "#FDEEEF",
    border: "#E7B8BC",
    text: "#B1262E",
    label: "Attention",
  },
  unavailable: {
    background: "#F3F2F1",
    border: "#DCD7D4",
    text: "#716A66",
    label: "No data",
  },
};

const panelSx = {
  minWidth: 0,
  height: "100%",
  p: 1.15,
  border: "1px solid #E5E0DD",
  borderRadius: 1.5,
  bgcolor: "#FFFFFF",
  boxShadow: "0 1px 4px rgba(55, 37, 31, 0.05)",
};

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const isNonEmptyRecord = (value: UnknownRecord): boolean =>
  Object.keys(value).length > 0;

const text = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const firstValue = (...values: unknown[]): unknown =>
  values.find((value) => value !== null && value !== undefined && value !== "");

const currency = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? `₹${new Intl.NumberFormat("en-IN").format(numericValue)}`
    : text(value);
};

const normalizeValue = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const parsePercentage = (value: unknown): number | null => {
  const normalizedValue = String(value ?? "")
    .replace("%", "")
    .trim();
  if (!normalizedValue) return null;

  const numericValue = Number.parseFloat(normalizedValue);
  return Number.isNaN(numericValue) ? null : numericValue;
};

const isYesValue = (value: unknown): boolean =>
  ["y", "yes", "true"].includes(normalizeValue(value));

const getFullName = (person: UnknownRecord): string =>
  [person.firstName, person.middleName, person.lastName]
    .filter(Boolean)
    .map(String)
    .join(" ") || "-";

const getAddress = (member: UnknownRecord): string => {
  const addresses = Array.isArray(member.address)
    ? member.address
    : isNonEmptyRecord(toRecord(member.address))
      ? [member.address]
      : [];
  const address = toRecord(addresses[0]);

  return (
    [address.city, address.state, address.residingCountry, address.pinCode]
      .filter(Boolean)
      .map(String)
      .join(" - ") || "-"
  );
};

const splitBreCodes = (value: unknown): string[] =>
  String(value ?? "")
    .split("#")
    .map((code) => code.trim())
    .filter(Boolean);

const getDecisionTone = (decision: string) => {
  const normalizedDecision = decision.trim().toUpperCase();

  if (!normalizedDecision || normalizedDecision === "-") {
    return { background: "#F3F1F0", border: "#DDD7D4", text: "#706763" };
  }

  if (
    ["ST", "STD", "STP", "STANDARD", "SUCCESS"].includes(normalizedDecision)
  ) {
    return { background: "#E8F5EC", border: "#B7DFC2", text: "#237A3B" };
  }

  if (
    ["DEC", "DECLINE", "DECLINED", "REJECT", "REJECTED"].some((value) =>
      normalizedDecision.includes(value),
    )
  ) {
    return { background: "#FDEBEC", border: "#F2C4C7", text: "#B3262E" };
  }

  if (
    ["TUW", "RM", "REFER", "REVIEW", "PENDING"].some((value) =>
      normalizedDecision.includes(value),
    )
  ) {
    return { background: "#FFF4DF", border: "#F1D394", text: "#9A6200" };
  }

  return { background: "#F7EEF0", border: "#E7CBCD", text: "#8D232A" };
};

const mapRiskDetails = (
  risk: UnknownRecord,
  fields: FieldConfig[],
): RiskDetail[] =>
  fields.map(([key, label]) => ({ key, label, value: risk[key] }));

const getMedicalRiskStatus = (risk: UnknownRecord): RiskStatus => {
  if (!isNonEmptyRecord(risk)) return "unavailable";

  const physical = normalizeValue(risk.brePhysicalMedicalDecision);
  const teleVideo = normalizeValue(risk.breTeleVideoMerDecision);
  const munichRe = normalizeValue(risk.munichReMedicalDecision);
  const biu = normalizeValue(risk.biuMedicalStatus);
  const needsAttention =
    (physical !== "" && physical !== "stp") ||
    (teleVideo !== "" && teleVideo !== "stp") ||
    (munichRe !== "" && !["standard1", "standard2"].includes(munichRe)) ||
    biu === "y";

  return needsAttention ? "attention" : "clear";
};

const getFinancialRiskStatus = (risk: UnknownRecord): RiskStatus => {
  if (!isNonEmptyRecord(risk)) return "unavailable";

  const decision = normalizeValue(risk.breFinancialDecision);
  const biu = normalizeValue(risk.biuFinancialStatus);
  return decision === "nonfstp" || biu === "y" ? "attention" : "clear";
};

const getOtherRiskStatus = (risk: UnknownRecord): RiskStatus => {
  if (!isNonEmptyRecord(risk)) return "unavailable";

  const ptlr = normalizeValue(risk.ptlrResponse);
  const drc = normalizeValue(risk.drcResponse);
  const faceMatchScore = parsePercentage(risk.faceMatchScore);
  const yesNoRiskFields = [
    "adverseIIB",
    "criminalQuestionResponseLA",
    "pepQuestionResponseLA",
    "criminalQuestionResponsePR",
    "pepQuestionResponsePR",
    "previousPolicySubstandard",
    "avocationRelatedDisclosure",
    "healthQuestionPositive",
    "employmentInRiskyIndustry",
    "fatfOfacCountryLogin",
    "hazardousOccupation",
    "eddFlag",
    "claimRiskIndicator",
    "tobacco",
    "narcotics",
  ];
  const needsAttention =
    ["deepred", "deepmaroon"].includes(ptlr) ||
    ["highrisk", "mediumrisk"].includes(drc) ||
    yesNoRiskFields.some((field) => isYesValue(risk[field])) ||
    (faceMatchScore !== null && faceMatchScore < 75);

  return needsAttention ? "attention" : "clear";
};

const getFirstRisk = (
  analyticsItems: UnknownRecord[],
  riskKey: string,
): UnknownRecord =>
  analyticsItems
    .map((item) => toRecord(item[riskKey]))
    .find(isNonEmptyRecord) ?? {};

const buildRiskCards = (applicant: UnknownRecord): RiskCard[] => {
  const riskAnalytics = applicant.riskAnalytics;
  const analyticsItems = Array.isArray(riskAnalytics)
    ? riskAnalytics.map(toRecord)
    : isNonEmptyRecord(toRecord(riskAnalytics))
      ? [toRecord(riskAnalytics)]
      : [];

  const medicalRisk = getFirstRisk(analyticsItems, "medicalRisk");
  const financialRisk = getFirstRisk(analyticsItems, "financialRisk");
  const otherRisk = getFirstRisk(analyticsItems, "otherRisk");

  return [
    {
      id: "medical",
      label: "Medical",
      value: text(
        firstValue(
          medicalRisk.brePhysicalMedicalDecision,
          medicalRisk.breTeleVideoMerDecision,
          medicalRisk.munichReMedicalDecision,
        ),
      ),
      status: getMedicalRiskStatus(medicalRisk),
      details: mapRiskDetails(medicalRisk, MEDICAL_FIELDS),
    },
    {
      id: "financial",
      label: "Financial",
      value: text(
        firstValue(
          financialRisk.breFinancialDecision,
          financialRisk.financialEligibility,
        ),
      ),
      status: getFinancialRiskStatus(financialRisk),
      details: mapRiskDetails(financialRisk, FINANCIAL_FIELDS),
    },
    {
      id: "other",
      label: "Other Risk",
      value: text(
        firstValue(
          otherRisk.ptlrResponse,
          otherRisk.drcResponse,
          otherRisk.faceMatchScore,
        ),
      ),
      status: getOtherRiskStatus(otherRisk),
      details: mapRiskDetails(otherRisk, OTHER_RISK_FIELDS),
    },
  ];
};

const SectionHeader = ({
  eyebrow,
  title,
  trailing,
}: {
  eyebrow: string;
  title: string;
  trailing?: ReactNode;
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 0.75,
      mb: 0.9,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          color: "#A92129",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: 0.8,
          lineHeight: 1.1,
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </Typography>
      {title && (
        <Typography
          title={title}
          sx={{
            mt: 0.25,
            color: "#302927",
            fontSize: 13,
            fontWeight: 850,
            lineHeight: 1.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
      )}
    </Box>
    {trailing}
  </Box>
);

const CompactField = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={{ color: "#8A7E79", fontSize: 8.5, lineHeight: 1.1 }}>
      {label}
    </Typography>
    <Typography
      title={value}
      sx={{
        mt: 0.15,
        color: "#403936",
        fontSize: 10.5,
        fontWeight: 750,
        lineHeight: 1.25,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
  </Box>
);

const StickyRailPanel = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) => (
  <Box
    sx={{
      minWidth: 0,
      overflow: "hidden",
      border: "1px solid #DDD6D2",
      borderRadius: 1.5,
      bgcolor: "#FFFFFF",
      boxShadow: "0 4px 14px rgba(55, 37, 31, 0.07)",
    }}
  >
    <Box
      sx={{
        px: 1.15,
        py: 0.85,
        borderBottom: "1px solid #EAE4E1",
        bgcolor: "#FAF7F5",
      }}
    >
      <Typography
        sx={{
          color: "#A92129",
          fontSize: 8.5,
          fontWeight: 900,
          letterSpacing: 0.8,
          lineHeight: 1.1,
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </Typography>
      <Typography
        sx={{
          mt: 0.25,
          color: "#302927",
          fontSize: 13,
          fontWeight: 850,
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
    </Box>
    <Box
      sx={{
        minWidth: 0,
        p: 0.8,
        "& > .MuiAccordion-root": {
          m: 0,
          boxShadow: "none",
        },
      }}
    >
      {children}
    </Box>
  </Box>
);

/**
 * Compact application/product summary shown directly under the applicant name.
 * This intentionally has no "Application Details" heading so the visual flow
 * matches the supplied reference image.
 */
const InlineApplicationDetails = ({
  productName,
  policyTerm,
  premiumTerm,
  sumAssured,
  tsa,
  riderSummaries,
  onOpenRiders,
}: {
  productName: string;
  policyTerm: string;
  premiumTerm: string;
  sumAssured: string;
  tsa: string;
  riderSummaries: Array<{
    id: string;
    name: string;
    sumAssured: string;
    policyTerm: string;
    premiumTerm: string;
    premium: string;
  }>;
  onOpenRiders: () => void;
}) => {
  const riderText =
    riderSummaries.length === 0
      ? "No riders"
      : riderSummaries
          .map((rider) => `${rider.name} - ${rider.sumAssured}`)
          .join(" / ");

  return (
    <Box
      sx={{
        mt: 0.85,
        pt: 0.8,
        borderTop: "1px solid #EEE8E5",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 0.45,
          flexWrap: "wrap",
          minWidth: 0,
          lineHeight: 1.35,
        }}
      >
        <Typography
          sx={{
            color: "#A92129",
            fontSize: 9,
            fontWeight: 900,
            lineHeight: 1.35,
            flexShrink: 0,
          }}
        >
          {productName}
        </Typography>

        <Typography
          sx={{
            color: "#5C514D",
            fontSize: 9.5,
            fontWeight: 700,
            lineHeight: 1.35,
            overflowWrap: "anywhere",
          }}
        >
          / {policyTerm !== "-" ? `PT - ${policyTerm}` : "PT - -"}
          {" / "}
          {premiumTerm !== "-" ? `PPT - ${premiumTerm}` : "PPT - -"}
          {" / "}
          SA - {sumAssured}
          {" / "}
          TSA - {tsa}
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 0.35,
          display: "flex",
          alignItems: "flex-start",
          gap: 0.4,
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            color: "#8A7E79",
            fontSize: 8.5,
            fontWeight: 900,
            flexShrink: 0,
            lineHeight: 1.45,
          }}
        >
          Riders:
        </Typography>

        <Typography
          title={riderText}
          sx={{
            color: "#5C514D",
            fontSize: 9.2,
            fontWeight: 700,
            lineHeight: 1.45,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {riderText}
        </Typography>

        {riderSummaries.length > 0 && (
          <Box
            component="button"
            type="button"
            onClick={onOpenRiders}
            sx={{
              flexShrink: 0,
              border: 0,
              p: 0,
              bgcolor: "transparent",
              color: "#9A2529",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 8.5,
              fontWeight: 900,
            }}
          >
            View
          </Box>
        )}
      </Box>
    </Box>
  );
};

const ApplicantApplicationSummary = ({
  readOnly = false,
  showRiskAnalytics = true,
  uwDecision,
  quickLinks,
  stickyTop = 72,
}: ApplicantApplicationSummaryProps) => {
  const drsData = useAppSelector((state: RootState) => state.drs.data);
  const searchData = useAppSelector(
    (state: RootState) => state.searchApplication.response?.data,
  );

  const [selectedRiskCard, setSelectedRiskCard] = useState<RiskCard | null>(
    null,
  );
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);
  const [detailTab, setDetailTab] = useState<ApplicantDetailTab>("personal");
  const [riderDialogOpen, setRiderDialogOpen] = useState(false);

  const source = toRecord(readOnly ? searchData : drsData);
  const applicationOverview = toRecord(source.applicationOverview);
  const initialBre = toRecord(source.breDecision);
  const latestBreCandidate = toRecord(source.latestBreDecision);
  const finalBre = isNonEmptyRecord(latestBreCandidate)
    ? latestBreCandidate
    : initialBre;

  const members = Array.isArray(source.summary)
    ? source.summary.map(toRecord)
    : [];

  const activeMemberIndex =
    selectedMemberIndex < members.length ? selectedMemberIndex : 0;
  const applicant = members[activeMemberIndex] ?? {};

  const applicantDetails = toRecord(applicant.applicantDetails);
  const personalDetails = toRecord(applicant.personalDetails);

  const personal = {
    ...applicantDetails,
    ...personalDetails,
    ...toRecord(applicant.personalSummary),
    ...toRecord(applicant.proposerSummary),
  };

  const kycDetails = {
    ...toRecord(applicant.kyc),
    ...toRecord(applicant.kycDetails),
    ...toRecord(applicant.applicantKycDetails),
    ...toRecord(personal.kycDetails),
  };

  const finance = toRecord(applicant.applicantFinancialDetails);
  const financialDetails = toRecord(applicant.financialDetails);

  const products = Array.isArray(applicationOverview.productDetail)
    ? applicationOverview.productDetail.map(toRecord)
    : [];

  const baseProduct =
    products.find(
      (product) => String(product.type ?? "").toLowerCase() === "base",
    ) ??
    products[0] ??
    applicationOverview;

  const riderDetails = Array.isArray(applicationOverview.riderDetails)
    ? applicationOverview.riderDetails.map(toRecord)
    : products.filter(
        (product) => String(product.type ?? "").toLowerCase() === "rider",
      );

  const name = getFullName({ ...applicant, ...personal });

  const image = String(
    firstValue(applicant.profileImage, personal.profileImage) ?? "",
  );

  const appNo = text(
    firstValue(
      source.applicationNumber,
      source.applicationNo,
      applicationOverview.applicationNumber,
      applicationOverview.applicationNo,
    ),
  );

  const age = firstValue(
    personal.age && toRecord(personal.age).years,
    applicantDetails.age,
  );

  const address = getAddress({
    ...applicant,
    address: firstValue(
      applicant.address,
      personal.address,
      applicantDetails.address,
    ),
  });

  const personalFields = [
    {
      label: "Marital status",
      value: text(personal.maritalStatus ?? applicantDetails.maritalStatus),
    },
    { label: "Age", value: age ? `${text(age)} years` : "-" },
    {
      label: "Gender",
      value: text(personal.gender ?? applicantDetails.gender),
    },
    {
      label: "Education",
      value: text(personal.education ?? applicantDetails.education),
    },
    {
      label: "Date of birth",
      value: text(
        firstValue(personal.dateOfBirth, personal.dob, applicantDetails.dob),
      ),
    },
    { label: "Location", value: address },
    {
      label: "Nationality",
      value: text(personal.nationality ?? applicantDetails.nationality),
    },
    {
      label: "Residence",
      value: text(personal.residentStatus ?? personal.countryOfResidence),
    },
    {
      label: "Smoker status",
      value: text(
        firstValue(
          personal.smokerStatus,
          personal.smoker,
          applicantDetails.smokerStatus,
        ),
      ),
    },
  ];

  const kycFields = [
    {
      label: "KYC status",
      value: text(firstValue(kycDetails.kycStatus, kycDetails.status)),
    },
    {
      label: "PAN",
      value: text(
        firstValue(kycDetails.panNumber, kycDetails.pan, personal.panNumber),
      ),
    },
    {
      label: "CKYC number",
      value: text(firstValue(kycDetails.ckycNumber, kycDetails.ckycNo)),
    },
    {
      label: "Aadhaar",
      value: text(
        firstValue(kycDetails.aadhaarNumber, kycDetails.aadharNumber),
      ),
    },
    {
      label: "Identity proof",
      value: text(firstValue(kycDetails.identityProof, kycDetails.idProofType)),
    },
    {
      label: "Address proof",
      value: text(
        firstValue(kycDetails.addressProof, kycDetails.addressProofType),
      ),
    },
    {
      label: "Mobile",
      value: text(firstValue(kycDetails.mobileNumber, personal.mobileNumber)),
    },
    {
      label: "Email",
      value: text(
        firstValue(kycDetails.emailId, personal.emailId, personal.email),
      ),
    },
    {
      label: "KYC mode",
      value: text(firstValue(kycDetails.kycMode, kycDetails.verificationMode)),
    },
  ];

  const financialFields = [
    {
      label: "Occupation",
      value: text(
        firstValue(
          finance.occupation,
          financialDetails.occupation,
          personalDetails.occupationType,
          personal.designation,
        ),
      ),
    },
    {
      label: "Annual income",
      value: currency(
        firstValue(
          finance.annualIncome,
          financialDetails.annualIncome,
          personalDetails.netIncomeAmt,
        ),
      ),
    },
    {
      label: "Income source",
      value: text(
        firstValue(finance.incomeSource, financialDetails.incomeSource),
      ),
    },
    {
      label: "Net worth",
      value: currency(firstValue(finance.netWorth, financialDetails.netWorth)),
    },
    {
      label: "Employer",
      value: text(
        firstValue(finance.employerName, financialDetails.employerName),
      ),
    },
    {
      label: "Industry",
      value: text(
        firstValue(finance.industryType, financialDetails.industryType),
      ),
    },
    {
      label: "Income proof",
      value: text(
        firstValue(finance.incomeProof, financialDetails.incomeProof),
      ),
    },
    {
      label: "Financial need",
      value: currency(
        firstValue(finance.financialNeed, financialDetails.financialNeed),
      ),
    },
    {
      label: "Existing cover",
      value: currency(
        firstValue(finance.existingCover, financialDetails.existingCover),
      ),
    },
  ];

  const activeDetailFields =
    detailTab === "personal"
      ? personalFields
      : detailTab === "kyc"
        ? kycFields
        : financialFields;

  const productName = text(
    firstValue(
      baseProduct.productName,
      baseProduct.name,
      applicationOverview.productName,
      applicationOverview.product,
    ),
  );

  const policyTerm = text(
    firstValue(
      baseProduct.policyTerm,
      baseProduct.term,
      applicationOverview.policyTerm,
    ),
  );

  const premiumTerm = text(
    firstValue(
      baseProduct.premiumPaymentTerm,
      baseProduct.ppt,
      applicationOverview.premiumPaymentTerm,
    ),
  );

  const sumAssured = currency(
    firstValue(
      baseProduct.sumAssured,
      baseProduct.appliedSA,
      applicationOverview.sumAssured,
      applicationOverview.appliedSa,
    ),
  );

  const tsa = currency(
    firstValue(baseProduct.tsa, baseProduct.totalSumAssured),
  );

  const riderSummaries = riderDetails
    .map((rider, index) => {
      const riderName = text(
        firstValue(rider.name, rider.riderName, rider.productName),
      );

      const riderSa = currency(
        firstValue(rider.sumAssured, rider.tsa, rider.appliedSA),
      );

      return {
        id: String(firstValue(rider.id, rider.productCode, index)),
        name: riderName,
        sumAssured: riderSa,
        policyTerm: text(firstValue(rider.policyTerm, rider.term)),
        premiumTerm: text(firstValue(rider.premiumPaymentTerm, rider.ppt)),
        premium: currency(firstValue(rider.premium, rider.annualPremium)),
      };
    })
    .filter((rider) => rider.name !== "-");

  const initialBreDecision = text(initialBre.decision);
  const finalBreDecision = text(
    firstValue(finalBre.decision, initialBre.decision),
  );

  const breRemarks = text(firstValue(finalBre.remarks, initialBre.remarks));

  const breDiscrepancies = splitBreCodes(
    firstValue(finalBre.discrepancy, initialBre.discrepancy),
  );

  const reTriggerCount = text(
    firstValue(finalBre.reTriggerCount, initialBre.reTriggerCount, 0),
  );

  const rawBreTimestamp = firstValue(
    finalBre.timestamp,
    initialBre.timestamp,
  );

  const breTimestamp = rawBreTimestamp
    ? (formatDate(String(rawBreTimestamp)) ?? text(rawBreTimestamp))
    : "-";

  const breChanged =
    initialBreDecision !== "-" &&
    finalBreDecision !== "-" &&
    initialBreDecision.toUpperCase() !== finalBreDecision.toUpperCase();

  const decisionTone = getDecisionTone(finalBreDecision);
  const riskCards = buildRiskCards(applicant);

  const attentionCount = riskCards.filter(
    (card) => card.status === "attention",
  ).length;

  const availableRiskCount = riskCards.filter(
    (card) => card.status !== "unavailable",
  ).length;

  const riskSummary =
    availableRiskCount === 0
      ? "No data"
      : attentionCount > 0
        ? `${attentionCount} alert${attentionCount > 1 ? "s" : ""}`
        : "All clear";

  const hasStickyRail = Boolean(uwDecision || quickLinks);

  const stickyOffset =
    typeof stickyTop === "number" ? `${stickyTop}px` : stickyTop;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          lg: hasStickyRail
            ? "minmax(0, 1fr) minmax(280px, 320px)"
            : "minmax(0, 1fr)",
        },
        alignItems: "start",
        gap: 0.9,
        width: "100%",
        minWidth: 0,
        px: 0.5,
        overflowX: "clip",
      }}
    >
      <Box sx={{ minWidth: 0, containerType: "inline-size" }}>
        <CustomAccordion title="Case Snapshot" defaultExpanded>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 0.75,
              p: 0.75,
              overflow: "hidden",
              border: "1px solid #E4DEDB",
              borderRadius: 1.75,
              bgcolor: "#F7F6F5",
              "@container (min-width: 520px)": {
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              },
              "@container (min-width: 900px)": {
                gridTemplateColumns: showRiskAnalytics
                  ? "24% 47% 29%"
                  : "34% 66%",
                alignItems: "stretch",
              },
            }}
          >
            {/* 1. BRE DECISION - intentionally first */}
            <Box sx={{ ...panelSx }}>
              <SectionHeader
                eyebrow="BRE Decision"
                title=""
                trailing={
                  <Box
                    component="span"
                    sx={{
                      flexShrink: 0,
                      px: 0.7,
                      py: 0.3,
                      border: `1px solid ${decisionTone.border}`,
                      borderRadius: 4,
                      bgcolor: decisionTone.background,
                      color: decisionTone.text,
                      fontSize: 9.5,
                      fontWeight: 900,
                    }}
                  >
                    {finalBreDecision}
                  </Box>
                }
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(0, 1fr) 22px minmax(0, 1fr)",
                  alignItems: "center",
                  gap: 0.45,
                }}
              >
                <Box
                  sx={{
                    px: 0.7,
                    py: 0.55,
                    borderRadius: 1,
                    bgcolor: "#F5F3F2",
                  }}
                >
                  <CompactField
                    label="Initial"
                    value={initialBreDecision}
                  />
                </Box>

                <Typography
                  sx={{
                    color: breChanged ? "#A35E00" : "#9A2529",
                    textAlign: "center",
                  }}
                >
                  →
                </Typography>

                <Box
                  sx={{
                    px: 0.7,
                    py: 0.55,
                    border: `1px solid ${decisionTone.border}`,
                    borderRadius: 1,
                    bgcolor: decisionTone.background,
                  }}
                >
                  <CompactField label="Final" value={finalBreDecision} />
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 0.7,
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  gap: 0.7,
                }}
              >
                <CompactField
                  label="Last assessed"
                  value={breTimestamp}
                />
                <CompactField
                  label="Retriggers"
                  value={reTriggerCount}
                />
              </Box>

              <Box
                sx={{
                  mt: 0.65,
                  pt: 0.65,
                  borderTop: "1px dashed #E5D9D5",
                }}
              >
                <Typography sx={{ color: "#8A7E79", fontSize: 8.5 }}>
                  Discrepancies
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 0.35,
                    mt: 0.35,
                    minWidth: 0,
                  }}
                >
                  {breDiscrepancies.length === 0 ? (
                    <Typography
                      sx={{
                        color: "#716A66",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      None
                    </Typography>
                  ) : (
                    <>
                      {breDiscrepancies.slice(0, 4).map((code) => (
                        <Box
                          key={code}
                          component="span"
                          title={code}
                          sx={{
                            maxWidth: 92,
                            px: 0.55,
                            py: 0.2,
                            borderRadius: 3,
                            bgcolor: "#FFF1E3",
                            color: "#8B4E1B",
                            fontSize: 8.5,
                            fontWeight: 800,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {code}
                        </Box>
                      ))}

                      {breDiscrepancies.length > 4 && (
                        <Typography
                          sx={{
                            color: "#8B4E1B",
                            fontSize: 9,
                            fontWeight: 800,
                          }}
                        >
                          +{breDiscrepancies.length - 4}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </Box>

              <Typography
                title={breRemarks}
                sx={{
                  mt: 0.55,
                  color: "#5B514D",
                  fontSize: 9.5,
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  component="span"
                  sx={{ color: "#8A7E79", fontWeight: 800 }}
                >
                  Remarks:{" "}
                </Box>
                {breRemarks}
              </Typography>
            </Box>

            {/* 2. APPLICATION + APPLICANT - application details now inline */}
            <Box
              sx={{
                ...panelSx,
                p: 0,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 0.75,
                  minWidth: 0,
                  px: 1.05,
                  py: 0.75,
                  borderBottom: "1px solid #E8E2DF",
                  bgcolor: "#FAF7F5",
                }}
              >
                <Typography
                  sx={{
                    color: "#A92129",
                    fontSize: 8.5,
                    fontWeight: 900,
                    letterSpacing: 0.8,
                    lineHeight: 1.1,
                    textTransform: "uppercase",
                  }}
                >
                  Application &amp; Applicant
                </Typography>

                <Box
                  component="span"
                  sx={{
                    flexShrink: 0,
                    px: 0.7,
                    py: 0.3,
                    borderRadius: 4,
                    bgcolor: "#FFF0E7",
                    color: "#96242A",
                    fontSize: 9,
                    fontWeight: 900,
                  }}
                >
                  {text(applicant.memberType) === "-"
                    ? "Applicant"
                    : text(applicant.memberType)}
                </Box>
              </Box>

              {members.length > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 0.55,
                    minWidth: 0,
                    px: 1,
                    py: 0.65,
                    borderBottom: "1px solid #E8E2DF",
                    bgcolor: "#FCFAF9",
                  }}
                >
                  <Typography
                    sx={{
                      flexShrink: 0,
                      mr: 0.25,
                      color: "#776C68",
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: 0.7,
                      textTransform: "uppercase",
                    }}
                  >
                    Members
                  </Typography>

                  {members.map((member, index) => {
                    const memberPersonal = {
                      ...toRecord(member.applicantDetails),
                      ...toRecord(member.personalDetails),
                      ...toRecord(member.personalSummary),
                      ...toRecord(member.proposerSummary),
                    };

                    const memberName = getFullName({
                      ...member,
                      ...memberPersonal,
                    });

                    const memberType =
                      text(member.memberType) === "-"
                        ? `Member ${index + 1}`
                        : text(member.memberType);

                    const isSelected = index === activeMemberIndex;

                    return (
                      <Box
                        key={`${memberType}-${index}`}
                        component="button"
                        type="button"
                        onClick={() => {
                          setSelectedMemberIndex(index);
                          setSelectedRiskCard(null);
                        }}
                        sx={{
                          minWidth: 0,
                          maxWidth: 210,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.55,
                          px: 0.8,
                          py: 0.45,
                          border: isSelected
                            ? "1px solid #A92129"
                            : "1px solid #E0D9D6",
                          borderRadius: 5,
                          bgcolor: isSelected ? "#FFF1E9" : "#F8F7F6",
                          color: isSelected ? "#972128" : "#5E5551",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textAlign: "left",
                        }}
                      >
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            flexShrink: 0,
                            borderRadius: "50%",
                            bgcolor: isSelected ? "#A92129" : "#BEB4B0",
                          }}
                        />

                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 9.5,
                              fontWeight: 900,
                              lineHeight: 1.1,
                            }}
                          >
                            {memberType}
                          </Typography>

                          <Typography
                            title={memberName}
                            sx={{
                              mt: 0.1,
                              fontSize: 8.5,
                              lineHeight: 1.1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {memberName}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              <Box
                sx={{
                  minWidth: 0,
                  p: 1.05,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 0.9,
                    minWidth: 0,
                  }}
                >
                  <Avatar
                    src={image || undefined}
                    alt={name === "-" ? "Applicant" : name}
                    sx={{
                      width: 46,
                      height: 46,
                      flexShrink: 0,
                      bgcolor: "#FFF4EA",
                      color: "#A92129",
                      border: "2px solid #FFFFFF",
                      boxShadow: "0 2px 7px rgba(169, 33, 41, 0.14)",
                    }}
                  >
                    <UserProfileIcon sx={{ fontSize: 29 }} />
                  </Avatar>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        color: "#A92129",
                        fontSize: 8.5,
                        fontWeight: 900,
                        letterSpacing: 0.7,
                        textTransform: "uppercase",
                      }}
                    >
                      {text(applicant.memberType) === "-"
                        ? "Applicant"
                        : text(applicant.memberType)}
                    </Typography>

                    <Typography
                      title={name}
                      sx={{
                        color: "#2F2926",
                        fontSize: 14,
                        fontWeight: 850,
                        lineHeight: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {name}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.15,
                        color: "#746A66",
                        fontSize: 9.5,
                      }}
                    >
                      App #{appNo}
                    </Typography>
                  </Box>
                </Box>

                {/* NEW:
                    Product/application information is immediately below the
                    applicant name instead of being placed in a separate
                    "Application Details" card/header. */}
                <InlineApplicationDetails
                  productName={productName}
                  policyTerm={policyTerm}
                  premiumTerm={premiumTerm}
                  sumAssured={sumAssured}
                  tsa={tsa}
                  riderSummaries={riderSummaries}
                  onOpenRiders={() => setRiderDialogOpen(true)}
                />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 0.3,
                    mt: 0.85,
                    mb: 0.8,
                    p: 0.3,
                    borderRadius: 1,
                    bgcolor: "#F2EFED",
                  }}
                >
                  {(
                    [
                      ["personal", "Personal"],
                      ["kyc", "KYC"],
                      ["financial", "Financial"],
                    ] as Array<[ApplicantDetailTab, string]>
                  ).map(([tab, label]) => {
                    const isActive = detailTab === tab;

                    return (
                      <Box
                        key={tab}
                        component="button"
                        type="button"
                        onClick={() => setDetailTab(tab)}
                        sx={{
                          px: 0.45,
                          py: 0.4,
                          border: 0,
                          borderRadius: 0.8,
                          bgcolor: isActive ? "#FFFFFF" : "transparent",
                          color: isActive ? "#9A2529" : "#756B67",
                          boxShadow: isActive
                            ? "0 1px 3px rgba(55, 37, 31, 0.1)"
                            : "none",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: 9.5,
                          fontWeight: 850,
                        }}
                      >
                        {label}
                      </Box>
                    );
                  })}
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "7px 8px",
                    pt: 0.85,
                    borderTop: "1px solid #EEE8E5",
                    "@container (max-width: 620px)": {
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    },
                  }}
                >
                  {activeDetailFields.map((field) => (
                    <CompactField
                      key={field.label}
                      label={field.label}
                      value={field.value}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* 3. RISK ANALYTICS */}
            {showRiskAnalytics && (
              <Box sx={{ ...panelSx }}>
                <SectionHeader
                  eyebrow="Risk analytics"
                  title=""
                  trailing={
                    <Box
                      component="span"
                      sx={{
                        flexShrink: 0,
                        px: 0.7,
                        py: 0.3,
                        borderRadius: 4,
                        bgcolor:
                          attentionCount > 0 ? "#FDEEEF" : "#EDF7F0",
                        color:
                          attentionCount > 0 ? "#B1262E" : "#26723A",
                        fontSize: 9,
                        fontWeight: 900,
                      }}
                    >
                      {riskSummary}
                    </Box>
                  }
                />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 0.55,
                  }}
                >
                  {riskCards.map((card) => {
                    const tone = RISK_TONES[card.status];

                    return (
                      <Box
                        key={card.id}
                        component="button"
                        type="button"
                        onClick={() => setSelectedRiskCard(card)}
                        sx={{
                          minWidth: 0,
                          minHeight: 76,
                          px: 0.65,
                          py: 0.6,
                          border: `1px solid ${tone.border}`,
                          borderTop: `3px solid ${tone.text}`,
                          borderRadius: 1.15,
                          bgcolor: tone.background,
                          color: tone.text,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textAlign: "left",
                          transition:
                            "transform 0.15s ease, box-shadow 0.15s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow:
                              "0 3px 8px rgba(53, 40, 35, 0.1)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 0.25,
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#3E3734",
                              fontSize: 9.5,
                              fontWeight: 900,
                              lineHeight: 1.15,
                            }}
                          >
                            {card.label}
                          </Typography>

                          <KeyRightArrowIcon
                            sx={{
                              flexShrink: 0,
                              fontSize: 13,
                            }}
                          />
                        </Box>

                        <Typography
                          title={card.value}
                          sx={{
                            mt: 0.4,
                            color: tone.text,
                            fontSize: 10,
                            fontWeight: 850,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {card.value}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.25,
                            color: tone.text,
                            fontSize: 8.5,
                          }}
                        >
                          {tone.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        </CustomAccordion>

        <CustomDialog
          open={Boolean(selectedRiskCard)}
          onClose={() => setSelectedRiskCard(null)}
          title={
            selectedRiskCard
              ? `${selectedRiskCard.label} Risk Details`
              : "Risk Details"
          }
          maxWidth="lg"
        >
          {selectedRiskCard && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
                gap: 0.75,
                minWidth: { xs: "auto", md: 760 },
                py: 0.25,
              }}
            >
              {selectedRiskCard.details.map((detail) => (
                <Box
                  key={detail.key}
                  sx={{
                    minWidth: 0,
                    px: 0.85,
                    py: 0.7,
                    border: "1px solid #E3DEDB",
                    borderRadius: 1,
                    bgcolor: "#F8F7F6",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#827671",
                      fontSize: 9.5,
                    }}
                  >
                    {detail.label}
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
                    {text(detail.value)}
                  </Typography>
                </Box>
              ))}
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
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 0.8,
              minWidth: { xs: "auto", md: 720 },
            }}
          >
            {riderSummaries.map((rider) => (
              <Box
                key={rider.id}
                sx={{
                  minWidth: 0,
                  p: 0.9,
                  border: "1px solid #E4DEDB",
                  borderLeft: "4px solid #A92129",
                  borderRadius: 1.1,
                  bgcolor: "#FAF8F7",
                }}
              >
                <Typography
                  title={rider.name}
                  sx={{
                    color: "#332D2A",
                    fontSize: 12,
                    fontWeight: 900,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {rider.name}
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 0.7,
                    mt: 0.75,
                  }}
                >
                  <CompactField
                    label="Sum assured"
                    value={rider.sumAssured}
                  />
                  <CompactField
                    label="Premium"
                    value={rider.premium}
                  />
                  <CompactField
                    label="Policy term"
                    value={rider.policyTerm}
                  />
                  <CompactField
                    label="Premium term"
                    value={rider.premiumTerm}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </CustomDialog>
      </Box>

      {hasStickyRail && (
        <Box
          component="aside"
          sx={{
            position: { xs: "static", lg: "sticky" },
            top: { lg: stickyTop },
            display: "grid",
            gap: 0.8,
            minWidth: 0,
            maxHeight: {
              lg: `calc(100vh - ${stickyOffset} - 12px)`,
            },
            overflowY: { xs: "visible", lg: "auto" },
            overflowX: "hidden",
            pr: { lg: 0.25 },
            scrollbarWidth: "thin",
            scrollbarColor: "#CDBFBA transparent",
            "&::-webkit-scrollbar": {
              width: 5,
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 4,
              bgcolor: "#CDBFBA",
            },
          }}
        >
          {uwDecision && (
            <StickyRailPanel eyebrow="Decision" title="UW Decision">
              {uwDecision}
            </StickyRailPanel>
          )}

          {quickLinks && (
            <StickyRailPanel eyebrow="Navigation" title="Quick Links">
              {quickLinks}
            </StickyRailPanel>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ApplicantApplicationSummary;

/**
 * Standalone row component.
 *
 * Order is fixed:
 *   1. BRE Decision
 *   2. Application & Applicant
 *   3. Risk Analytics
 *
 * The application overview itself remains the second section, while the
 * ApplicantApplicationSummary above uses the new inline product presentation.
 */
export const CaseSnapshotRow = ({
  breDecision,
  applicationOverview,
  applicantSummary,
  riskAnalytics,
  uwDecision,
  quickLinks,
  stickyTop = 72,
}: CaseSnapshotRowProps) => {
  const hasStickyRail = Boolean(uwDecision || quickLinks);

  const stickyOffset =
    typeof stickyTop === "number" ? `${stickyTop}px` : stickyTop;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          lg: hasStickyRail
            ? "minmax(0, 1fr) minmax(280px, 320px)"
            : "minmax(0, 1fr)",
        },
        alignItems: "start",
        gap: 0.85,
        width: "100%",
        minWidth: 0,
        overflowX: "clip",
      }}
    >
      {/* FIXED ORDER: BRE -> APPLICATION -> RISK */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "repeat(2, minmax(0, 1fr))",
          },
          "@media (min-width: 900px)": {
            gridTemplateColumns: "24% 47% 29%",
            alignItems: "stretch",
          },
          alignItems: "stretch",
          gap: 0.75,
          minWidth: 0,
        }}
      >
        {/* 1. BRE */}
        <Box
          sx={{
            ...panelSx,
            p: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 1.05,
              py: 0.75,
              borderBottom: "1px solid #E8E2DF",
              bgcolor: "#FAF7F5",
            }}
          >
            <SectionHeader eyebrow="Assessment" title="BRE Decision" />
          </Box>

          <Box sx={{ minWidth: 0, p: 0.7 }}>
            {breDecision}
          </Box>
        </Box>

        {/* 2. APPLICATION / APPLICANT */}
        <Box
          sx={{
            ...panelSx,
            p: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 1.05,
              py: 0.75,
              borderBottom: "1px solid #E8E2DF",
              bgcolor: "#FAF7F5",
            }}
          >
            <SectionHeader
              eyebrow="Application & Applicant"
              title=""
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "minmax(0, 1.25fr) minmax(190px, 0.75fr)",
              },
              minWidth: 0,
              "& > *": {
                minWidth: 0,
              },
            }}
          >
            <Box
              sx={{
                p: 0.7,
                borderRight: {
                  md: "1px solid #E8E2DF",
                },
                borderBottom: {
                  xs: "1px solid #E8E2DF",
                  md: 0,
                },
              }}
            >
              {applicantSummary ?? (
                <Typography
                  sx={{
                    color: "#817773",
                    fontSize: 10,
                  }}
                >
                  Applicant details are not available.
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                p: 0.7,
                bgcolor: "#FFFCFA",
              }}
            >
              {applicationOverview}
            </Box>
          </Box>
        </Box>

        {/* 3. RISK */}
        <Box
          sx={{
            ...panelSx,
            p: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 1.05,
              py: 0.75,
              borderBottom: "1px solid #E8E2DF",
              bgcolor: "#FAF7F5",
            }}
          >
            <SectionHeader eyebrow="Signals" title="Risk Analytics" />
          </Box>

          <Box sx={{ minWidth: 0, p: 0.7 }}>
            {riskAnalytics ?? (
              <Typography
                sx={{
                  color: "#817773",
                  fontSize: 10,
                }}
              >
                Risk analytics are not available.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {hasStickyRail && (
        <Box
          component="aside"
          sx={{
            position: { xs: "static", lg: "sticky" },
            top: { lg: stickyTop },
            display: "grid",
            gap: 0.8,
            minWidth: 0,
            maxHeight: {
              lg: `calc(100vh - ${stickyOffset} - 12px)`,
            },
            overflowY: {
              xs: "visible",
              lg: "auto",
            },
            overflowX: "hidden",
            pr: { lg: 0.25 },
            scrollbarWidth: "thin",
            scrollbarColor: "#CDBFBA transparent",
            "&::-webkit-scrollbar": {
              width: 5,
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 4,
              bgcolor: "#CDBFBA",
            },
          }}
        >
          {uwDecision && (
            <StickyRailPanel eyebrow="Decision" title="UW Decision">
              {uwDecision}
            </StickyRailPanel>
          )}

          {quickLinks && (
            <StickyRailPanel eyebrow="Navigation" title="Quick Links">
              {quickLinks}
            </StickyRailPanel>
          )}
        </Box>
      )}
    </Box>
  );
};
