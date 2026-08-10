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

const formatSectionLabel = (
  value: string,
): string => {
  return value
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
   * Make sure DRS Summary appears first.
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
   * DRS Summary selected tab.
   */
  const [
    selectedDrsSection,
    setSelectedDrsSection,
  ] = useState<string>("summary");

  /**
   * ==========================================================
   * APPLICATION NUMBER
   * ==========================================================
   */

  const applicationNumber =
    application.applicationNo ??
    application.applicationNumber ??
    application.application_no ??
    application.application_number ??
    "-";

  /**
   * ==========================================================
   * MAIN SECTION CLICK
   * ==========================================================
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

        {/* ================================================== */}
        {/* DRS CONTENT */}
        {/* ================================================== */}

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
          {/* ================================================= */}
          {/* SUMMARY */}
          {/* ================================================= */}

          {selectedDrsSection ===
            "summary" && (
            <DrsApplicationSummary
              application={application}
            />
          )}

          {/* ================================================= */}
          {/* DISCREPANCY */}
          {/* ================================================= */}

          {selectedDrsSection ===
            "discrepancy" && (
            <SectionContent
              title="Discrepancy"
              application={application}
            />
          )}

          {/* ================================================= */}
          {/* DECISION */}
          {/* ================================================= */}

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

          border:
            "1px solid #e5e7eb",

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

        {/* ================================================== */}
        {/* APPLICATION NUMBER */}
        {/* ================================================== */}

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

        {/* ================================================== */}
        {/* BACK TO INBOX */}
        {/* ================================================== */}

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
 *
 * This is the main underwriter-friendly summary.
 *
 * Instead of showing every application field,
 * it provides a quick overview of the complete
 * application.
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

  const getValue = (
    ...keys: string[]
  ): string => {
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
   * APPLICATION DETAILS
   * ==========================================================
   */

  const applicationNumber = getValue(
    "applicationNo",
    "applicationNumber",
    "application_no",
    "application_number",
  );

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

  const faceValue = getValue(
    "faceValue",
  );

  const channel = getValue(
    "channel",
  );

  const subChannel = getValue(
    "subChannel",
  );

  const agentCode = getValue(
    "agentCode",
  );

  const customerType = getValue(
    "customerType",
  );

  /**
   * ==========================================================
   * BRE DETAILS
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

  const initialStatus = getValue(
    "initialBreStatus",
    "initialStatus",
  );

  const finalStatus = getValue(
    "finalBreStatus",
    "finalStatus",
  );

  /**
   * ==========================================================
   * APPLICANT / IMAGE DETAILS
   * ==========================================================
   */

  const imageQuality = getValue(
    "imageQuality",
  );

  const faceMatchScore = getValue(
    "faceMatchScore",
  );

  /**
   * ==========================================================
   * SUMMARY
   * ==========================================================
   */

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",

        overflowY: "auto",

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
      {/* ================================================== */}
      {/* APPLICATION HEADER */}
      {/* ================================================== */}

      <Box
        sx={{
          mb: 1,

          px: 1.5,

          py: 1.2,

          border:
            "1px solid #e5e7eb",

          borderRadius: "6px",

          backgroundColor:
            "#fff",
        }}
      >
        <Box
          sx={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "15px",

                fontWeight: 600,

                color: "#0D4C7D",
              }}
            >
              Application Summary
            </Typography>

            <Typography
              sx={{
                mt: 0.3,

                fontSize: "10.5px",

                color: "#777",
              }}
            >
              Application No:{" "}
              <strong>
                {applicationNumber}
              </strong>
            </Typography>
          </Box>

          {/* FINAL BRE BADGE */}

          <Box
            sx={{
              px: 1.2,

              py: 0.5,

              borderRadius: "12px",

              backgroundColor:
                "#fff4d6",

              color: "#8a6800",

              fontSize: "10px",

              fontWeight: 600,
            }}
          >
            Final BRE: {finalBre}
          </Box>
        </Box>
      </Box>

      {/* ================================================== */}
      {/* APPLICATION SNAPSHOT */}
      {/* ================================================== */}

      <SummaryCard title="Application Snapshot">
        <SummaryGrid
          items={[
            [
              "Product",
              productName,
            ],
            [
              "Applied SA",
              appliedSA,
            ],
            [
              "Face Value",
              faceValue,
            ],
            [
              "Channel",
              channel,
            ],
            [
              "Sub Channel",
              subChannel,
            ],
            [
              "Agent Code",
              agentCode,
            ],
            [
              "Customer Type",
              customerType,
            ],
          ]}
        />
      </SummaryCard>

      {/* ================================================== */}
      {/* BRE OVERVIEW */}
      {/* ================================================== */}

      <SummaryCard title="BRE Overview">
        <SummaryGrid
          items={[
            [
              "Initial Status",
              initialStatus,
            ],
            [
              "Initial BRE",
              initialBre,
            ],
            [
              "Final Status",
              finalStatus,
            ],
            [
              "Final BRE",
              finalBre,
            ],
          ]}
        />

        <Box
          sx={{
            mt: 1,

            p: 1,

            borderRadius: "5px",

            backgroundColor:
              "#fff8e6",

            border:
              "1px solid #f2df9b",
          }}
        >
          <Typography
            sx={{
              fontSize: "10px",

              color: "#765f00",

              lineHeight: 1.5,
            }}
          >
            Application has been routed
            to RM for review based on
            the final BRE outcome and
            outstanding requirements.
          </Typography>
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
              "repeat(3, 1fr)",

            gap: 1,
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

        <Box sx={{ mt: 1 }}>
          {[
            [
              "KYC",
              "Driving License",
            ],
            [
              "Medical",
              "Education / Sign",
            ],
            [
              "Application",
              "Education / Sign",
            ],
            [
              "KYC",
              "PAN Card",
            ],
            [
              "NRI-OCI",
              "Passport",
            ],
          ].map(
            ([category, document]) => (
              <Box
                key={`${category}-${document}`}
                sx={{
                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems: "center",

                  py: 0.65,

                  borderBottom:
                    "1px solid #f0f0f0",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize:
                        "10px",

                      fontWeight: 600,

                      color: "#444",
                    }}
                  >
                    {category}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize:
                        "9.5px",

                      color: "#888",
                    }}
                  >
                    {document}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    px: 0.8,

                    py: 0.25,

                    borderRadius:
                      "10px",

                    backgroundColor:
                      "#fff1f1",

                    color: "#9A2529",

                    fontSize:
                      "9px",

                    fontWeight: 600,
                  }}
                >
                  Pending
                </Box>
              </Box>
            ),
          )}
        </Box>
      </SummaryCard>

      {/* ================================================== */}
      {/* KEY FLAGS */}
      {/* ================================================== */}

      <SummaryCard title="Key Flags & Observations">
        <FlagRow
          text="Documents are pending for review."
        />

        <FlagRow
          text="Mismatch identified in information provided."
        />

        <FlagRow
          text="PAN Card has not been submitted."
        />

        <FlagRow
          text="Passport has not been submitted."
        />

        {/* IMAGE DETAILS */}

        <Box sx={{ mt: 1 }}>
          <SummaryGrid
            items={[
              [
                "Image Quality",
                imageQuality,
              ],
              [
                "Face Match Score",
                faceMatchScore,
              ],
            ]}
          />
        </Box>
      </SummaryCard>

      {/* ================================================== */}
      {/* UNDERWRITER ACTION */}
      {/* ================================================== */}

      <Box
        sx={{
          mb: 1,

          p: 1.2,

          borderRadius: "6px",

          backgroundColor:
            "#f7f9fb",

          border:
            "1px solid #dfe5ea",
        }}
      >
        <Typography
          sx={{
            fontSize: "11px",

            fontWeight: 600,

            color: "#0D4C7D",

            mb: 0.5,
          }}
        >
          Underwriter Action
        </Typography>

        <Typography
          sx={{
            fontSize: "10px",

            color: "#555",

            lineHeight: 1.5,
          }}
        >
          Review the outstanding
          requirements and identified
          discrepancies before
          proceeding with the final
          CVT decision.
        </Typography>
      </Box>
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
  children: React.ReactNode;
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 1,

        p: 1.2,

        border:
          "1px solid #e5e7eb",

        borderRadius: "6px",

        backgroundColor:
          "#fff",
      }}
    >
      <Typography
        sx={{
          mb: 1,

          fontSize: "11.5px",

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
          "repeat(3, minmax(0, 1fr))",

        gap: 1,
      }}
    >
      {items.map(
        ([label, value]) => (
          <Box
            key={label}
            sx={{
              minWidth: 0,

              px: 0.8,

              py: 0.7,

              backgroundColor:
                "#f8fafb",

              borderRadius: "4px",
            }}
          >
            <Typography
              sx={{
                fontSize:
                  "9px",

                color: "#888",
              }}
            >
              {label}
            </Typography>

            <Typography
              sx={{
                mt: 0.25,

                fontSize:
                  "10.5px",

                fontWeight: 600,

                color: "#333",

                wordBreak:
                  "break-word",
              }}
            >
              {value}
            </Typography>
          </Box>
        ),
      )}
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
        p: 1,

        textAlign: "center",

        borderRadius: "5px",

        backgroundColor:
          "#f7f9fb",

        border:
          "1px solid #edf0f2",
      }}
    >
      <Typography
        sx={{
          fontSize: "9px",

          color: "#888",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.3,

          fontSize: "15px",

          fontWeight: 600,

          color: "#0D4C7D",
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

        gap: 0.8,

        mb: 0.7,

        p: 0.7,

        borderRadius: "4px",

        backgroundColor:
          "#fff8f8",
      }}
    >
      <Box
        sx={{
          width: 6,

          height: 6,

          flexShrink: 0,

          borderRadius: "50%",

          backgroundColor:
            "#9A2529",
        }}
      />

      <Typography
        sx={{
          fontSize: "10px",

          color: "#555",
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
 *
 * Used for sections where you have not yet created
 * a dedicated UI.
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
   * Remove application-number fields
   * from generic information display.
   */

  const informationEntries =
    Object.entries(
      application,
    ).filter(([key]) => {
      const normalizedKey =
        key
          .replace(/_/g, "")
          .replace(/\s/g, "")
          .toLowerCase();

      return (
        normalizedKey !==
          "applicationno" &&
        normalizedKey !==
          "applicationnumber"
      );
    });

  /**
   * Format field label.
   */

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

    if (
      typeof value ===
      "boolean"
    ) {
      return value
        ? "Yes"
        : "No";
    }

    if (
      typeof value ===
      "object"
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

        boxSizing:
          "border-box",

        border:
          "1px solid #e5e7eb",

        borderRadius: "6px",

        backgroundColor:
          "#fff",

        p: 1.5,

        overflow: "visible",
      }}
    >
      {/* ================================================== */}
      {/* SECTION HEADER */}
      {/* ================================================== */}

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

      {/* ================================================== */}
      {/* APPLICATION NUMBER */}
      {/* ================================================== */}

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

      {/* ================================================== */}
      {/* APPLICATION DATA */}
      {/* ================================================== */}

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

                  borderRadius:
                    "5px",

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

            borderRadius:
              "5px",

            backgroundColor:
              "#f7f9fb",

            border:
              "1px solid #edf0f2",
          }}
        >
          <Typography
            sx={{
              fontSize:
                "11px",

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