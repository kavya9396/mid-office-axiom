import { useState } from "react";
import {
  Box,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";

import type { RootState } from "../../../store/store";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import { KeyRightArrowIcon } from "../../../icons/Icons";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface MedicalRisk {
  isMedical?: boolean;
  brePhysicalMedicalDecision?: string;
  brePhysicalMedicalRemark?: string;
  breTeleVideoMerDecision?: string;
  breTeleVideoMerRemark?: string;
  munichReMedicalDecision?: string;
  munichReRating?: string;
  biuMedicalStatus?: string;
}

interface FinancialRisk {
  isFinancial?: boolean;
  breFinancialDecision?: string;
  breRemark?: string;
  financialEligibility?: string;
  derivedIncome?: string;
  counterOfferValue?: string;
  additionalSA?: string;
  biuFinancialStatus?: string;
}

interface OtherRisk {
  isOthers?: boolean;
  ptlrResponse?: string;
  drcResponse?: string;
  adverseIIB?: string;
  criminalQuestionResponseLA?: string;
  pepQuestionResponseLA?: string;
  criminalQuestionResponsePR?: string;
  pepQuestionResponsePR?: string;
  previousPolicySubstandard?: string;
  avocationRelatedDisclosure?: string;
  healthQuestionPositive?: string;
  employmentInRiskyIndustry?: string;
  fatfOfacCountryLogin?: string;
  hazardousOccupation?: string;
  eddFlag?: string;
  claimRiskIndicator?: string;
  faceMatchScore?: string | number;
  tobacco?: string;
  narcotics?: string;
}

interface RiskAnalyticsItem {
  medicalRisk?: MedicalRisk;
  financialRisk?: FinancialRisk;
  otherRisk?: OtherRisk;
}

interface SummaryItem {
  riskAnalytics?: RiskAnalyticsItem[];
}

interface RiskAnalyticsData {
  summary?: SummaryItem[];
}

type RiskStatus = "green" | "red";

interface DetailItem {
  key: string;
  label: string;
  value: unknown;
}

interface RiskCard {
  id: string;
  label: string;
  subLabel?: string;
  status: RiskStatus;
  details: DetailItem[];
}

/* -------------------------------------------------------------------------- */
/*                              FIELD CONFIGURATION                           */
/* -------------------------------------------------------------------------- */

const MEDICAL_FIELDS: Array<{
  key: keyof MedicalRisk;
  label: string;
}> = [
  {
    key: "brePhysicalMedicalDecision",
    label: "BRE Physical Medical Decision",
  },
  {
    key: "brePhysicalMedicalRemark",
    label: "BRE Physical Medical Remark",
  },
  {
    key: "breTeleVideoMerDecision",
    label: "BRE Tele/Video MER Decision",
  },
  {
    key: "breTeleVideoMerRemark",
    label: "BRE Tele/Video MER Remark",
  },
  {
    key: "munichReMedicalDecision",
    label: "MunichRe Medical Decision",
  },
  {
    key: "munichReRating",
    label: "MunichRe Rating",
  },
  {
    key: "biuMedicalStatus",
    label: "BIU Medical Status",
  },
];

const FINANCIAL_FIELDS: Array<{
  key: keyof FinancialRisk;
  label: string;
}> = [
  {
    key: "breFinancialDecision",
    label: "BRE Financial Decision",
  },
  {
    key: "breRemark",
    label: "BRE Remark",
  },
  {
    key: "financialEligibility",
    label: "Financial Eligibility",
  },
  {
    key: "derivedIncome",
    label: "Derived Income",
  },
  {
    key: "counterOfferValue",
    label: "Counter Offer Value",
  },
  {
    key: "additionalSA",
    label: "Additional SA",
  },
  {
    key: "biuFinancialStatus",
    label: "BIU Financial Status",
  },
];

const OTHER_FIELDS: Array<{
  key: keyof OtherRisk;
  label: string;
}> = [
  {
    key: "ptlrResponse",
    label: "PTLR Response",
  },
  {
    key: "drcResponse",
    label: "DRC Response",
  },
  {
    key: "adverseIIB",
    label: "Adverse IIB",
  },
  {
    key: "criminalQuestionResponseLA",
    label: "Criminal Question Response LA",
  },
  {
    key: "pepQuestionResponseLA",
    label: "PEP Question Response LA",
  },
  {
    key: "criminalQuestionResponsePR",
    label: "Criminal Question Response PR",
  },
  {
    key: "pepQuestionResponsePR",
    label: "PEP Question Response PR",
  },
  {
    key: "previousPolicySubstandard",
    label: "Previous Policy Substandard",
  },
  {
    key: "avocationRelatedDisclosure",
    label: "Avocation Related Disclosure",
  },
  {
    key: "healthQuestionPositive",
    label: "Health Question Positive",
  },
  {
    key: "employmentInRiskyIndustry",
    label: "Employment In Risky Industry",
  },
  {
    key: "fatfOfacCountryLogin",
    label: "FATF/OFAC Country Login",
  },
  {
    key: "hazardousOccupation",
    label: "Hazardous Occupation",
  },
  {
    key: "eddFlag",
    label: "EDD Flag",
  },
  {
    key: "claimRiskIndicator",
    label: "Claim Risk Indicator",
  },
  {
    key: "faceMatchScore",
    label: "Face Match Score",
  },
  {
    key: "tobacco",
    label: "Tobacco",
  },
  {
    key: "narcotics",
    label: "Narcotics",
  },
];

/* -------------------------------------------------------------------------- */
/*                                   COLORS                                   */
/* -------------------------------------------------------------------------- */

const STATUS_COLORS: Record<
  RiskStatus,
  string
> = {
  green: "#2e7d32",
  red: "#d32f2f",
};

const STATUS_BACKGROUNDS: Record<
  RiskStatus,
  string
> = {
  green: "#edf7ed",
  red: "#fdecec",
};

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const normalizeValue = (
  value: unknown,
): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const displayValue = (
  value: unknown,
): string => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

const isYesValue = (
  value: unknown,
): boolean => {
  const normalized =
    normalizeValue(value);

  return [
    "y",
    "yes",
    "true",
  ].includes(normalized);
};

const parsePercentage = (
  value: unknown,
): number | null => {
  const normalized = String(
    value ?? "",
  )
    .replace("%", "")
    .trim();

  if (!normalized) {
    return null;
  }

  const parsedValue =
    Number.parseFloat(normalized);

  return Number.isNaN(parsedValue)
    ? null
    : parsedValue;
};

const mapDetails = <T extends object>(
  data: T,
  fields: Array<{
    key: keyof T;
    label: string;
  }>,
): DetailItem[] =>
  fields.map((field) => ({
    key: String(field.key),
    label: field.label,
    value: data[field.key],
  }));

/* -------------------------------------------------------------------------- */
/*                         FINANCIAL STATUS                                   */
/* -------------------------------------------------------------------------- */

const getFinancialStatus = (
  financialRisk: FinancialRisk,
): RiskStatus => {
  const financialDecision =
    normalizeValue(
      financialRisk
        .breFinancialDecision,
    );

  const biuFinancialStatus =
    normalizeValue(
      financialRisk
        .biuFinancialStatus,
    );

  /*
   * BRE Financial Decision:
   * FSTP     -> Green
   * Non-FSTP -> Red
   *
   * BIU Financial Status:
   * N -> Green
   * Y -> Red
   *
   * Remaining financial fields do not
   * affect card status.
   */
  const hasRedValue =
    financialDecision ===
      "nonfstp" ||
    biuFinancialStatus === "y";

  return hasRedValue
    ? "red"
    : "green";
};

/* -------------------------------------------------------------------------- */
/*                           MEDICAL STATUS                                   */
/* -------------------------------------------------------------------------- */

const getMedicalStatus = (
  medicalRisk: MedicalRisk,
): RiskStatus => {
  const physicalDecision =
    normalizeValue(
      medicalRisk
        .brePhysicalMedicalDecision,
    );

  const teleVideoDecision =
    normalizeValue(
      medicalRisk
        .breTeleVideoMerDecision,
    );

  const munichDecision =
    normalizeValue(
      medicalRisk
        .munichReMedicalDecision,
    );

  const biuMedicalStatus =
    normalizeValue(
      medicalRisk.biuMedicalStatus,
    );

  /*
   * BRE Physical Medical Decision:
   * STP    -> Green
   * NonSTP -> Red
   *
   * BRE Tele/Video MER Decision:
   * STP    -> Green
   * NonSTP -> Red
   *
   * MunichRe Medical Decision:
   * Standard_1 / Standard_2 -> Green
   * RUW / RM / any other non-empty value -> Red
   *
   * BIU Medical Status:
   * N -> Green
   * Y -> Red
   *
   * Empty values and remark/rating fields
   * do not affect card status.
   */
  const physicalIsRed =
    physicalDecision !== "" &&
    physicalDecision !== "stp";

  const teleVideoIsRed =
    teleVideoDecision !== "" &&
    teleVideoDecision !== "stp";

  const munichIsRed =
    munichDecision !== "" &&
    ![
      "standard1",
      "standard2",
    ].includes(munichDecision);

  const biuIsRed =
    biuMedicalStatus === "y";

  const hasRedValue =
    physicalIsRed ||
    teleVideoIsRed ||
    munichIsRed ||
    biuIsRed;

  return hasRedValue
    ? "red"
    : "green";
};

/* -------------------------------------------------------------------------- */
/*                          OTHER RISK STATUS                                 */
/* -------------------------------------------------------------------------- */

const getOtherRiskStatus = (
  otherRisk: OtherRisk,
): RiskStatus => {
  const ptlrResponse =
    normalizeValue(
      otherRisk.ptlrResponse,
    );

  const drcResponse =
    normalizeValue(
      otherRisk.drcResponse,
    );

  const faceMatchScore =
    parsePercentage(
      otherRisk.faceMatchScore,
    );

  /*
   * PTLR Response:
   *
   * Green:
   * ED, MAROON, YELLOW, AMBER, GREEN
   *
   * Red:
   * DEEP RED, DEEP MAROON
   */
  const ptlrIsRed = [
    "deepred",
    "deepmaroon",
  ].includes(ptlrResponse);

  /*
   * DRC Response:
   *
   * Green:
   * Standard
   * Preferred
   * Standard (default)
   *
   * Red:
   * High Risk
   * Medium Risk
   */
  const drcIsRed = [
    "highrisk",
    "mediumrisk",
  ].includes(drcResponse);

  /*
   * The following fields use:
   *
   * No  -> Green
   * Yes -> Red
   */
  const yesNoRiskValues = [
    otherRisk.adverseIIB,
    otherRisk
      .criminalQuestionResponseLA,
    otherRisk
      .pepQuestionResponseLA,
    otherRisk
      .criminalQuestionResponsePR,
    otherRisk
      .pepQuestionResponsePR,
    otherRisk
      .previousPolicySubstandard,
    otherRisk
      .avocationRelatedDisclosure,
    otherRisk
      .healthQuestionPositive,
    otherRisk
      .employmentInRiskyIndustry,
    otherRisk
      .fatfOfacCountryLogin,
    otherRisk
      .hazardousOccupation,
    otherRisk.eddFlag,
    otherRisk.claimRiskIndicator,
    otherRisk.tobacco,
    otherRisk.narcotics,
  ];

  const hasYesRisk =
    yesNoRiskValues.some(
      isYesValue,
    );

  /*
   * Face Match Score:
   *
   * Greater than 75% -> Green
   * Less than 75%    -> Red
   *
   * Empty and invalid values are ignored.
   */
  const faceMatchIsRed =
    faceMatchScore !== null &&
    faceMatchScore < 75;

  const hasRedValue =
    ptlrIsRed ||
    drcIsRed ||
    hasYesRisk ||
    faceMatchIsRed;

  return hasRedValue
    ? "red"
    : "green";
};

/* -------------------------------------------------------------------------- */
/*                              CARD BUILDER                                  */
/* -------------------------------------------------------------------------- */

const buildRiskCards = (
  summary: SummaryItem[],
): RiskCard[] => {
  const analyticsItems = summary.flatMap(
    (summaryItem) =>
      summaryItem.riskAnalytics ?? [],
  );

  return analyticsItems.flatMap(
    (riskItem, index) => {
      const cards: RiskCard[] = [];

      if (riskItem.medicalRisk) {
        const medical =
          riskItem.medicalRisk;

        cards.push({
          id: `medical-${index}`,
          label: "Medical",
          subLabel: displayValue(
            medical
              .brePhysicalMedicalDecision,
          ),
          status:
            getMedicalStatus(medical),
          details: mapDetails(
            medical,
            MEDICAL_FIELDS,
          ),
        });
      }

      if (riskItem.financialRisk) {
        const financial =
          riskItem.financialRisk;

        cards.push({
          id: `financial-${index}`,
          label: "Financial",
          subLabel: displayValue(
            financial
              .breFinancialDecision,
          ),
          status:
            getFinancialStatus(financial),
          details: mapDetails(
            financial,
            FINANCIAL_FIELDS,
          ),
        });
      }

      if (riskItem.otherRisk) {
        const other =
          riskItem.otherRisk;

        cards.push({
          id: `other-${index}`,
          label: "Other Risk",
          status:
            getOtherRiskStatus(other),
          details: mapDetails(
            other,
            OTHER_FIELDS,
          ),
        });
      }

      return cards;
    },
  );
};

/* -------------------------------------------------------------------------- */
/*                               COMPONENT                                    */
/* -------------------------------------------------------------------------- */

const RiskAnalytics = () => {
  const drsData = useSelector(
    (state: RootState) =>
      state.drs.data,
  ) as RiskAnalyticsData | null;

  const [selectedCard, setSelectedCard] =
    useState<RiskCard | null>(null);

  const summary =
    drsData?.summary ?? [];

  const riskCards =
    buildRiskCards(summary);

  if (riskCards.length === 0) {
    return null;
  }

  return (
    <>
    {riskCards.length > 0 && (
      <>
      <Box
        sx={{
          mt: 1,
          mb: 1.25,
        }}
      >
        <Typography
          sx={{
            mb: 0.75,
            color: "#2b2b2b",
            fontSize: "12px",
            fontWeight: 800,
            lineHeight: 1.2,
            textTransform: "uppercase",
          }}
        >
          Risk Analytics
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            alignItems: "stretch",
            gap: 1,
            width: "100%",
          }}
        >
          {riskCards.map((card) => {
            const statusColor =
              STATUS_COLORS[card.status];

            const statusBackground =
              STATUS_BACKGROUNDS[
                card.status
              ];

            return (
              <Box
                key={card.id}
                component="button"
                type="button"
                onClick={() =>
                  setSelectedCard(card)
                }
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  minHeight: 66,
                  border:
                    "1px solid #dfdfdf",
                  borderLeft:
                    `4px solid ${statusColor}`,
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  px: 1.25,
                  py: 0.9,
                  cursor: "pointer",
                  textAlign: "left",
                  boxSizing: "border-box",
                  transition:
                    "all 0.2s ease",

                  "&:hover": {
                    backgroundColor:
                      "#fafafa",
                    boxShadow:
                      "0 2px 6px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    width: "100%",
                    mb: card.subLabel
                      ? 0.6
                      : 0,
                  }}
                >
                  <Typography
                    sx={{
                      color: "#1f1f1f",
                      fontSize: "12px",
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {card.label}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      width: 18,
                      height: 18,
                      flexShrink: 0,
                      border:
                        `1.5px solid ${statusColor}`,
                      borderRadius: "50%",
                      color: statusColor,
                    }}
                  >
                    <KeyRightArrowIcon
                      sx={{
                        fontSize: "15px",
                      }}
                    />
                  </Box>
                </Box>

                {card.subLabel && (
                  <Typography
                    sx={{
                      display:
                        "inline-flex",
                      alignSelf:
                        "flex-start",
                      border:
                        `1px solid ${statusColor}`,
                      borderRadius:
                        "999px",
                      backgroundColor:
                        statusBackground,
                      px: 1,
                      py: 0.25,
                      color: statusColor,
                      fontSize: "11.5px",
                      fontWeight: 600,
                      lineHeight: "16px",
                    }}
                  >
                    {card.subLabel}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      <CustomDialog
        open={Boolean(selectedCard)}
        onClose={() =>
          setSelectedCard(null)
        }
        title={
  selectedCard?.label === "Other Risk"
    ? `${selectedCard.label} Details`
    : selectedCard
      ? `${selectedCard.label} Risk Details`
      : "Risk Details"
}
        maxWidth="lg"
      >
        {selectedCard && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(6, minmax(0, 1fr))",
              },
              gap: 1,
              width: "100%",
              minWidth: {
                xs: "auto",
                md: 850,
              },
              py: 0.5,
            }}
          >
            {selectedCard.details.map(
              (detail) => (
                <Box
                  key={detail.key}
                  sx={{
                    minWidth: 0,
                    border:
                      "1px solid #e1e1e1",
                    borderRadius: "6px",
                    backgroundColor:
                      "#f7f7f7",
                    px: 1,
                    py: 0.8,
                  }}
                >
                  <Typography
                    sx={{
                      mb: 0.35,
                      color: "#666",
                      fontSize: "10px",
                      lineHeight: 1.25,
                    }}
                  >
                    {detail.label}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#1f1f1f",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {displayValue(
                      detail.value,
                    )}
                  </Typography>
                </Box>
              ),
            )}
          </Box>
        )}
      </CustomDialog>
      </>
)}
    </>
  );
};

export default RiskAnalytics;