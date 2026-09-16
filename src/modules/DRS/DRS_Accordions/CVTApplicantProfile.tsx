import { Box, MenuItem, Select, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState, type SyntheticEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
//import CustomAccordion from "../../../components/ui/Accordion/Accordion";
//import { title } from "../../../utils/constant";
import type { AppDispatch, RootState } from "../../../store/store";
import EditApplicantProfile from "./EditApplicantProfile";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import { GridSection } from "../../../components/layout/GridSection";
import { buildTripleFields, formatCurrencyINR, maskString, toDisplayValue } from "../../../utils/helpers";
import type { HealthInformation, LifestyleHabits, NomineeRow } from "../../../types/drs.types";
import type { Column } from "../../../components/ui/Table/Table";
import CustomTable from "../../../components/ui/Table/Table";
import { centerFlex } from "../../../utils/styles";
import KeyValueTable from "../../../components/ui/KeyValueTable/KeyValueTable";
import { drsThunk } from "../../../store/thunks/drsThunk";
import { useParams } from "react-router-dom";
import CustomButton from "../../../components/ui/Button/Button";
import ViewMedical from "../Medical Final/ViewMedical";
import ViewFinancial from "../Financial/ViewFinancial";
//import RiskAnalytics from "./RiskAnalytics";
import { markApplicantTabVisited } from "../../../validations/drsApplicantTabValidation";
import { formatDate } from "../../../utils/dataFormat";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface FaceMatchDetails {
  document?: string;
  faceMatchScore?: number | string;
  imageQuality?: string;
  remarks?: string;
}

interface ApplicantProfileProps {
  readOnly?: boolean;
  roleType?: string;
  initialMemberIndex?: number;
  onMemberChange?: (memberIndex: number) => void;
}

interface AgeDetails {
  years?: number;
  days?: number;
}

interface PersonalSummary {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: string;
  age?: AgeDetails;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  countryOfResidence?: string;
  education?: string;
  residentStatus?: string;
  immigrationStatus?: string;
  designation?: string;
  disabled?: string | boolean;
  percentageOfImpairment?: number | string;
  typeOfImpairment?: string;
  udidNumber?: string;
  udsLink?: string;
  profileImage?: string;
}

interface ApplicantDetails {
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  countryOfResidence?: string;
  education?: string;
}

interface KycDetails {
  pranNo?: string;
  pranNoVerifivation?: string;
  pranNoVerification?: string;
  panNumber?: string;
  panFlag?: string;
  panAadharSeedingStatus?: string;
  identityProofType?: string;
  identityProofExpiryDate?: string;
  identityProofNumber?: string;
  addressProof?: string;
  incomeProof?: string;
  existingCkycNumber?: string;
  pep?: string;
  criminalProceedings?: string;
}

interface AddressDetails {
  type?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  residingCountry?: string;
}

interface ContactDetails {
  mobileNo?: string;
  alternateMobileNo?: string;
  std?: string;
  isdCode?: string;
  landlineNo?: string;
  emailId?: string;
  emailPref?: string;
  smsPref?: string;
}

interface PaymentDetails {
  isThirdPartyPayment?: string | boolean;
  thirdPartyPayment?: string | boolean;
  thirdPartyPaymentFlag?: string | boolean;
}

interface PayoutDetails {
  accountType?: string;
  bankType?: string;
  branch?: string;
  micrCode?: string;
  ifscCode?: string;
  accountNumber?: string;
  paymentOptions?: string;
  isThirdPartyPayment?: string | boolean;
  thirdPartyPayment?: string | boolean;
  thirdPartyPaymentFlag?: string | boolean;
}

interface EiaDetails {
  openEIA?: string | boolean;
  existingEIANumber?: string;
  preferredRepository?: string;
  convertPolicies?: string | boolean;
}

interface GenericDetails {
  existingPolicyNumber?: string;
  clientId?: string;
  selfProposed?: string | boolean;
  typeOfProposer?: string;
  relationshipWithLifeAssured?: string;
  typeOfProposal?: string;
}

type NomineeTableRow = Pick<
  NomineeRow,
  | "nomineeName"
  | "nomineeDOB"
  | "gender"
  | "relationship"
  | "sharePercentage"
>;

type AppointeeTableRow = Pick<
  NomineeRow,
  | "appointeeName"
  | "appointeeGender"
  | "appointeeDOB"
  | "appointeeRelationship"
>;

const nomineeColumns: Column<NomineeTableRow>[] = [
  {
    key: "nomineeName",
    header: "Nominee Name",
    width: "14%",
  },
  {
    key: "nomineeDOB",
    header: "Nominee DOB",
    width: "12%",
  },
  {
    key: "gender",
    header: "Gender",
    width: "10%",
  },
  {
    key: "relationship",
    header: "Relationship",
    width: "12%",
  },
  {
    key: "sharePercentage",
    header: "Share %",
    width: "10%",
  },
];

const appointeeColumns: Column<AppointeeTableRow>[] = [
  {
    key: "appointeeName",
    header: "Appointee Name",
    width: "14%",
  },
  {
    key: "appointeeGender",
    header: "Appointee Gender",
    width: "12%",
  },
  {
    key: "appointeeDOB",
    header: "Appointee DOB",
    width: "12%",
  },
  {
    key: "appointeeRelationship",
    header: "Appointee Relationship",
    width: "12%",
  },
];

interface SummaryNominee {
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  proposerNomineeRelation?: string;
  percentage?: number | string;
  accountNumber?:number | string;
  ifsc?:number | string;
}

interface SummaryAppointee {
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  relationWithNominee?: string;
}

type TripleFieldConfig<T> = {
  label: string;
  key: keyof T;
  format?: (value: T[keyof T]) => string;
};

type HealthFieldConfig = TripleFieldConfig<HealthInformation>;
type LifestyleFieldConfig = TripleFieldConfig<LifestyleHabits>;

const conditionHealthFields: HealthFieldConfig[] = [
  { label: "Diabetes", key: "diabetes" },
  { label: "Hypertension", key: "hypertension" },
  { label: "Heart Disease", key: "heartDisease" },
  { label: "Cancer", key: "cancer" },
  { label: "Kidney Disease", key: "kidneyDisease" },
  { label: "Liver Disease", key: "liverDisease" },
  { label: "Lung Disease", key: "lungDisease" },
  { label: "Neurological Disorder", key: "neurologicalDisorder" },
  { label: "Mental Disorder", key: "mentalDisorder" },
  { label: "HIV/AIDS", key: "hivAids" },
  { label: "Any Surgery", key: "anySurgery" },
  { label: "Hospitalization", key: "hospitalization" },
  { label: "Other Illness", key: "otherIllness" },
  { label: "Family Heart Disease", key: "familyHeartDisease" },
  { label: "Family Cancer", key: "familyCancer" },
  { label: "Family Diabetes", key: "familyDiabetes" },
  { label: "Gynecological History", key: "gynecologicalHistory" },
  { label: "Pregnancy History", key: "pregnancyHistory" },
  { label: "Miscarriage History", key: "miscarriageHistory" },
];

const normalizeMedicalText = (value: unknown) =>
  String(value ?? "").trim();

const isYesValue = (value: unknown) => {
  const normalized = normalizeMedicalText(value).toLowerCase();

  return (
    normalized === "y" ||
    normalized === "yes" ||
    normalized === "true"
  );
};

const formatYesValue = (value: unknown) =>
  isYesValue(value) ? "Yes" : "-";

const formatHeight = (value: unknown) => {
  const normalized = normalizeMedicalText(value);

  return normalized ? `${normalized} Cms` : "-";
};

const formatWeight = (value: unknown) => {
  const normalized = normalizeMedicalText(value);

  return normalized ? `${normalized} Kgs` : "-";
};

const formatTextOrDash = (value: unknown) =>
  normalizeMedicalText(value) || "-";

const withMedicalFormat = <T,>(
  fields: TripleFieldConfig<T>[],
  format: (value: unknown) => string,
): TripleFieldConfig<T>[] =>
  fields.map((field) => ({
    ...field,
    format,
  }));

const toMedicalTripleRows = <T,>(
  fields: TripleFieldConfig<T>[],
  placeholderKey: keyof T,
) => {
  const placeholderField: TripleFieldConfig<T> = {
    label: "-",
    key: placeholderKey,
    format: () => "-",
  };

  const rows: Array<{
    first: TripleFieldConfig<T>;
    second: TripleFieldConfig<T>;
    third: TripleFieldConfig<T>;
  }> = [];

  for (let index = 0; index < fields.length; index += 3) {
    rows.push({
      first: fields[index] ?? placeholderField,
      second: fields[index + 1] ?? placeholderField,
      third: fields[index + 2] ?? placeholderField,
    });
  }

  return rows;
};

interface SummaryMember {
  memberType: string;
  clientId?: string;
  proposerLaRelation?: string;
  faceMatchDetails?: FaceMatchDetails;
  profileImage?: string;
  proposerSummary?: PersonalSummary;
  applicantDetails?: ApplicantDetails;
  kycDetails?: KycDetails;
  address?: AddressDetails[];
  contactDetails?: ContactDetails;
  paymentDetails?: PaymentDetails;
  payoutDetails?: PayoutDetails;
  genericDetails?: GenericDetails;
  eiaDetails?: EiaDetails;
  nominee?: SummaryNominee[];
  appointee?: SummaryAppointee[];
  healthInformation?: HealthInformation;
  healthDetail?: Record<string, unknown>;
  lifestyleHabits?: LifestyleHabits;
};






/* -------------------------------------------------------------------------- */
/*                         TAB CONFIGURATION                                  */
/* -------------------------------------------------------------------------- */

const applicantTabConfig: Record<string, string[]> = {
  CVT_TASK: [
    "Image Details",
    "Personal & KYC",
    "Contact & Address",
    "Payment & Payout",
  ],

  DVT_TASK: [
    "Image Details",
    "Personal & KYC",
    "Contact & Address",
    "Financial & Profession",
    "Medical & Lifestyle",
    "Nominee",
  ],

  PIVV_TASK: ["Image Details", "Personal & KYC", "Contact & Address"],

  BRE_TASK: [
    "Image Details",
    "Personal & KYC",
    "Contact & Address",
    "Financial & Profession",
    "Medical & Lifestyle",
    "Nominee",
    "Generic",
    "eIA",
    "Payment & Payout",
  ],

  CUW_TASK: [
    "Image Details",
    "Personal & KYC",
    "Contact & Address",
    "Nominee",
    "Generic",
    "eIA",
    "Payment & Payout",
  ],

  DEFAULT: [
    "Image Details",
    "Personal & KYC",
    "Contact & Address",
    "Financial & Profession",
    "Medical & Lifestyle",
    "Nominee",
    "Generic",
    "eIA",
    "Payment & Payout",
  ],
};

/* -------------------------------------------------------------------------- */
/*                           HELPER FUNCTIONS                                 */
/* -------------------------------------------------------------------------- */





const formatMemberType = (
  memberType: string = "",
  summaryLength: number = 0,
) => {
  const trimmedMemberType = memberType.trim();

  if (
    summaryLength === 1 &&
    trimmedMemberType.toLowerCase().startsWith("lifeassured")
  ) {
    return "Life Assured";
  }

  return trimmedMemberType
    ? `${trimmedMemberType.charAt(0).toUpperCase()}${trimmedMemberType.slice(1)}`
    : "";
};
const getApplicantImage = (member?: SummaryMember) => {
  if (!member) return "";

  return member.profileImage || member.proposerSummary?.profileImage || "";
};

const displayValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

// const formatDateOnly = (value?: string): string =>
//   value ? value.split("T")[0] : "-";

const ExpandableDetailField = ({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = displayValue(value);
  const shouldTruncate = text !== "-" && text.length > 30;
  const displayedText =
    shouldTruncate && !isExpanded ? `${text.slice(0, 30)}...` : text;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: "12px", color: "#333333", lineHeight: 1.35 }}>
        {label}
      </Typography>
      <Typography
        component="span"
        sx={{
          mt: "3px",
          display: "inline",
          fontSize: "10px",
          color: "#111111",
          fontWeight: 700,
          lineHeight: 1.35,
          overflowWrap: "anywhere",
        }}
      >
        {displayedText}
      </Typography>
      {shouldTruncate && (
        <Typography
          component="button"
          type="button"
          onClick={() => setIsExpanded((previousValue) => !previousValue)}
          sx={{
            ml: 0.5,
            p: 0,
            border: 0,
            background: "transparent",
            color: "#A92129",
            cursor: "pointer",
            fontSize: "10px",
            fontWeight: 600,
            textDecoration: "underline",
          }}
        >
          {isExpanded ? "Show less" : "Show more"}
        </Typography>
      )}
    </Box>
  );
};

