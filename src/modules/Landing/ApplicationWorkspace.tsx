import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { useState } from "react";

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
 * DRS Summary sub-sections
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
 * Convert section keys into readable labels
 * when API does not provide a label.
 */
const formatSectionLabel = (
  value: string,
): string => {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
};

const ApplicationWorkspace = ({
  application,
  sections,
  onBack,
}: ApplicationWorkspaceProps) => {
  /**
   * Make sure DRS Summary appears first.
   *
   * If the parent already sends the correct order,
   * this does not change the remaining order.
   */
  const orderedSections = [
    ...sections.filter(
      (section) =>
        section.key === "drsSummary",
    ),
    ...sections.filter(
      (section) =>
        section.key !== "drsSummary",
    ),
  ];

  /**
   * First section is selected by default.
   */
  const [selectedSection, setSelectedSection] =
    useState<string>(
      orderedSections[0]?.key ?? "",
    );

  /**
   * DRS Summary currently selected tab.
   */
  const [selectedDrsSection, setSelectedDrsSection] =
    useState<string>("summary");

  /**
   * Application number.
   *
   * Supports different possible API field names.
   */
  const applicationNumber =
    application.applicationNo ??
    application.applicationNumber ??
    application.application_no ??
    application.application_number ??
    "-";

  /**
   * Select main application section.
   */
  const handleSectionClick = (
    sectionKey: string,
  ) => {
    setSelectedSection(sectionKey);

    /**
     * Whenever DRS Summary is opened,
     * default to Summary.
     */
    if (sectionKey === "drsSummary") {
      setSelectedDrsSection("summary");
    }
  };

  /**
   * DRS Summary content.
   */
  const renderDrsSummary = () => {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ============================================ */}
        {/* DRS SUB TABS */}
        {/* ============================================ */}

        <Paper
          elevation={0}
          sx={{
            flexShrink: 0,
            mb: 1,
            border:
              "1px solid #e5e7eb",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "38px",
              display: "flex",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            {DRS_SUB_SECTIONS.map(
              (subSection) => {
                const isActive =
                  selectedDrsSection ===
                  subSection.key;

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
                      px: 2,

                      display: "flex",
                      alignItems: "center",

                      cursor: "pointer",

                      fontSize: "11.5px",

                      fontWeight: isActive
                        ? 600
                        : 400,

                      color: isActive
                        ? "#9A2529"
                        : "#555",

                      borderBottom:
                        isActive
                          ? "2px solid #9A2529"
                          : "2px solid transparent",

                      transition:
                        "all 0.15s ease",

                      "&:hover": {
                        backgroundColor:
                          "#f8f8f8",
                      },
                    }}
                  >
                    {subSection.label}
                  </Box>
                );
              },
            )}
          </Box>
        </Paper>

        {/* ============================================ */}
        {/* DRS CONTENT */}
        {/* ============================================ */}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,

            overflowY: "auto",
            overflowX: "hidden",

            pr: 0.5,

            "&::-webkit-scrollbar": {
              width: "5px",
            },

            "&::-webkit-scrollbar-thumb": {
              backgroundColor:
                "#c7c7c7",
              borderRadius: "10px",
            },

            "&::-webkit-scrollbar-track": {
              backgroundColor:
                "#f5f5f5",
            },
          }}
        >
          {selectedDrsSection ===
            "summary" && (
            <SectionContent
              title="Summary"
              application={application}
            />
          )}

          {selectedDrsSection ===
            "discrepancy" && (
            <SectionContent
              title="Discrepancy"
              application={application}
            />
          )}

          {selectedDrsSection ===
            "decision" && (
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
   * Render main right-side section.
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
                  section.key ===
                  selectedSection,
              )?.label ??
              formatSectionLabel(
                selectedSection,
              )
            }
            application={application}
          />
        );
    }
  };

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
      {/* ================================================== */}
      {/* LEFT SIDEBAR */}
      {/* ================================================== */}

      <Paper
        elevation={0}
        sx={{
          width: "210px",

          flexShrink: 0,

          height: "100%",

          minHeight: 0,

          border:
            "1px solid #e5e7eb",

          borderRadius: "8px",

          overflow: "hidden",

          display: "flex",

          flexDirection: "column",
        }}
      >
        {/* ================================================ */}
        {/* HEADER */}
        {/* ================================================ */}

        <Box
          sx={{
            height: "42px",

            minHeight: "42px",

            px: 1.5,

            display: "flex",

            alignItems: "center",

            backgroundColor:
              "#0D4C7D",

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

        {/* ================================================ */}
        {/* APPLICATION NUMBER */}
        {/* ================================================ */}

        <Box
          sx={{
            px: 1.5,
            py: 1.2,

            borderBottom:
              "1px solid #e5e7eb",

            backgroundColor:
              "#fafafa",
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
              mt: 0.3,

              fontSize: "11.5px",

              fontWeight: 600,

              color: "#0D4C7D",

              wordBreak:
                "break-word",
            }}
          >
            {String(
              applicationNumber,
            )}
          </Typography>
        </Box>

        {/* ================================================ */}
        {/* SECTION LIST */}
        {/* ================================================ */}

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
              backgroundColor:
                "#c7c7c7",

              borderRadius: "10px",
            },

            "&::-webkit-scrollbar-track": {
              backgroundColor:
                "#f5f5f5",
            },
          }}
        >
          {orderedSections.map(
            (section) => {
              const isActive =
                selectedSection ===
                section.key;

              return (
                <Box
                  key={section.key}
                  onClick={() =>
                    handleSectionClick(
                      section.key,
                    )
                  }
                  sx={{
                    mx: 0.75,

                    mb: 0.25,

                    px: 1.25,

                    py: 0.8,

                    cursor: "pointer",

                    borderRadius: "5px",

                    borderLeft:
                      isActive
                        ? "3px solid #9A2529"
                        : "3px solid transparent",

                    backgroundColor:
                      isActive
                        ? "#fdf2f2"
                        : "transparent",

                    color: isActive
                      ? "#9A2529"
                      : "#333",

                    transition:
                      "all 0.15s ease",

                    "&:hover": {
                      backgroundColor:
                        "#f8f8f8",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize:
                        "11.5px",

                      fontWeight:
                        isActive
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
            },
          )}
        </Box>

        {/* ================================================ */}
        {/* BACK TO INBOX */}
        {/* ================================================ */}

        <Box
          onClick={onBack}
          sx={{
            flexShrink: 0,

            px: 1.5,

            py: 1.1,

            borderTop:
              "1px solid #e5e7eb",

            cursor: "pointer",

            color: "#0D4C7D",

            backgroundColor:
              "#fff",

            "&:hover": {
              backgroundColor:
                "#f8f8f8",
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

      {/* ================================================== */}
      {/* RIGHT CONTENT */}
      {/* ================================================== */}

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
 * Generic section content.
 *
 * This is intentionally compact.
 *
 * Later you can replace this component with
 * your real Summary / Discrepancy / Decision
 * components without changing the workspace.
 */
const SectionContent = ({
  title,
  application,
}: SectionContentProps) => {
  const applicationNumber =
    application.applicationNo ??
    application.applicationNumber ??
    application.application_no ??
    application.application_number ??
    "-";

  /**
   * Remove the application-number fields
   * from the generic information display.
   */
  const informationEntries =
    Object.entries(application).filter(
      ([key]) => {
        const normalizedKey = key
          .replace(/_/g, "")
          .replace(/\s/g, "")
          .toLowerCase();

        return (
          normalizedKey !==
          "applicationno" &&
          normalizedKey !==
          "applicationnumber"
        );
      },
    );

  const formatLabel = (
    key: string,
  ): string => {
    return key
      .replace(/_/g, " ")
      .replace(
        /([a-z])([A-Z])/g,
        "$1 $2",
      )
      .replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase(),
      );
  };

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

    if (
      typeof value === "boolean"
    ) {
      return value
        ? "Yes"
        : "No";
    }

    if (
      typeof value === "object"
    ) {
      try {
        return JSON.stringify(
          value,
        );
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

        boxSizing: "border-box",

        border:
          "1px solid #e5e7eb",

        borderRadius: "6px",

        backgroundColor:
          "#fff",

        p: 1.5,

        overflow: "visible",
      }}
    >
      {/* ================================================ */}
      {/* SECTION HEADER */}
      {/* ================================================ */}

      <Box
        sx={{
          mb: 1.25,

          pb: 1,

          borderBottom:
            "1px solid #e5e7eb",
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

      {/* ================================================ */}
      {/* APPLICATION NUMBER */}
      {/* ================================================ */}

      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          gap: 1,

          mb: 1.5,

          px: 1,

          py: 0.8,

          borderRadius: "5px",

          backgroundColor:
            "#f7f9fb",
        }}
      >
        <Typography
          sx={{
            fontSize: "10.5px",

            color: "#777",
          }}
        >
          Application Number
        </Typography>

        <Typography
          sx={{
            fontSize: "11px",

            fontWeight: 600,

            color: "#333",
          }}
        >
          {String(
            applicationNumber,
          )}
        </Typography>
      </Box>

      {/* ================================================ */}
      {/* APPLICATION DATA */}
      {/* ================================================ */}

      {informationEntries.length >
      0 ? (
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",

            gap: 1,
          }}
        >
          {informationEntries.map(
            ([key, value]) => (
              <Box
                key={key}
                sx={{
                  display: "flex",

                  flexDirection:
                    "column",

                  gap: 0.35,

                  minWidth: 0,

                  px: 1,

                  py: 0.8,

                  border:
                    "1px solid #edf0f2",

                  borderRadius: "5px",

                  backgroundColor:
                    "#fff",
                }}
              >
                <Typography
                  sx={{
                    fontSize:
                      "9.5px",

                    color: "#888",

                    fontWeight: 500,
                  }}
                >
                  {formatLabel(
                    key,
                  )}
                </Typography>

                <Typography
                  sx={{
                    fontSize:
                      "11px",

                    color: "#333",

                    wordBreak:
                      "break-word",
                  }}
                >
                  {formatValue(
                    value,
                  )}
                </Typography>
              </Box>
            ),
          )}
        </Box>
      ) : (
        <Box
          sx={{
            p: 2,

            borderRadius: "5px",

            backgroundColor:
              "#f7f9fb",

            border:
              "1px solid #edf0f2",
          }}
        >
          <Typography
            sx={{
              fontSize: "11px",
              color: "#777",
            }}
          >
            No information
            available.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ApplicationWorkspace;
