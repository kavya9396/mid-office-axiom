import { Box, Button, Tab, Tabs, Typography } from "@mui/material";
import { useState, type SyntheticEvent } from "react";
import { useSelector } from "react-redux";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import { title } from "../../../utils/constant";
import type { RootState } from "../../../store/store";
import EditApplicantProfile from "./EditApplicantProfile";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface FaceMatchDetails {
  document?: string;
  faceMatchScore?: number | string;
  imageQuality?: string;
  remarks?: string;
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

interface SummaryMember {
  memberType: string;
  faceMatchDetails?: FaceMatchDetails;
  profileImage?: string;
  proposerSummary?: PersonalSummary;
  applicantDetails?: ApplicantDetails;
  kycDetails?: KycDetails;
  address?: AddressDetails[];
  contactDetails?: ContactDetails;
  paymentDetails?: PaymentDetails;
  payoutDetails?: PayoutDetails;
}
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

const formatDateOnly = (value?: string): string =>
  value ? value.split("T")[0] : "-";

const DetailField = ({ label, value }: { label: string; value: unknown }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={{ fontSize: "12px", color: "#333333", lineHeight: 1.35 }}>
      {label}
    </Typography>
    <Typography
      sx={{
        mt: "3px",
        fontSize: "10px",
        color: "#111111",
        fontWeight: 700,
        lineHeight: 1.35,
        overflowWrap: "anywhere",
      }}
    >
      {displayValue(value)}
    </Typography>
  </Box>
);

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

const DetailsCard = ({
  title: cardTitle,
  fields,
}: {
  title: string;
  fields: { label: string; value: unknown }[];
}) => (
  <Box
    sx={{
      minWidth: 0,
      p: 2,
      backgroundColor: "#F6F6F6",
      borderRadius: "8px",
    }}
  >
    <Typography
      sx={{ mb: 2, fontSize: "12px", fontWeight: 700, color: "#161616" }}
    >
      {cardTitle}
    </Typography>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        columnGap: 2,
        rowGap: 2,
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

const ApplicantProfile = () => {
  const drsData = useSelector((state: RootState) => state.drs.data);
  const drsRecord = (drsData ?? {}) as Record<string, unknown>;

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
  const summary = (drsData?.summary ?? []) as SummaryMember[];

  /*
   * roleType is coming from localStorage.
   * If it doesn't exist, DEFAULT configuration is used.
   */
  const roleType = localStorage.getItem("roleType") ?? "DEFAULT";

  /* ------------------------------------------------------------------------ */
  /*                                STATE                                     */
  /* ------------------------------------------------------------------------ */

  const [selectedMemberTab, setSelectedMemberTab] = useState(0);
  const [selectedDetailTab, setSelectedDetailTab] = useState(0);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const applicationNumber = String(
    drsRecord.applicationNumber ??
      drsRecord.applicationNo ??
      localStorage.getItem("applicationNumber") ??
      "",
  );

  const handleEditProfileSave = () => {
    setEditProfileOpen(false);
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

  /* ------------------------------------------------------------------------ */
  /*                         MEMBER TAB CHANGE                                */
  /* ------------------------------------------------------------------------ */

  const handleMemberTabChange = (_event: SyntheticEvent, newValue: number) => {
    setSelectedMemberTab(newValue);

    /*
     * Whenever Proposer/Life Assured changes,
     * always open the first inner tab.
     */
    setSelectedDetailTab(0);
  };

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
        const faceMatchDetails = selectedApplicant?.faceMatchDetails;

        return (
          <Box
            sx={{
              width: "100%",
              backgroundColor: "#F6F6F6",
              borderRadius: "6px",
              px: 2,
              py: 1.5,
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "2fr 1fr 2fr 2fr",
                columnGap: 4,
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#666666",
                    lineHeight: 1.4,
                  }}
                >
                  Document
                </Typography>

                <Typography
                  sx={{
                    fontSize: "15px",
                    color: "#111111",
                    fontWeight: 500,
                    lineHeight: 1.4,
                    mt: "2px",
                  }}
                >
                  {faceMatchDetails?.document || "-"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#666666",
                    lineHeight: 1.4,
                  }}
                >
                  Face Match Score
                </Typography>

                <Typography
                  sx={{
                    fontSize: "15px",
                    color: "#111111",
                    fontWeight: 500,
                    lineHeight: 1.4,
                    mt: "2px",
                  }}
                >
                  {faceMatchDetails?.faceMatchScore ?? "-"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#666666",
                    lineHeight: 1.4,
                  }}
                >
                  Image Quality
                </Typography>

                <Typography
                  sx={{
                    fontSize: "15px",
                    color: "#111111",
                    fontWeight: 500,
                    lineHeight: 1.4,
                    mt: "2px",
                  }}
                >
                  {faceMatchDetails?.imageQuality || "-"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#666666",
                    lineHeight: 1.4,
                  }}
                >
                  Remarks
                </Typography>

                <Typography
                  sx={{
                    fontSize: "15px",
                    color: "#111111",
                    fontWeight: 500,
                    lineHeight: 1.4,
                    mt: "2px",
                  }}
                >
                  {faceMatchDetails?.remarks || "-"}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      }

      case "Personal & KYC": {
        const personal = selectedApplicant.proposerSummary ?? {};
        const applicant = selectedApplicant.applicantDetails ?? {};
        const kyc = selectedApplicant.kycDetails ?? {};
        const applicantName = [
          personal.firstName,
          personal.middleName,
          personal.lastName,
        ]
          .filter(Boolean)
          .join(" ");
        const age = personal.age?.years;

        const personalFields = [
          { label: "Applicant Name", value: applicantName },
          {
            label: "Date of Birth",
            value: formatDateOnly(personal.dob || applicant.dateOfBirth),
          },
          {
            label: "Age",
            value: age === null || age === undefined ? "-" : `${age} Years`,
          },
          { label: "Gender", value: personal.gender || applicant.gender },
          {
            label: "Marital Status",
            value: personal.maritalStatus || applicant.maritalStatus,
          },
          {
            label: "Nationality",
            value: personal.nationality || applicant.nationality,
          },
          {
            label: "Country of Residence",
            value: personal.countryOfResidence || applicant.countryOfResidence,
          },
          {
            label: "Education",
            value: personal.education || applicant.education,
          },
          {
            label: "Resident Status",
            value: personal.immigrationStatus || personal.residentStatus,
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
          { label: "PRAN Number", value: kyc.pranNo },
          {
            label: "PRAN Number Verification",
            value: kyc.pranNoVerification || kyc.pranNoVerifivation,
          },
          { label: "PAN Number", value: kyc.panNumber },
          { label: "PAN Flag", value: kyc.panFlag },
          {
            label: "PAN Aadhar Seeding Status",
            value: kyc.panAadharSeedingStatus,
          },
          { label: "Identity Proof Type", value: kyc.identityProofType },
          {
            label: "Identity Proof Expiry Date",
            value: formatDateOnly(kyc.identityProofExpiryDate),
          },
          { label: "Identity Proof Number", value: kyc.identityProofNumber },
          { label: "Address Proof", value: kyc.addressProof },
          { label: "Income Proof", value: kyc.incomeProof },
          { label: "CKYC Number", value: kyc.existingCkycNumber },
          { label: "PEP", value: kyc.pep },
          { label: "Criminal Proceedings", value: kyc.criminalProceedings },
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
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(8, minmax(0, 1fr))",
                },
                columnGap: 2,
                rowGap: 1,
              }}
            >
              {personalFields.map((field) => (
                <DetailField key={field.label} {...field} />
              ))}
            </Box>

            <Box sx={{ borderTop: "1px solid #AFAFAF", my: 2 }} />

            <Typography
              sx={{
                mb: 1.5,
                fontSize: "12px",
                fontWeight: 700,
                color: "#161616",
              }}
            >
              KYC
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(8, minmax(0, 1fr))",
                },
                columnGap: 2,
                rowGap: 1,
              }}
            >
              {kycFields.map((field) => (
                <DetailField key={field.label} {...field} />
              ))}
            </Box>
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
              mt: 1.5,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1.5,
              alignItems: "stretch",
            }}
          >
            <DetailsCard
              title="Communication Address"
              fields={getAddressFields(communicationAddress)}
            />
            <DetailsCard
              title="Permanent Address"
              fields={getAddressFields(permanentAddress)}
            />
            <DetailsCard title="Contact Details" fields={contactFields} />
          </Box>
        );
      }

      case "Financial & Profession":
        return (
          <Box sx={{ p: 1 }}>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#161616",
              }}
            >
              Financial & Profession
            </Typography>

            {/* Financial & Profession content */}
          </Box>
        );

      case "Medical & Lifestyle":
        return (
          <Box sx={{ p: 1 }}>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#161616",
              }}
            >
              Medical & Lifestyle
            </Typography>

            {/* Medical & Lifestyle content */}
          </Box>
        );

      case "Nominee":
        return (
          <Box sx={{ p: 1 }}>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#161616",
              }}
            >
              Nominee
            </Typography>

            {/* Nominee content */}
          </Box>
        );

      case "Generic":
        return (
          <Box sx={{ p: 1 }}>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#161616",
              }}
            >
              Generic
            </Typography>

            {/* Generic content */}
          </Box>
        );

      case "eIA":
        return (
          <Box sx={{ p: 1 }}>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#161616",
              }}
            >
              eIA
            </Typography>

            {/* eIA content */}
          </Box>
        );

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
              mt: 1.5,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 1.5,
              alignItems: "stretch",
            }}
          >
            <DetailsCard title="Payment Details" fields={paymentFields} />
            <DetailsCard title="Payout Details" fields={payoutFields} />
          </Box>
        );
      }

      default:
        return null;
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                   UI                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <Box sx={{ p: 1 }}>
      <CustomAccordion
        title={title.applicantDetails}
        defaultExpanded
        headerActions={
          roleType === "CVT_TASK" ? (
            <Button
              type="button"
              variant="outlined"
              onClick={(event) => {
                event.stopPropagation();
                setEditProfileOpen(true);
              }}
              sx={{
                minWidth: "20px",
                height: "25px",
                px: 3,
                border: "1px solid #A92129",
                borderRadius: "22px",
                borderColor: "#A92129",
                backgroundColor: "#FFFFFF",
                color: "#A92129",
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: 1,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  borderColor: "#A92129",
                  backgroundColor: "#FFF5F5",
                  boxShadow: "none",
                },
              }}
            >
              Edit
            </Button>
          ) : null
        }
      >
        <Box sx={{ width: "100%" }}>
          {/* ================================================================= */}
          {/*                    PROPOSER / LIFE ASSURED                        */}
          {/* ================================================================= */}

          {summary.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                mb: 1.5,
                gap: 1.5,
              }}
            >
              {/* Applicant Image */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1px solid #D9D9D9",
                  backgroundColor: "#F2F2F2",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {getApplicantImage(selectedApplicant) ? (
                  <Box
                    component="img"
                    src={getApplicantImage(selectedApplicant)}
                    alt={formatMemberType(
                      selectedApplicant?.memberType,
                      summary.length,
                    )}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#999999",
                    }}
                  >
                    {selectedApplicant?.memberType?.charAt(0)?.toUpperCase() ||
                      "A"}
                  </Typography>
                )}
              </Box>

              {/* Proposer / Life Assured Tabs */}
              <Tabs
                value={selectedMemberTab}
                onChange={handleMemberTabChange}
                sx={{
                  minHeight: "34px",
                  height: "34px",
                  width: "fit-content",
                  border: "1px solid #D9D9D9",
                  borderRadius: "18px",
                  padding: "2px",
                  backgroundColor: "#FFFFFF",

                  "& .MuiTabs-indicator": {
                    display: "none",
                  },

                  "& .MuiTabs-flexContainer": {
                    gap: "2px",
                  },
                }}
              >
                {summary.map((member, index) => (
                  <Tab
                    key={`${member.memberType}-${index}`}
                    label={formatMemberType(member.memberType, summary.length)}
                    sx={{
                      minHeight: "28px",
                      height: "28px",
                      minWidth: "auto",
                      padding: "0 12px",
                      borderRadius: "15px",
                      textTransform: "none",
                      fontSize: "13px",
                      lineHeight: 1,
                      color: "#666666",
                      fontWeight: 500,

                      "&.Mui-selected": {
                        backgroundColor: "#A92129",
                        color: "#FFFFFF",
                        fontWeight: 600,
                      },

                      "&:hover": {
                        backgroundColor:
                          selectedMemberTab === index ? "#A92129" : "#F7F7F7",
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          )}

          {/* ================================================================= */}
          {/*                         INNER TABS                                 */}
          {/* ================================================================= */}

          {selectedApplicant && innerTabs.length > 0 && (
            <Box sx={{ width: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Tabs
                  value={safeDetailTab}
                  onChange={handleDetailTabChange}
                  variant="scrollable"
                  scrollButtons={false}
                  sx={{
                    minHeight: "32px",
                    height: "32px",
                    maxWidth: "100%",
                    border: "1px solid #E1E1E1",
                    borderRadius: "17px",
                    padding: "2px",
                    backgroundColor: "#FAFAFA",

                    "& .MuiTabs-indicator": {
                      display: "none",
                    },

                    "& .MuiTabs-flexContainer": {
                      gap: "1px",
                    },

                    "& .MuiTabs-scroller": {
                      overflowX: "auto !important",
                      scrollbarWidth: "none",

                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                    },
                  }}
                >
                  {innerTabs.map((tab, index) => (
                    <Tab
                      key={tab}
                      label={tab}
                      sx={{
                        minHeight: "26px",
                        height: "26px",
                        minWidth: "auto",
                        padding: "0 10px",
                        borderRadius: "12px",
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        fontSize: "12px",
                        lineHeight: 1,
                        color: "#666666",
                        fontWeight: 500,

                        "&.Mui-selected": {
                          backgroundColor: "#A92129",
                          color: "#FFFFFF",
                          fontWeight: 600,
                        },

                        "&:hover": {
                          backgroundColor:
                            safeDetailTab === index ? "#A92129" : "#F2F2F2",
                        },
                      }}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* ============================================================= */}
              {/*                         TAB CONTENT                            */}
              {/* ============================================================= */}

              <Box sx={{ mt: 1 }}>{renderDetailContent()}</Box>
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
      </CustomAccordion>

      <EditApplicantProfile
        open={editProfileOpen}
        applicationNumber={applicationNumber}
        memberIndex={selectedMemberTab}
        onClose={() => setEditProfileOpen(false)}
        onSave={handleEditProfileSave}
      />
    </Box>
  );
};

export default ApplicantProfile;