const CompactProfileFields = ({
  items,
}: {
  items: { label: string; value: unknown }[];
}) => (
  <Box sx={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
    columnGap: 1,
    rowGap: 0.75,
    "& .MuiTypography-root": { fontSize: 11, lineHeight: 1.3 },
  }}>
    {items.map((field) => <ExpandableDetailField key={field.label} {...field} />)}
  </Box>
);

const DetailsCard = ({
  title: cardTitle,
  fields,
  orangeHeader = false,
  compact = false,
}: {
  title: string;
  fields: { label: string; value: unknown }[];
  orangeHeader?: boolean;
  compact?: boolean;
}) => (
  <Box
    sx={{
      minWidth: 0,
      p: orangeHeader ? 0 : 2,
      backgroundColor: compact ? "#FFFBF8" : "#F6F6F6",
      borderRadius: "8px",
      overflow: "hidden",
    }}
  >
    <Typography
      sx={{
        mb: orangeHeader ? 0 : 2,
        px: orangeHeader ? (compact ? 0.75 : 2) : 0,
        py: orangeHeader ? (compact ? 0.5 : 1.25) : 0,
        fontSize: "12px",
        fontWeight: 700,
        color: orangeHeader ? "#FFFFFF" : "#161616",
        backgroundColor: orangeHeader ? "#E45F14" : "transparent",
      }}
    >
      {cardTitle}
    </Typography>
    <Box
      sx={{
        p: orangeHeader ? (compact ? 0.75 : 2) : 0,
        display: "grid",
        gridTemplateColumns: compact ? { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } : "repeat(3, minmax(0, 1fr))",
        columnGap: compact ? 1 : 2,
        rowGap: compact ? 0.75 : 2,
      }}
    >
      {fields.map((field) => (
        <ExpandableDetailField key={field.label} {...field} />
      ))}
    </Box>
  </Box>
);


