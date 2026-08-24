
import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { ReactNode } from "react";

interface ApplicationSection {
  key: string;
  label: string;
}

interface ApplicationWorkspaceProps {
  application: Record<string, unknown>;
  sections: ApplicationSection[];
  onBack: () => void;
}

interface SectionContentProps {
  title: string;
  application: Record<string, unknown>;
}

interface SubSection {
  key: string;
  label: string;
}

/**
 * ============================================================
 * DRS SUMMARY SUB-SECTIONS
 * ============================================================
 */

const DRS_SUB_SECTIONS: SubSection[] = [
  {
    key: "summary",
    label: "Summary",
  },
  {
    key: "discrepancy",
    label: "Discrepancy",
  },
  {
    key: "decision",
    label: "Decision",
  },
];

/**
 * ============================================================
 * FORMAT SECTION LABEL
 * ============================================================
 */

const formatSectionLabel = (value: string): string => {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * ============================================================
 * APPLICATION WORKSPACE
 * ============================================================
 */

const ApplicationWorkspace = ({
  application,
  sections,
  onBack,
}: ApplicationWorkspaceProps) => {
  /**
   * Make DRS Summary appear first.
   */
  const orderedSections = [
    ...sections.filter(
      (section) => section.key === "drsSummary",
    ),
    ...sections.filter(
      (section) => section.key !== "drsSummary",
    ),
  ];

  /**
   * First section selected by default.
   */
  const [selectedSection, setSelectedSection] = useState(
    orderedSections[0]?.key ?? "",
  );

  /**
   * DRS Summary selected tab.
   */
  const [selectedDrsSection, setSelectedDrsSection] =
    useState("summary");

  /**
   * ==========================================================
   * MAIN SECTION CLICK
   * ==========================================================
   */

  const handleSectionClick = (sectionKey: string) => {
    setSelectedSection(sectionKey);

    if (sectionKey === "drsSummary") {
      setSelectedDrsSection("summary");
    }
  };

  /**
   * ==========================================================
   * DRS SUMMARY
   * ==========================================================
   */

  const renderDrsSummary = () => {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ================================================== */}
        {/* DRS SUB TABS */}
        {/* ================================================== */}

        <Paper
          elevation={0}
          sx={{
            flexShrink: 0,
            mb: 0.75,
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "34px",
              display: "flex",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            {DRS_SUB_SECTIONS.map((subSection) => {
              const isActive =
                selectedDrsSection === subSection.key;

              return (
                <Box
                  key={subSection.key}
                  onClick={() =>
                    setSelectedDrsSection(
                      subSection.key,
                    )
                  }
                  sx={{
                    height: "100%",
                    px: 1.5,
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: "10.5px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive
                      ? "#9A2529"
                      : "#555",
                    borderBottom: isActive
                      ? "2px solid #9A2529"
                      : "2px solid transparent",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      backgroundColor: "#f8f8f8",
                    },
                  }}
                >
                  {subSection.label}
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* ================================================== */}
        {/* SCROLLABLE DRS CONTENT */}
        {/* ================================================== */}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: "auto",
            overflowX: "hidden",
            pr: 0.5,
            pb: 0.5,

            "&::-webkit-scrollbar": {
              width: "6px",
            },

            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f5f5f5",
            },

            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#c7c7c7",
              borderRadius: "4px",
            },

            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#a8a8a8",
            },
          }}
        >
          {selectedDrsSection === "summary" && (
            <DrsApplicationSummary
              application={application}
            />
          )}

          {selectedDrsSection === "discrepancy" && (
            <SectionContent
              title="Discrepancy"
              application={application}
            />
          )}

          {selectedDrsSection === "decision" && (
            <SectionContent
              title="Decision"
              application={application}
            />
          )}
        </Box>
      </Box>
    );
  };

  /**
   * ==========================================================
   * RENDER MAIN SECTION
   * ==========================================================
   */

  const renderSection = () => {
    switch (selectedSection) {
      case "drsSummary":
        return renderDrsSummary();

      case "breDecision1":
        return (
          <SectionContent
            title="BRE Decision"
            application={application}
          />
        );

      case "summary":
        return (
          <SectionContent
            title="Summary"
            application={application}
          />
        );

      case "applicationOverview1":
        return (
          <SectionContent
            title="Application Overview"
            application={application}
          />
        );

      case "pivvSection":
        return (
          <SectionContent
            title="PIVV Section"
            application={application}
          />
        );

      case "requirementManagement":
        return (
          <SectionContent
            title="Requirement Management"
            application={application}
          />
        );

      case "decision":
        return (
          <SectionContent
            title="Decision"
            application={application}
          />
        );

      case "quickLinks":
        return (
          <SectionContent
            title="Quick Links"
            application={application}
          />
        );

      default:
        return (
          <SectionContent
            title={
              orderedSections.find(
                (section) =>
                  section.key === selectedSection,
              )?.label ??
              formatSectionLabel(selectedSection)
            }
            application={application}
          />
        );
    }
  };

  /**
   * ==========================================================
   * MAIN WORKSPACE
   * ==========================================================
   */

  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(90vh - 16px)",
        display: "flex",
        gap: 1.5,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* ==================================================== */}
      {/* LEFT SIDEBAR */}
      {/* ==================================================== */}

      <Paper
        elevation={0}
        sx={{
          width: "210px",
          flexShrink: 0,
          height: "100%",
          minHeight: 0,
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <Box
          sx={{
            height: "42px",
            minHeight: "42px",
            px: 1.5,
            display: "flex",
            alignItems: "center",
            backgroundColor: "#0D4C7D",
            color: "#fff",
          }}
        >
          <Typography
            sx={{
              fontSize: "12.5px",
              fontWeight: 600,
            }}
          >
            DRS Summary
          </Typography>
        </Box>

        {/* ================================================== */}
        {/* APPLICATION NUMBER */}
        {/* ================================================== */}

        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#fafafa",
          }}
        >
          <Typography
            sx={{
              fontSize: "9.5px",
              color: "#777",
            }}
          >
            Application Number
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: "11px",
              fontWeight: 600,
              color: "#0D4C7D",
              wordBreak: "break-word",
            }}
          >
            {String(
              application.applicationNo ??
              application.applicationNumber ??
              application.application_no ??
              application.application_number ??
              "-",
            )}
          </Typography>
        </Box>

        {/* ================================================== */}
        {/* SECTION LIST */}
        {/* ================================================== */}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            py: 0.75,

            "&::-webkit-scrollbar": {
              width: "5px",
            },

            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#d0d0d0",
              borderRadius: "4px",
            },
          }}
        >
          {orderedSections.map((section) => {
            const isActive =
              selectedSection === section.key;

            return (
              <Box
                key={section.key}
                onClick={() =>
                  handleSectionClick(section.key)
                }
                sx={{
                  mx: 0.75,
                  mb: 0.25,
                  px: 1.25,
                  py: 0.7,
                  cursor: "pointer",
                  borderRadius: "5px",
                  borderLeft: isActive
                    ? "3px solid #9A2529"
                    : "3px solid transparent",
                  backgroundColor: isActive
                    ? "#fdf2f2"
                    : "transparent",
                  color: isActive
                    ? "#9A2529"
                    : "#333",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor: "#f8f8f8",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "11.5px",
                    fontWeight: isActive
                      ? 600
                      : 400,
                    lineHeight: 1.3,
                  }}
                >
                  {section.label ||
                    formatSectionLabel(
                      section.key,
                    )}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* ================================================== */}
        {/* BACK TO INBOX */}
        {/* ================================================== */}

        <Box
          onClick={onBack}
          sx={{
            flexShrink: 0,
            px: 1.5,
            py: 1,
            borderTop: "1px solid #e5e7eb",
            cursor: "pointer",
            color: "#0D4C7D",
            backgroundColor: "#fff",
            "&:hover": {
              backgroundColor: "#f8f8f8",
            },
          }}
        >
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            ← Back to Inbox
          </Typography>
        </Box>
      </Paper>

      {/* ==================================================== */}
      {/* RIGHT CONTENT */}
      {/* ==================================================== */}

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {renderSection()}
      </Box>
    </Box>
  );
};

/**
 * ============================================================
 * DRS APPLICATION SUMMARY
 * ============================================================
 */

interface DrsApplicationSummaryProps {
  application: Record<string, unknown>;
}

const DrsApplicationSummary = ({
  application,
}: DrsApplicationSummaryProps) => {
  /**
   * ==========================================================
   * HELPER TO READ API VALUES
   * ==========================================================
   */

  const getValue = (...keys: string[]): string => {
    for (const key of keys) {
      const value = application[key];

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return String(value);
      }
    }

    return "-";
  };

  /**
   * ==========================================================
   * APPLICANT DETAILS
   * ==========================================================
   */

  const applicantName = getValue(
    "applicantName",
    "customerName",
    "name",
    "insuredName",
    "proposerName",
    "applicant_name",
    "customer_name",
    "insured_name",
    "proposer_name",
  );

  const applicantAge = getValue(
    "age",
    "applicantAge",
    "customerAge",
    "insuredAge",
    "proposerAge",
    "applicant_age",
    "customer_age",
    "insured_age",
    "proposer_age",
  );

  const applicantDob = getValue(
    "dob",
    "dateOfBirth",
    "date_of_birth",
    "birthDate",
    "birth_date",
    "applicantDob",
    "applicantDOB",
    "customerDob",
    "customerDOB",
    "insuredDob",
    "insuredDOB",
  );

  const applicantOccupation = getValue(
    "occupation",
    "occupationName",
    "profession",
    "applicantOccupation",
    "customerOccupation",
    "insuredOccupation",
    "occupation_name",
    "applicant_occupation",
    "customer_occupation",
    "insured_occupation",
  );

  /**
   * ==========================================================
   * APPLICATION DETAILS
   * ==========================================================
   */

  const productName = getValue(
    "productName",
    "product",
    "productCode",
  );

  const appliedSA = getValue(
    "appliedSA",
    "appliedSa",
    "sumAssured",
    "appliedSumAssured",
  );

  const faceValue = getValue("faceValue");

  const channel = getValue("channel");

  const subChannel = getValue("subChannel");

  const agentCode = getValue("agentCode");

  const customerType = getValue("customerType");

  /**
   * ==========================================================
   * BRE DECISION
   * ==========================================================
   */

  const initialBre = getValue(
    "initialBreDecision",
    "initialBRE",
    "initialBre",
  );

  const finalBre = getValue(
    "finalBreDecision",
    "finalBRE",
    "finalBre",
  );

  /**
   * ==========================================================
   * IMAGE DETAILS
   * ==========================================================
   */

  const imageQuality = getValue("imageQuality");

  const faceMatchScore = getValue("faceMatchScore");

  /**
   * ==========================================================
   * SUMMARY
   * ==========================================================
   */

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        pb: 1,
      }}
    >
      {/* ================================================== */}
      {/* APPLICANT DETAILS */}
      {/* ================================================== */}

      <Box
        sx={{
          flexShrink: 0,
          px: 1,
          py: 0.75,
          border: "1px solid #D1D5DB",
          borderRadius: "6px",
          backgroundColor: "#fff",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: 0.75,

            "@media (max-width: 900px)": {
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
            },

            "@media (max-width: 600px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          <ApplicantInfo
            label="Applicant Name"
            value={applicantName}
          />

          <ApplicantInfo
            label="Age"
            value={applicantAge}
          />

          <ApplicantInfo
            label="Date of Birth"
            value={applicantDob}
          />

          <ApplicantInfo
            label="Occupation"
            value={applicantOccupation}
          />
        </Box>
      </Box>

      {/* ================================================== */}
      {/* APPLICATION DETAIL */}
      {/* ================================================== */}

      <SummaryCard title="Application Detail">
        <SummaryGrid
          items={[
            ["Product", productName],
            ["Applied SA", appliedSA],
            ["Face Value", faceValue],
            ["Channel", channel],
            ["Sub Channel", subChannel],
            ["Agent Code", agentCode],
            ["Customer Type", customerType],
            ["Image Quality", imageQuality],
            ["Face Match Score", faceMatchScore],
          ]}
        />
      </SummaryCard>

      {/* ================================================== */}
      {/* BRE DECISION - COMPACT */}
      {/* ================================================== */}

      <SummaryCard title="BRE Decision">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: 0.75,

            "@media (max-width: 700px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          <CompactDecision
            label="Initial Decision"
            value={initialBre}
          />

          <CompactDecision
            label="Final Decision"
            value={finalBre}
          />
        </Box>
      </SummaryCard>

      {/* ================================================== */}
      {/* REQUIREMENT STATUS */}
      {/* ================================================== */}

      <SummaryCard title="Requirement Status">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: 0.75,
          }}
        >
          <StatusBox
            label="Total Requirements"
            value="5"
          />

          <StatusBox
            label="Completed"
            value="0"
          />

          <StatusBox
            label="Pending"
            value="5"
          />
        </Box>

        {/* REQUIREMENT LIST */}

        <Box
          sx={{
            mt: 0.65,
            display: "grid",
            gridTemplateColumns:
              "repeat(5, minmax(0, 1fr))",
            gap: 0.6,

            "@media (max-width: 1000px)": {
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
            },

            "@media (max-width: 700px)": {
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
            },
          }}
        >
          {[
            ["KYC", "Driving License"],
            ["Medical", "Education / Sign"],
            ["Application", "Education / Sign"],
            ["KYC", "PAN Card"],
            ["NRI-OCI", "Passport"],
          ].map(([category, document]) => (
            <Box
              key={`${category}-${document}`}
              sx={{
                minWidth: 0,
                p: 0.65,
                border: "1px solid #edf0f2",
                borderRadius: "5px",
                backgroundColor: "#fafbfc",
              }}
            >
              <Typography
                sx={{
                  fontSize: "9.5px",
                  fontWeight: 600,
                  color: "#444",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {category}
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: "9.5px",
                  color: "#374151",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {document}
              </Typography>

              <Box
                sx={{
                  display: "inline-flex",
                  mt: 0.35,
                  px: 0.6,
                  py: 0.15,
                  borderRadius: "8px",
                  backgroundColor: "#fff1f1",
                  color: "#9A2529",
                  fontSize: "8px",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                Pending
              </Box>
            </Box>
          ))}
        </Box>
      </SummaryCard>

      {/* ================================================== */}
      {/* KEY FLAGS */}
      {/* ================================================== */}

      <SummaryCard title="Key Flags & Observations">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: 0.6,

            "@media (max-width: 700px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          <FlagRow text="Documents are pending for review." />

          <FlagRow text="Mismatch identified in information provided." />

          <FlagRow text="PAN Card has not been submitted." />

          <FlagRow text="Passport has not been submitted." />
        </Box>
      </SummaryCard>

      {/* ================================================== */}
      {/* UNDERWRITER ACTION */}
      {/* ================================================== */}

      <Box
        sx={{
          flexShrink: 0,
          px: 1,
          py: 0.75,
          borderRadius: "6px",
          backgroundColor: "#f7f9fb",
          border: "1px solid #dfe5ea",
        }}
      >
        <Typography
          sx={{
            fontSize: "10.5px",
            fontWeight: 600,
            color: "#0D4C7D",
            mb: 0.25,
          }}
        >
          Underwriter Action
        </Typography>

        <Typography
          sx={{
            fontSize: "9.5px",
            color: "#555",
            lineHeight: 1.35,
          }}
        >
          Review the outstanding requirements
          and identified discrepancies before
          proceeding with the final CVT decision.
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * ============================================================
 * APPLICANT INFO
 * ============================================================
 */

const ApplicantInfo = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 0.75,
        py: 0.5,
        backgroundColor: "#f8fafb",
        borderRadius: "4px",
        border: "1px solid #f0f2f3",
      }}
    >
      <Typography
        sx={{
          fontSize: "9.5px",
          color: "#374151",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.15,
          fontSize: "10px",
          fontWeight: 600,
          color: "#333",
          wordBreak: "break-word",
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

/**
 * ============================================================
 * SUMMARY CARD
 * ============================================================
 */

const SummaryCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        flexShrink: 0,
        px: 1,
        py: 0.75,
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        backgroundColor: "#fff",
      }}
    >
      <Typography
        sx={{
          mb: 0.6,
          fontSize: "10.5px",
          fontWeight: 600,
          color: "#333",
        }}
      >
        {title}
      </Typography>

      {children}
    </Paper>
  );
};

