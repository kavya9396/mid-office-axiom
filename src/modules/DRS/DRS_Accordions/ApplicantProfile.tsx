import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState, type SyntheticEvent } from "react";
import { useSelector } from "react-redux";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import { title } from "../../../utils/constant";
import type { RootState } from "../../../store/store";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */



interface FaceMatchDetails {
  document?: string;
  faceMatchScore?: number | string;
  imageQuality?: string;
  remarks?: string;
}

interface SummaryMember {
  memberType: string;
  faceMatchDetails?: FaceMatchDetails;
  profileImage?:string;
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

  PIVV_TASK: [
    "Image Details",
    "Personal & KYC",
    "Contact & Address",
  ],

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

const formatMemberType = (memberType: string = "") => {
  const labels: Record<string, string> = {
    proposer: "Proposer",
    lifeassured: "Life Assured",
  };

  return labels[memberType.toLowerCase()] || memberType;
};
const getApplicantImage = (member?: SummaryMember) => {
  if (!member) return "";

  return (
    member.profileImage
  );
};
/* -------------------------------------------------------------------------- */
/*                            MAIN COMPONENT                                  */
/* -------------------------------------------------------------------------- */

const ApplicantProfile = () => {
  const drsData = useSelector((state: RootState) => state.drs.data);
 

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

  /* ------------------------------------------------------------------------ */
  /*                         ROLE BASED TABS                                   */
  /* ------------------------------------------------------------------------ */

  const innerTabs =
    applicantTabConfig[roleType] ?? applicantTabConfig.DEFAULT;

  /*
   * Prevent invalid index if the role configuration contains fewer tabs
   * than the previously selected index.
   */
  const safeDetailTab =
    selectedDetailTab >= innerTabs.length
      ? 0
      : selectedDetailTab;

  /* ------------------------------------------------------------------------ */
  /*                         SELECTED APPLICANT                                */
  /* ------------------------------------------------------------------------ */

  const selectedApplicant = summary[selectedMemberTab];

  /* ------------------------------------------------------------------------ */
  /*                         MEMBER TAB CHANGE                                */
  /* ------------------------------------------------------------------------ */

  const handleMemberTabChange = (
    _event: SyntheticEvent,
    newValue: number
  ) => {
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

  const handleDetailTabChange = (
    _event: SyntheticEvent,
    newValue: number
  ) => {
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

      case "Personal & KYC":
        return (
          <Box sx={{ p: 1 }}>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#161616",
              }}
            >
              Personal & KYC
            </Typography>

            {/* Personal & KYC content */}
          </Box>
        );

      case "Contact & Address":
        return (
          <Box sx={{ p: 1 }}>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#161616",
              }}
            >
              Contact & Address
            </Typography>

            {/* Contact & Address content */}
          </Box>
        );

      case "Financial & Profession":
        return (
          <Box sx={{ p: 1 }}>
            <Typography
              sx={{
                fontSize: "14px",
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
                fontSize: "14px",
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
                fontSize: "14px",
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
                fontSize: "14px",
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
                fontSize: "14px",
                fontWeight: 600,
                color: "#161616",
              }}
            >
              eIA
            </Typography>

            {/* eIA content */}
          </Box>
        );

      case "Payment & Payout":
        return (
          <Box sx={{ p: 1 }}>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#161616",
              }}
            >
              Payment & Payout
            </Typography>

            {/* Payment & Payout content */}
          </Box>
        );

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
          alt={formatMemberType(selectedApplicant?.memberType)}
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
          {selectedApplicant?.memberType
            ?.charAt(0)
            ?.toUpperCase() || "A"}
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
          label={formatMemberType(member.memberType)}
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
                selectedMemberTab === index
                  ? "#A92129"
                  : "#F7F7F7",
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
                        borderRadius: "14px",
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
                            safeDetailTab === index
                              ? "#A92129"
                              : "#F2F2F2",
                        },
                      }}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* ============================================================= */}
              {/*                         TAB CONTENT                            */}
              {/* ============================================================= */}

              <Box sx={{ mt: 1 }}>
                {renderDetailContent()}
              </Box>
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
                  fontSize: "14px",
                  color: "#666666",
                }}
              >
                No applicant details available
              </Typography>
            </Box>
          )}
        </Box>
      </CustomAccordion>
    </Box>
  );
};

export default ApplicantProfile;