/* -------------------------------------------------------------------------- */
/*                            MAIN COMPONENT                                  */
/* -------------------------------------------------------------------------- */

const CVTApplicantProfile = ({
  readOnly = false,
  roleType: roleTypeOverride = "CVT_TASK",
  initialMemberIndex = 0,
  onMemberChange,
}: ApplicantProfileProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    businessType: routeBusinessType,
    applicationNumber: routeApplicationNumber,
  } = useParams<{
    businessType: string;
    applicationNumber: string;
  }>();
  const drsData = useSelector((state: RootState) => state.drs.data);
  const searchData = useSelector(
    (state: RootState) => state.searchApplication.response?.data,
  );
  const applicantProfileData = readOnly ? searchData : drsData;
  const sourceRecord = (applicantProfileData ?? {}) as Record<string, unknown>;
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeDetailView, setActiveDetailView] = useState<
    "medical" | "financial" | null
  >(null);
 
  /*
   * summary contains objects such as:
   *
   * {
   *   memberType: "proposer",
   *   ...
   * }
   *
   * {
   *   memberType: "lifeassured",
   *   ...
   * }
   */
  const summary = (Array.isArray(sourceRecord.summary)
    ? sourceRecord.summary
    : []) as SummaryMember[];

  /*
   * roleType is coming from localStorage.
   * If it doesn't exist, DEFAULT configuration is used.
   */
  const roleType = (() => {
    if (roleTypeOverride) return roleTypeOverride.trim().toUpperCase();
    if (readOnly) {
      return "DEFAULT";
    }

    try {
      const selectedCaseContext = JSON.parse(
        localStorage.getItem("selectedCaseContext") ?? "{}",
      ) as { roleType?: string };

      return String(
        selectedCaseContext.roleType ??
          localStorage.getItem("roleType") ??
          "DEFAULT",
      ).trim().toUpperCase();
    } catch {
      return (localStorage.getItem("roleType") ?? "DEFAULT").trim().toUpperCase();
    }
  })();

  /* ------------------------------------------------------------------------ */
  /*                                STATE                                     */
  /* ------------------------------------------------------------------------ */

  const [selectedMemberTab, setSelectedMemberTab] = useState(Math.max(0, initialMemberIndex));
  const [selectedDetailTab, setSelectedDetailTab] = useState(0);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const handleEditProfileSave = async () => {
    if (readOnly) {
      return;
    }

    await refreshApplicantSummary();
  };

  /* ------------------------------------------------------------------------ */
  /*                         ROLE BASED TABS                                   */
  /* ------------------------------------------------------------------------ */

  const innerTabs = applicantTabConfig[roleType] ?? applicantTabConfig.DEFAULT;

  /*
   * Prevent invalid index if the role configuration contains fewer tabs
   * than the previously selected index.
   */
  const safeDetailTab =
    selectedDetailTab >= innerTabs.length ? 0 : selectedDetailTab;

  /* ------------------------------------------------------------------------ */
  /*                         SELECTED APPLICANT                                */
  /* ------------------------------------------------------------------------ */

  const selectedApplicant = summary[selectedMemberTab];

  const resolvedApplicationNumber = String(
    routeApplicationNumber ??
      sourceRecord.applicationNumber ??
      sourceRecord.applicationNo ??
      "",
  ).trim();

  const resolvedBusinessType = String(
    routeBusinessType ??
      sourceRecord.businessType ??
      localStorage.getItem("businessType") ??
      "retail",
  )
    .trim()
    .toLowerCase();

  /* Mark the initially displayed member and every selected member as visited. */
  useEffect(() => {
    if (readOnly) {
      return;
    }

    const memberType = selectedApplicant?.memberType?.trim();

    if (
      !resolvedApplicationNumber ||
      !roleType ||
      !memberType
    ) {
      return;
    }

    markApplicantTabVisited(
      resolvedApplicationNumber,
      roleType,
      memberType,
    );
  }, [
    readOnly,
    resolvedApplicationNumber,
    roleType,
    selectedApplicant?.memberType,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                         MEMBER TAB CHANGE                                */
  /* ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------ */
  /*                         DETAIL TAB CHANGE                                 */
  /* ------------------------------------------------------------------------ */

  const handleDetailTabChange = (_event: SyntheticEvent, newValue: number) => {
    setSelectedDetailTab(newValue);
  };

  /* ------------------------------------------------------------------------ */
  /*                         DETAIL CONTENT                                    */
  /* ------------------------------------------------------------------------ */

  const renderDetailContent = () => {
    if (!selectedApplicant) {
      return null;
    }

    const selectedTab = innerTabs[safeDetailTab];

    switch (selectedTab) {
      case "Image Details": {
        //const faceMatchDetails = selectedApplicant?.faceMatchDetails;

        return (
          <Box
            sx={{
              width: "100%",
              backgroundColor: "#F6F6F6",
              borderRadius: "6px",
              px: roleType === "CVT_TASK" ? 1 : 2,
              py: roleType === "CVT_TASK" ? 0.75 : 1.5,
            }}
          >
            <GridSection
              columns={4}
              items={[
                {
                  label: "Document",
                  value: "Aadhar",
                },
                {
                  label: "Face Match Score",
                  value: "75",
                },
                {
                  label: "Image Quality",
                  value: "Good",
                },
                {
                  label: "Remarks",
                  value: "Good quality image found",
                },
              ]}
            />

          </Box>
        );
      }

      case "Personal & KYC": {
        const personal = selectedApplicant.proposerSummary ?? {};
        // const applicant = selectedApplicant.applicantDetails ?? {};
        const kyc = selectedApplicant.kycDetails ?? {};
        const applicantName = [
          personal.firstName,
          personal.middleName,
          personal.lastName,
        ]
          .filter(Boolean)
          .join(" ");
        const age = personal.age?.years;

        const maskLastFour = (value?: string) => value ? maskString(value, { visibleStart: 0, visibleEnd: 4 }) : "-";

        const personalFields = [
          { label: "Applicant Name", value: applicantName },
          {
            label: "Date of Birth",
            value: formatDate(personal.dob, false),
          },
          {
            label: "Age",
            value: age === null || age === undefined ? "-" : `${age} Years`,
          },
          { label: "Gender", value: personal.gender },
          {
            label: "Marital Status",
            value: personal.maritalStatus,
          },
          {
            label: "Nationality",
            value: personal.nationality,
          },
          {
            label: "Country of Residence",
            value: personal.countryOfResidence,
          },
          {
            label: "Education",
            value: personal.education,
          },
          {
            label: "Resident Status",
            value: personal.residentStatus,
          },
          { label: "Designation", value: personal.designation },
          { label: "Disabled", value: personal.disabled },
          {
            label: "Percentage Of Impairment",
            value: personal.percentageOfImpairment,
          },
          { label: "Type Of Impairment", value: personal.typeOfImpairment },
          { label: "UDID Number", value: personal.udidNumber },
          { label: "UDS Link", value: personal.udsLink },
        ];

        const kycFields = [
          {
            label: "PRAN Number",
            value: maskLastFour(kyc.pranNo),
          },
          {
            label: "PRAN Number Verification",
            value: kyc.pranNoVerification,
          },
          {
            label: "PAN Number",
            value: maskLastFour(kyc.panNumber),
          },
          { label: "PAN Flag", value: kyc.panFlag },
          {
            label: "PAN Aadhar Seeding Status",
            value: kyc.panAadharSeedingStatus,
          },
          { label: "Identity Proof Type", value: kyc.identityProofType },
          {
            label: "Identity Proof Expiry Date",
            value: formatDate(kyc.identityProofExpiryDate,false),
          },
          {
            label: "Identity Proof Number",
            value: maskLastFour(kyc.identityProofNumber),
          },
          { label: "Address Proof", value: kyc.addressProof },
          { label: "Income Proof", value: kyc.incomeProof },
          { label: "CKYC Number", value: kyc.existingCkycNumber },
          { label: "PEP", value: kyc.pep },
          { label: "Criminal Proceedings", value: kyc.criminalProceedings },
        ];

        return (
          <Box
            sx={{
              mt: roleType === "CVT_TASK" ? 0 : 1.5,
              p: roleType === "CVT_TASK" ? 1 : 2,
              backgroundColor: "#F6F6F6",
              borderRadius: "8px",
            }}
          >
            {roleType === "CVT_TASK" ? (
              <CompactProfileFields items={personalFields} />
            ) : (
              <GridSection columns={8} items={personalFields} />
            )}

            <Box sx={{ borderTop: "1px solid #AFAFAF", my: roleType === "CVT_TASK" ? 1 : 2 }} />

            {/* <Typography
              sx={{
                mb: 1.5,
                fontSize: "12px",
                fontWeight: 700,
                color: "#161616",
              }}
            >
              KYC
            </Typography> */}
            {roleType === "CVT_TASK" ? (
              <CompactProfileFields items={kycFields} />
            ) : (
              <GridSection columns={8} items={kycFields} />
            )}
          </Box>
        );
      }

      case "Contact & Address": {
        const addresses = selectedApplicant.address ?? [];
        const contact = selectedApplicant.contactDetails ?? {};
        const communicationAddress = addresses.find(
          (item) => item.type?.trim().toLowerCase() === "communication",
        );
        const permanentAddress = addresses.find(
          (item) => item.type?.trim().toLowerCase() === "permanent",
        );

        const getAddressFields = (address?: AddressDetails) => [
          { label: "Address Line 1", value: address?.addressLine1 },
          { label: "Address Line 2", value: address?.addressLine2 },
          { label: "Address Line 3", value: address?.addressLine3 },
          { label: "Landmark", value: address?.landmark },
          { label: "City", value: address?.city },
          { label: "State", value: address?.state },
          { label: "Country", value: address?.residingCountry },
          { label: "Pincode", value: address?.pinCode },
        ];

        const contactFields = [
          { label: "Mobile No.", value: contact.mobileNo },
          { label: "Email ID", value: contact.emailId },
          { label: "Alternate Mobile", value: contact.alternateMobileNo },
          { label: "STD/ISD Code", value: contact.std || contact.isdCode },
          { label: "Landline Number", value: contact.landlineNo },
          { label: "Email Pref", value: contact.emailPref },
          { label: "SMS Pref", value: contact.smsPref },
        ];

        return (
          <Box
            sx={{
              mt: roleType === "CVT_TASK" ? 0 : 1.5,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: roleType === "CVT_TASK" ? 0.75 : 1.5,
              alignItems: "stretch",
            }}
          >
            <DetailsCard
              compact={roleType === "CVT_TASK"}
              orangeHeader
              title="Communication Address"
              fields={getAddressFields(communicationAddress)}
            />
            <DetailsCard
              compact={roleType === "CVT_TASK"}
              orangeHeader
              title="Permanent Address"
              fields={getAddressFields(permanentAddress)}
            />
            <DetailsCard compact={roleType === "CVT_TASK"} orangeHeader title="Contact Details" fields={contactFields} />
          </Box>
        );
      }

      case "Financial & Profession": {
        const summaryRecord = selectedApplicant as SummaryMember & {
          personalDetails?: Record<string, unknown>;
          applicantFinancialDetails?: Record<string, unknown>;
          financialDetails?: Record<string, unknown>;
        };

        const personalDetails =
          summaryRecord.personalDetails &&
            Object.keys(summaryRecord.personalDetails).length > 0
            ? summaryRecord.personalDetails
            : {};

        const proposerSummary = selectedApplicant.proposerSummary ?? {};

        const applicantFinancialDetails =
          summaryRecord.applicantFinancialDetails ?? {};

        const financialDetails = summaryRecord.financialDetails ?? {};

        const customerDetails = Array.isArray(sourceRecord.customerDetails)
          ? (sourceRecord.customerDetails as Record<string, unknown>[])
          : [];

        /*
         * Find the corresponding customer entry for the selected member.
         * This keeps the existing fallback behavior from FinanceAndProfession.
         */
        const selectedCustomer =
          customerDetails[selectedMemberTab] ?? customerDetails[0] ?? {};

        const customerPersonalDetails =
          selectedCustomer.personalDetails &&
            typeof selectedCustomer.personalDetails === "object"
            ? (selectedCustomer.personalDetails as Record<string, unknown>)
            : {};

        const customerFinancialDetails =
          selectedCustomer.financialDetail &&
            typeof selectedCustomer.financialDetail === "object"
            ? (selectedCustomer.financialDetail as Record<string, unknown>)
            : {};

        const producerDetails =
          sourceRecord.producerDetails &&
            typeof sourceRecord.producerDetails === "object"
            ? (sourceRecord.producerDetails as Record<string, unknown>)
            : {};

        const occupation =
          applicantFinancialDetails.occupation ??
          personalDetails.occupationType ??
          proposerSummary.designation ??
          customerPersonalDetails.occupationType ??
          "";

        const annualIncome =
          applicantFinancialDetails.annualIncome ??
          financialDetails.annualIncome ??
          customerFinancialDetails.annualIncome ??
          personalDetails.netIncomeAmt ??
          customerPersonalDetails.netIncomeAmt ??
          "";

        const gstin =
          applicantFinancialDetails.gstin ??
          producerDetails.gstInNumber ??
          "";

        const industryType =
          applicantFinancialDetails.industryType ??
          personalDetails.industryType ??
          "";

        const organisationType =
          applicantFinancialDetails.organisationType ??
          personalDetails.orgType ??
          customerPersonalDetails.orgType ??
          "";

        const organisationName =
          applicantFinancialDetails.organisationName ??
          personalDetails.orgName ??
          customerPersonalDetails.orgName ??
          "";

        const financeFields = [
          {
            label: "Occupation",
            value: displayValue(occupation),
          },
          {
            label: "Annual Income",
            value:
              annualIncome !== "" && annualIncome !== null
                ? formatCurrencyINR(Number(annualIncome))
                : "-",
          },
          {
            label: "GSTIN",
            value: displayValue(gstin),
          },
          {
            label: "Industry Type",
            value: displayValue(industryType),
          },
          {
            label: "Organisation Type",
            value: displayValue(organisationType),
          },
          {
            label: "Organisation Name",
            value: displayValue(organisationName),
          },
        ];

        return (
          <Box
            sx={{
              mt: 1.5,
              p: 2,
              backgroundColor: "#F6F6F6",
              borderRadius: "8px",
            }}
          >
            <GridSection
              columns={6}
              items={financeFields}
            />
          </Box>
        );
      }

      case "Medical & Lifestyle": {
        const selectedHealthDetail =
          sourceRecord.healthDetail &&
            typeof sourceRecord.healthDetail === "object"
            ? (sourceRecord.healthDetail as Record<string, unknown>)
            : {};

        const applicantHealthDetail =
          selectedApplicant.healthDetail &&
            typeof selectedApplicant.healthDetail === "object"
            ? (selectedApplicant.healthDetail as Record<string, unknown>)
            : {};

        const healthDetail =
          Object.keys(applicantHealthDetail).length > 0
            ? applicantHealthDetail
            : selectedHealthDetail;

        const substanceConsumption = Array.isArray(
          healthDetail.substanceConsumption,
        )
          ? (healthDetail.substanceConsumption as Array<Record<string, unknown>>)
          : [];

        const firstSubstance = substanceConsumption[0] ?? {};

        const illnessOrImpairment = Array.isArray(
          healthDetail.illnessOrImpairment,
        )
          ? healthDetail.illnessOrImpairment
            .map((item) => normalizeMedicalText(item))
            .filter(Boolean)
            .join(", ")
          : "";

        const health: HealthInformation =
          selectedApplicant.healthInformation ?? {
            height: normalizeMedicalText(healthDetail.height),
            weight: normalizeMedicalText(healthDetail.weight),

            diabetes: "",
            hypertension: "",
            heartDisease: "",
            cancer: "",
            kidneyDisease: "",
            liverDisease: "",
            lungDisease: "",
            neurologicalDisorder: "",
            mentalDisorder: "",
            hivAids: "",
            anySurgery: "",
            hospitalization: "",
            otherIllness: illnessOrImpairment,
            familyHeartDisease: "",
            familyCancer: "",
            familyDiabetes: "",
            gynecologicalHistory: "",
            pregnancyHistory: "",
            miscarriageHistory: "",
          };

        const substanceQuantity =
          firstSubstance.quantity &&
            typeof firstSubstance.quantity === "object"
            ? (firstSubstance.quantity as Record<string, unknown>)
            : {};

        const lifestyle: LifestyleHabits =
          selectedApplicant.lifestyleHabits ?? {
            alcoholConsumption: "",
            alcoholQuantity: "",
            smoking: normalizeMedicalText(firstSubstance.substance)
              ? "Yes"
              : "",
            smokingQuantity: normalizeMedicalText(
              substanceQuantity.amount,
            ),
            tobaccoGutka: "",
            narcotics: "",
            hazardousOccupation: normalizeMedicalText(
              healthDetail.hazardousOccupation,
            ),
            aviationActivities: "",
            diving: "",
            mountaineering: "",
            otherHazardousActivities: "",
            racing: "",
          };

        const formattedBaseHealthFields: HealthFieldConfig[] = [
          {
            label: "Height",
            key: "height",
            format: formatHeight as (
              value: HealthInformation[keyof HealthInformation],
            ) => string,
          },
          {
            label: "Weight",
            key: "weight",
            format: formatWeight as (
              value: HealthInformation[keyof HealthInformation],
            ) => string,
          },
        ];

        const formattedConditionHealthFields =
          withMedicalFormat<HealthInformation>(
            conditionHealthFields,
            formatYesValue,
          );

        const positiveConditionFields =
          formattedConditionHealthFields.filter((field) =>
            isYesValue(health?.[field.key]),
          );

        const noMedicalHistoryField: HealthFieldConfig = {
          label: "Other Medical History",
          key: "diabetes",
          format: () => "No",
        };

        const healthFieldsToDisplay = [
          ...formattedBaseHealthFields,
          ...(positiveConditionFields.length > 0
            ? positiveConditionFields
            : [noMedicalHistoryField]),
        ];

        const healthInformationRows = buildTripleFields(
          health,
          toMedicalTripleRows(
            healthFieldsToDisplay,
            "height",
          ),
        );

        const lifestyleConditionFields: LifestyleFieldConfig[] =
          withMedicalFormat<LifestyleHabits>(
            [
              {
                label: "Alcohol Consumption",
                key: "alcoholConsumption",
              },
              {
                label: "Smoking",
                key: "smoking",
              },
              {
                label: "Tobacco/Gutka",
                key: "tobaccoGutka",
              },
              {
                label: "Narcotics",
                key: "narcotics",
              },
              {
                label: "Hazardous Occupation",
                key: "hazardousOccupation",
              },
              {
                label: "Aviation Activities",
                key: "aviationActivities",
              },
              {
                label: "Diving",
                key: "diving",
              },
              {
                label: "Mountaineering",
                key: "mountaineering",
              },
              {
                label: "Other Hazardous Activities",
                key: "otherHazardousActivities",
              },
              {
                label: "Racing",
                key: "racing",
              },
            ],
            formatYesValue,
          );

        const lifestyleFieldsToDisplay: LifestyleFieldConfig[] = [];

        if (isYesValue(lifestyle?.alcoholConsumption)) {
          lifestyleFieldsToDisplay.push(
            {
              label: "Alcohol Consumption",
              key: "alcoholConsumption",
              format: formatYesValue as (
                value: LifestyleHabits[keyof LifestyleHabits],
              ) => string,
            },
            {
              label: "Alcohol Quantity",
              key: "alcoholQuantity",
              format: formatTextOrDash as (
                value: LifestyleHabits[keyof LifestyleHabits],
              ) => string,
            },
          );
        }

        if (isYesValue(lifestyle?.smoking)) {
          lifestyleFieldsToDisplay.push(
            {
              label: "Smoking",
              key: "smoking",
              format: formatYesValue as (
                value: LifestyleHabits[keyof LifestyleHabits],
              ) => string,
            },
            {
              label: "Smoking Quantity",
              key: "smokingQuantity",
              format: formatTextOrDash as (
                value: LifestyleHabits[keyof LifestyleHabits],
              ) => string,
            },
          );
        }

        lifestyleConditionFields
          .filter(
            (field) =>
              field.key !== "alcoholConsumption" &&
              field.key !== "smoking",
          )
          .forEach((field) => {
            if (isYesValue(lifestyle?.[field.key])) {
              lifestyleFieldsToDisplay.push(field);
            }
          });

        const hasLifestyleHabits =
          lifestyleFieldsToDisplay.length > 0;

        const lifestyleHabitsRows = buildTripleFields(
          lifestyle,
          toMedicalTripleRows(
            lifestyleFieldsToDisplay,
            "alcoholConsumption",
          ),
        );

        return (
          <>
            <KeyValueTable
              title="Health Information"
              rows={healthInformationRows}
            />

            <Box sx={{ mt: 2 }}>
              {hasLifestyleHabits ? (
                <KeyValueTable
                  title="Lifestyle Habits"
                  rows={lifestyleHabitsRows}
                />
              ) : (
                <Box
                  sx={{
                    backgroundColor: "#F1F1F1",
                    borderRadius: 5,
                    overflow: "hidden",
                    border: "1px solid #E3E3E3",
                  }}
                >
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.25,
                      backgroundColor: "#E45F14",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#FFFFFF",
                        fontSize: 14,
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    >
                      Lifestyle Habits
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      ...centerFlex,
                      bgcolor: "#f6f6f6",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#4B5563",
                        fontSize: 14,
                        fontWeight: 400,
                        my: 1,
                      }}
                    >
                      No Lifestyle Habits
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </>
        );
      }

      case "Nominee": {
        const fallbackNominees: SummaryNominee[] = Array.isArray(
          selectedApplicant.nominee,
        )
          ? selectedApplicant.nominee
          : Array.isArray(sourceRecord.nominee)
            ? (sourceRecord.nominee as SummaryNominee[])
            : [];

        const fallbackAppointees: SummaryAppointee[] = Array.isArray(
          selectedApplicant.appointee,
        )
          ? selectedApplicant.appointee
          : Array.isArray(sourceRecord.appointee)
            ? (sourceRecord.appointee as SummaryAppointee[])
            : [];

        const mappedFallbackNominees: NomineeTableRow[] =
          fallbackNominees.map((item) => ({
            nomineeName: toDisplayValue(
              [item.firstName, item.lastName]
                .filter(Boolean)
                .join(" "),
            ),
            nomineeDOB: toDisplayValue(formatDate(item.dob,false)),
            gender: toDisplayValue(item.gender),
            relationship: toDisplayValue(
              item.proposerNomineeRelation,
            ),
            accountNumber: toDisplayValue(item.accountNumber),
            ifsc: toDisplayValue(item.ifsc),
            sharePercentage: Number(item.percentage ?? 0),
          }));

        const mappedFallbackAppointees: AppointeeTableRow[] =
          fallbackAppointees.map((item) => ({
            appointeeName: toDisplayValue(
              [item.firstName, item.lastName]
                .filter(Boolean)
                .join(" "),
            ),
            appointeeGender: toDisplayValue(item.gender),
            appointeeDOB: toDisplayValue(formatDate(item.dob,false)),
            appointeeRelationship: toDisplayValue(
              item.relationWithNominee,
            ),
          }));

        /*
         * If your selected applicant already has the richer nominee
         * structure, prefer that data. Otherwise use the summary/root
         * nominee data as the fallback.
         */
        const nominees: NomineeTableRow[] = mappedFallbackNominees;

        const appointees: AppointeeTableRow[] =
          mappedFallbackAppointees;

        if (nominees.length === 0 && appointees.length === 0) {
          return (
            <Typography
              component="span"
              sx={{
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              No nominees have been selected
            </Typography>
          );
        }

        return (
          <>
            {nominees.length > 0 ? (
              <CustomTable<NomineeTableRow>
                title="Nominee Details"
                columns={nomineeColumns}
                data={nominees}
              />
            ) : (
              <Typography
                component="span"
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                No nominees have been selected
              </Typography>
            )}

            <Box sx={{ mt: 2 }}>
              {appointees.length > 0 ? (
                <CustomTable<AppointeeTableRow>
                  title="Appointee Details"
                  columns={appointeeColumns}
                  data={appointees}
                />
              ) : (
                <Typography
                  component="span"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  No appointees have been selected
                </Typography>
              )}
            </Box>
          </>
        );
      }

      case "Generic": {
        const generic = selectedApplicant.genericDetails ?? {};

        const applicationInfo =
          sourceRecord.applicationInfo &&
            typeof sourceRecord.applicationInfo === "object"
            ? (sourceRecord.applicationInfo as Record<string, unknown>)
            : {};

        const customerDetails = Array.isArray(sourceRecord.customerDetails)
          ? (sourceRecord.customerDetails as Record<string, unknown>[])
          : [];

        const selectedCustomer = customerDetails[selectedMemberTab] ?? {};

        const resolvedClientId =
          String(
            selectedApplicant.clientId ??
            selectedCustomer.clientId ??
            "",
          ).trim() ||
          String(generic.clientId ?? "").trim();

        const selfProposedFromApplicationInfo =
          typeof applicationInfo.isLAPropSame === "boolean"
            ? applicationInfo.isLAPropSame
              ? "Yes"
              : "No"
            : String(applicationInfo.isLAPropSame ?? "");

        const existingPolicyNumber =
          String(
            generic.existingPolicyNumber ??
            applicationInfo.spousePolicyNo ??
            "",
          );

        const selfProposed =
          String(
            generic.selfProposed ??
            selfProposedFromApplicationInfo,
          );

        const typeOfProposer =
          String(
            generic.typeOfProposer ??
            applicationInfo.proposerType ??
            "",
          );

        const relationshipWithLifeAssured =
          String(
            generic.relationshipWithLifeAssured ??
            selectedApplicant.proposerLaRelation ??
            selectedCustomer.proposerLaRelation ??
            "",
          );

        const typeOfProposal =
          String(
            generic.typeOfProposal ??
            applicationInfo.comboFlag ??
            "",
          );

        const genericFields = [
          {
            label: "Existing Policy Number",
            value: displayValue(existingPolicyNumber),
          },
          {
            label: "Client ID",
            value: displayValue(resolvedClientId),
          },
          {
            label: "Self Proposed",
            value: displayValue(selfProposed),
          },
          {
            label: "Type of Proposer",
            value: displayValue(typeOfProposer),
          },
          {
            label: "Relationship with Life Assured",
            value: displayValue(relationshipWithLifeAssured),
          },
          {
            label: "Type of Proposal",
            value: displayValue(typeOfProposal),
          },
        ];

        return (
          <Box
            sx={{
              mt: 1.5,
              p: 2,
              borderRadius: "8px",
              backgroundColor: "#F6F6F6",
            }}
          >
            <GridSection
              columns={6}
              items={genericFields}
            />
          </Box>
        );
      }

      case "eIA": {
        const eia = selectedApplicant.eiaDetails ?? {};
        const eiaFields = [
          {
            label: "Open eIA",
            value: eia.openEIA,
          },
          {
            label: "Existing eIA Number",
            value: eia.existingEIANumber,
          },
          {
            label: "Preferred Repository",
            value: eia.preferredRepository,
          },
          {
            label: "Convert Policies",
            value: eia.convertPolicies,
          },
        ];

        return (
          <Box
            sx={{
              mt: 1.5,
              p: 2,
              backgroundColor: "#F6F6F6",
              borderRadius: "8px",
            }}
          >
            <GridSection columns={4} items={eiaFields} />
          </Box>
        );
      }

      case "Payment & Payout": {
        const payment = selectedApplicant.paymentDetails ?? {};
        const payout = selectedApplicant.payoutDetails ?? {};
        const thirdPartyPayment =
          payment.isThirdPartyPayment ??
          payment.thirdPartyPayment ??
          payment.thirdPartyPaymentFlag ??
          payout.isThirdPartyPayment ??
          payout.thirdPartyPayment ??
          payout.thirdPartyPaymentFlag;

        const paymentFields = [
          {
            label: "Is it a Third Party payment",
            value: thirdPartyPayment,
          },
          { label: "Payment Options", value: payout.paymentOptions },
        ];

        const payoutFields = [
          { label: "Account Type", value: payout.accountType },
          { label: "Bank Type", value: payout.bankType },
          { label: "Branch", value: payout.branch },
          { label: "MICR Code", value: payout.micrCode },
          { label: "IFSC code", value: payout.ifscCode },
          { label: "Account Number", value: payout.accountNumber },
        ];

        return (
          <Box
            sx={{
              mt: roleType === "CVT_TASK" ? 0 : 1.5,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: roleType === "CVT_TASK" ? 0.75 : 1.5,
              alignItems: "stretch",
            }}
          >
            <DetailsCard compact={roleType === "CVT_TASK"} orangeHeader title="Payment Details" fields={paymentFields} />
            <DetailsCard compact={roleType === "CVT_TASK"} orangeHeader title="Payout Details" fields={payoutFields} />
          </Box>
        );
      }

      default:
        return null;
    }
  };

  const refreshApplicantSummary = async () => {
    if (readOnly) {
      return;
    }

    try {
      const currentUserId =
        localStorage.getItem("userId") ??
        localStorage.getItem("username") ??
        "";

      await dispatch(
        drsThunk({
          applicationNo: resolvedApplicationNumber,
          userId: currentUserId,
          roleType,
          businessType: resolvedBusinessType,
          sections: [
            "breDecision",
            "summary",
            "applicationOverview",
            "pivvSection",
            "requirementManagement",
            "decision",
            "quickLinks"
          ],
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to refresh applicant summary", error);
    }
  };

  const canShowApplicantActions = ![
    "CUW_TASK",
    "CVT_TASK",
    "CPT_DATA_ENTRY_NMR_TASK",
    "CPT_DATA_ENTRY_MR_TASK",
    "DVT_TASK",
    "DVT_FORMAL_TASK",
    "GUW_FORMAL_TASK",
    "RISK_TASK",
    "VENDOR_CMO_TASK",
    "PIVV_TASK",
    "CUW_CLAIM_AUDIT_TASK",
    "GROUP_VENDOR_CMO_TASK",
    "GROUP_REF_CMO_TASK",
    "MAS_TASK"
  ].includes(roleType);

  // const canShowRiskAnalytics = ![
  //   "CVT_TASK",
  //   "PIVV_TASK",
  //   "DVT_TASK",
  //   "CPT_DATA_ENTRY_NMR_TASK",
  //   "CPT_DATA_ENTRY_MR_TASK",
  //   "RECONSIDERATION_TASK",
  //   "AMR_NON_MEDICAL_TASK",
  //   "AMR_MEDICAL_TASK",
  //   "RISK_TASK"
  // ].includes(roleType);

  /* ------------------------------------------------------------------------ */
  /*                                   UI                                     */
  /* ------------------------------------------------------------------------ */


  if (activeDetailView === "medical") {
    return (
      <Box sx={{ width: "100%", minWidth: 0, px: 0.5 }}>
        <ViewMedical
          onBack={() => setActiveDetailView(null)}
          backLabel="Back to DRS"
        />
      </Box>
    );
  }

  if (activeDetailView === "financial") {
    return (
      <Box sx={{ width: "100%", minWidth: 0, px: 0.5 }}>
        <ViewFinancial
          onBack={() => setActiveDetailView(null)}
          backLabel="Back to DRS"
          onViewMedical={() => setActiveDetailView("medical")}
        />
      </Box>
    );
  }

  return (
    <Box sx={{
      px: roleType === "CVT_TASK" ? 0 : 1,
      ...(roleType === "CVT_TASK" && {
        py: 0, border: "1px solid #F1D8C8", borderRadius: "8px",
        overflow: "hidden",
        bgcolor: "#FFFFFF", boxShadow: "0 3px 12px rgba(169,33,41,.06)",
      }),
    }}>
        <Box sx={{ width: "100%" }}>
          {/* ================================================================= */}
          {/*                    PROPOSER / LIFE ASSURED                        */}
          {/* ================================================================= */}

          {roleType === "CVT_TASK" && selectedApplicant && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "108px minmax(0, 1fr)" } }}>
              <Box sx={{ p: 1, bgcolor: "#FFF8F2", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 0.75, borderRight: { sm: "1px solid #F1D8C8" },
                borderBottom: { xs: "1px solid #F1D8C8", sm: 0 } }}>
                <Box component="button" type="button" aria-label="View applicant photo"
                  onClick={() => {
                    const image = getApplicantImage(selectedApplicant);
                    if (image) { setPreviewImage(image); setIsImageDialogOpen(true); }
                  }}
                  sx={{ width: 80, maxWidth: "100%", height: 96, borderRadius: "6px", p: 0,
                    border: "1px solid #E8BEA1", bgcolor: "#FFFFFF", overflow: "hidden",
                    flexShrink: 0, display: "grid", placeItems: "center", color: "#A92129", fontSize: 28, fontWeight: 800,
                    cursor: getApplicantImage(selectedApplicant) ? "pointer" : "default" }}>
                  {getApplicantImage(selectedApplicant) ? (
                    <Box component="img" src={getApplicantImage(selectedApplicant)}
                      alt="Applicant" sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (selectedApplicant.memberType?.charAt(0)?.toUpperCase() || "A")}
                </Box>
                <Typography sx={{ color: "#A92129", fontSize: 11, fontWeight: 700, textAlign: "center" }}>
                  {formatMemberType(selectedApplicant.memberType, summary.length)}
                </Typography>
              </Box>
              <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1,
                px: 1.25, py: 0.75, bgcolor: "#FFF2E7", borderBottom: "1px solid #F1D8C8",
                flexWrap: "nowrap" }}>
                <Select size="small" value={selectedMemberTab}
                  inputProps={{ "aria-label": "Select applicant" }}
                  onChange={(event) => {
                    const index = Number(event.target.value);
                    setSelectedMemberTab(index);
                    onMemberChange?.(index);
                    setSelectedDetailTab(0);
                  }}
                  sx={{ width: { xs: 112, md: 132 }, minWidth: 0, flexShrink: 0, height: 32, bgcolor: "#FFFFFF",
                    fontSize: 12, fontWeight: 700, borderRadius: "6px",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E8CDBA" } }}>
                  {summary.map((member, index) => (
                    <MenuItem key={`${member.memberType}-${index}`} value={index}>
                      {formatMemberType(member.memberType, summary.length)}
                    </MenuItem>
                  ))}
                </Select>
                <Tabs value={safeDetailTab} onChange={handleDetailTabChange}
                  aria-label="Applicant profile details" variant="scrollable" scrollButtons="auto"
                  sx={{ flex: "1 1 0", minWidth: 0, minHeight: 32,
                    "& .MuiTabs-indicator": { bgcolor: "#E45F14", height: 3 },
                    "& .MuiTab-root": { minHeight: 32, px: 1, py: 0.5, minWidth: 0,
                      fontSize: 12, textTransform: "none", fontWeight: 600, color: "#6D5A4D" },
                    "& .MuiTab-root.Mui-selected": { color: "#B8450B", fontWeight: 800 } }}>
                  {innerTabs.map((tab, index) => (
                    <Tab key={tab} label={tab} id={`cvt-profile-tab-${index}`}
                      aria-controls="cvt-profile-panel" />
                  ))}
                </Tabs>
                <Box
                  sx={{
                    ml: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    flexShrink: 0,
                  }}
                >
                  {!readOnly && (
                    <CustomButton
                      variant="outlined"
                      onClick={() => setEditProfileOpen(true)}
                      sx={{
                        minWidth: 58,
                        height: 32,
                        px: 1.25,
                        flexShrink: 0,
                        borderRadius: "6px",
                        textTransform: "none",
                        fontSize: 12,
                        borderColor: "#E45F14",
                        color: "#A92129",
                        bgcolor: "#FFFFFF",
                        "&:hover": {
                          bgcolor: "#FFEAD7",
                          borderColor: "#C84B0D",
                        },
                      }}
                    >
                      Edit
                    </CustomButton>
                  )}

                  <CustomButton
                    variant="outlined"
                    onClick={() => setActiveDetailView("medical")}
                    sx={{
                      minWidth: 92,
                      height: 32,
                      px: 1.25,
                      flexShrink: 0,
                      borderRadius: "6px",
                      textTransform: "none",
                      fontSize: 12,
                      borderColor: "#E45F14",
                      color: "#A92129",
                      bgcolor: "#FFFFFF",
                      "&:hover": {
                        bgcolor: "#FFEAD7",
                        borderColor: "#C84B0D",
                      },
                    }}
                  >
                    View Medical
                  </CustomButton>

                  <CustomButton
                    variant="outlined"
                    onClick={() => setActiveDetailView("financial")}
                    sx={{
                      minWidth: 98,
                      height: 32,
                      px: 1.25,
                      flexShrink: 0,
                      borderRadius: "6px",
                      textTransform: "none",
                      fontSize: 12,
                      borderColor: "#E45F14",
                      color: "#A92129",
                      bgcolor: "#FFFFFF",
                      "&:hover": {
                        bgcolor: "#FFEAD7",
                        borderColor: "#C84B0D",
                      },
                    }}
                  >
                    View Financial
                  </CustomButton>
                </Box>
              </Box>
              <Box role="tabpanel" id="cvt-profile-panel"
                aria-labelledby={`cvt-profile-tab-${safeDetailTab}`}
                sx={{ p: 0.75, "& > .MuiBox-root": { mt: 0 } }}>
                {renderDetailContent()}
              </Box>
              </Box>
            </Box>
          )}

          {/* ================================================================= */}
          {/*                     VIEW MEDICAL AND FINANCIAL                    */}
          {/* ================================================================= */}

          {canShowApplicantActions && (
            <Box
              sx={{
                mt: 1.5,
                pt: 1.5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1.25,
                flexWrap: "wrap",
                borderTop: "1px solid #EEEEEE",
              }}
            >
              <CustomButton
                variant="outlined"
                sx={{
                  borderRadius: "50px",
                  px: 3,
                  py: 0.75,
                  width: { xs: "100%", sm: "180px" },
                  maxWidth: { xs: "280px", sm: "none" },
                  fontSize: "12px",
                  lineHeight: "16px",
                  fontWeight: 700,
                }}
                onClick={() => setActiveDetailView("medical")}
              >
                View Medicals
              </CustomButton>
              <CustomButton
                variant="outlined"
                sx={{
                  borderRadius: "50px",
                  px: 3,
                  py: 0.75,
                  width: { xs: "100%", sm: "180px" },
                  maxWidth: { xs: "280px", sm: "none" },
                  fontSize: "12px",
                  lineHeight: "16px",
                  fontWeight: 700,
                }}
                onClick={() => setActiveDetailView("financial")}
              >
                View Financials
              </CustomButton>
            </Box>
          )}

          {/* ================================================================= */}
          {/*                       NO SUMMARY DATA                              */}
          {/* ================================================================= */}

          {summary.length === 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100px",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#666666",
                }}
              >
                No applicant details available
              </Typography>
            </Box>
          )}
        </Box>


      {!readOnly && (
        <EditApplicantProfile
          open={editProfileOpen}
          memberIndex={selectedMemberTab}
          onClose={() => setEditProfileOpen(false)}
          onSave={handleEditProfileSave}
        />
      )}

      <CustomDialog
        open={isImageDialogOpen}
        onClose={() => {
          setIsImageDialogOpen(false);
          setPreviewImage(null);
        }}
        title="Profile Image"
        maxWidth="xs"
        contentSx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }}
      >
        {previewImage && (
          <Box
            component="img"
            src={previewImage}
            alt="Profile preview"
            sx={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "40vh",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        )}
      </CustomDialog>

  

    </Box>
  );
};

export default CVTApplicantProfile;