/**
 * ============================================================
 * SUMMARY GRID
 * ============================================================
 */

const SummaryGrid = ({
  items,
}: {
  items: [string, string][];
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns:
          "repeat(6, minmax(0, 1fr))",
        gap: 0.6,

        "@media (max-width: 1100px)": {
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        },

        "@media (max-width: 700px)": {
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        },
      }}
    >
      {items.map(([label, value]) => (
        <Box
          key={label}
          sx={{
            minWidth: 0,
            px: 0.65,
            py: 0.5,
            backgroundColor: "#f8fafb",
            borderRadius: "4px",
            border: "1px solid #f0f2f3",
          }}
        >
          <Typography
            sx={{
              fontSize: "9.5px",
              color: "#374151",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              mt: 0.15,
              fontSize: "9.5px",
              fontWeight: 600,
              color: "#333",
              wordBreak: "break-word",
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

/**
 * ============================================================
 * COMPACT BRE DECISION
 * ============================================================
 */

const CompactDecision = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  const normalizedValue = value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  const isApproved =
    normalizedValue.includes("approve") ||
    normalizedValue.includes("accepted") ||
    normalizedValue === "pass" ||
    normalizedValue === "passed";

  const isRejected =
    normalizedValue.includes("reject") ||
    normalizedValue.includes("decline") ||
    normalizedValue === "fail" ||
    normalizedValue === "failed";

  const isPending =
    normalizedValue.includes("pending") ||
    normalizedValue.includes("review") ||
    normalizedValue === "-";

  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: "40px",
        px: 0.9,
        py: 0.55,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        border: "1px solid #e5e7eb",
        borderRadius: "5px",
        backgroundColor: "#fafbfc",
      }}
    >
      {/* LABEL */}

      <Typography
        sx={{
          minWidth: 0,
          fontSize: "9.5px",
          fontWeight: 500,
          color: "#4b5563",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </Typography>

      {/* VALUE */}

      <Box
        sx={{
          flexShrink: 0,
          maxWidth: "55%",
          px: 0.8,
          py: 0.25,
          borderRadius: "10px",
          backgroundColor: isApproved
            ? "#ecfdf3"
            : isRejected
              ? "#fff1f2"
              : isPending
                ? "#fff8e7"
                : "#eef4f8",
          color: isApproved
            ? "#087443"
            : isRejected
              ? "#9A2529"
              : isPending
                ? "#946200"
                : "#0D4C7D",
          fontSize: "9px",
          fontWeight: 600,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </Box>
    </Box>
  );
};

/**
 * ============================================================
 * STATUS BOX
 * ============================================================
 */

const StatusBox = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <Box
      sx={{
        p: 0.6,
        textAlign: "center",
        borderRadius: "5px",
        backgroundColor: "#f7f9fb",
        border: "1px solid #edf0f2",
      }}
    >
      <Typography
        sx={{
          fontSize: "9.5px",
          color: "#374151",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.1,
          fontSize: "13px",
          fontWeight: 600,
          color: "#0D4C7D",
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

/**
 * ============================================================
 * FLAG ROW
 * ============================================================
 */

const FlagRow = ({
  text,
}: {
  text: string;
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.6,
        minWidth: 0,
        p: 0.5,
        borderRadius: "4px",
        backgroundColor: "#fff8f8",
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          flexShrink: 0,
          borderRadius: "50%",
          backgroundColor: "#9A2529",
        }}
      />

      <Typography
        sx={{
          fontSize: "9.5px",
          color: "#555",
          lineHeight: 1.25,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

/**
 * ============================================================
 * GENERIC SECTION CONTENT
 * ============================================================
 */

const SectionContent = ({
  title,
  application,
}: SectionContentProps) => {
  /**
   * Remove application-number fields
   * from generic information display.
   */
  const informationEntries = Object.entries(
    application,
  ).filter(([key]) => {
    const normalizedKey = key
      .replace(/_/g, "")
      .replace(/\s/g, "")
      .toLowerCase();

    return (
      normalizedKey !== "applicationno" &&
      normalizedKey !== "applicationnumber"
    );
  });

  /**
   * Format field label.
   */
  const formatLabel = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .replace(
        /([a-z])([A-Z])/g,
        "$1 $2",
      )
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase(),
      );
  };

  /**
   * Format field value.
   */
  const formatValue = (
    value: unknown,
  ): string => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return "-";
      }
    }

    return String(value);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        minHeight: "100%",
        boxSizing: "border-box",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        backgroundColor: "#fff",
        p: 1.25,
      }}
    >
      {/* ================================================== */}
      {/* SECTION HEADER */}
      {/* ================================================== */}

      <Box
        sx={{
          mb: 1,
          pb: 0.75,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#0D4C7D",
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* ================================================== */}
      {/* APPLICATION DATA */}
      {/* ================================================== */}

      {informationEntries.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(6, minmax(0, 1fr))",
            gap: 0.75,

            "@media (max-width: 1100px)": {
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
            },

            "@media (max-width: 700px)": {
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
            },
          }}
        >
          {informationEntries.map(
            ([key, value]) => (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.25,
                  minWidth: 0,
                  px: 0.8,
                  py: 0.65,
                  border:
                    "1px solid #edf0f2",
                  borderRadius: "5px",
                  backgroundColor: "#fff",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "10px",
                    color: "#374151",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {formatLabel(key)}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "10px",
                    color: "#333",
                    wordBreak:
                      "break-word",
                    lineHeight: 1.25,
                  }}
                >
                  {formatValue(value)}
                </Typography>
              </Box>
            ),
          )}
        </Box>
      ) : (
        <Box
          sx={{
            p: 1.5,
            borderRadius: "5px",
            backgroundColor: "#f7f9fb",
            border: "1px solid #edf0f2",
          }}
        >
          <Typography
            sx={{
              fontSize: "10.5px",
              color: "#777",
            }}
          >
            No information available.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ApplicationWorkspace;
