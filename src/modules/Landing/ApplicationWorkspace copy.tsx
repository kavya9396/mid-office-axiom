import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import {
  useEffect,
  useRef,
  useState,
} from "react";
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

/* ============================================================
 * DRS SUMMARY SUB-SECTIONS
 * ============================================================ */

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

/* ============================================================
 * FORMAT SECTION LABEL
 * ============================================================ */

const formatSectionLabel = (value: string): string => {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/* ============================================================
 * APPLICATION WORKSPACE
 * ============================================================ */

const ApplicationWorkspace = ({
  application,
  sections,
  onBack,
}: ApplicationWorkspaceProps) => {
  /*
   * Keep DRS Summary at the top.
   */
  const orderedSections = [
    ...sections.filter(
      (section) => section.key === "drsSummary",
    ),
    ...sections.filter(
      (section) => section.key !== "drsSummary",
    ),
  ];

  const [selectedSection, setSelectedSection] =
    useState<string>(
      orderedSections[0]?.key ?? "",
    );

  const [selectedDrsSection, setSelectedDrsSection] =
    useState<string>("summary");

  /*
   * Right-side scroll container.
   */
  const rightScrollRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * Store references to every right-side section.
   */
  const sectionRefs = useRef<
    Record<string, HTMLDivElement | null>
  >({});

  /*
   * Prevent scroll tracking from fighting against
   * a programmatic left-menu click.
   */
  const isProgrammaticScroll =
    useRef(false);

  /* ==========================================================
   * SCROLL TO SECTION FROM LEFT SIDEBAR
   * ========================================================== */

  const handleSectionClick = (
    sectionKey: string,
  ) => {
    setSelectedSection(sectionKey);

    if (sectionKey === "drsSummary") {
      setSelectedDrsSection("summary");
    }

    const element =
      sectionRefs.current[sectionKey];

    const container =
      rightScrollRef.current;

    if (!element || !container) {
      return;
    }

    isProgrammaticScroll.current = true;

    const containerTop =
      container.getBoundingClientRect().top;

    const elementTop =
      element.getBoundingClientRect().top;

    const scrollTop =
      container.scrollTop +
      (elementTop - containerTop);

    container.scrollTo({
      top: Math.max(scrollTop - 8, 0),
      behavior: "smooth",
    });

    /*
     * Allow normal scroll tracking again after
     * smooth scrolling has completed.
     */
    window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 700);
  };

  /* ==========================================================
   * AUTOMATIC LEFT-SIDE SELECTION WHILE SCROLLING
   * ========================================================== */

  useEffect(() => {
    const container =
      rightScrollRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      if (isProgrammaticScroll.current) {
        return;
      }

      const containerRect =
        container.getBoundingClientRect();

      const activationPoint =
        containerRect.top + 90;

      let activeKey =
        orderedSections[0]?.key ?? "";

      let closestDistance =
        Number.POSITIVE_INFINITY;

      orderedSections.forEach(
        (section) => {
          const element =
            sectionRefs.current[
              section.key
            ];

          if (!element) {
            return;
          }

          const rect =
            element.getBoundingClientRect();

          /*
           * Find the section whose top is closest
           * to the activation line while still
           * being above it.
           */
          const distance =
            activationPoint - rect.top;

          if (
            distance >= 0 &&
            distance < closestDistance
          ) {
            closestDistance = distance;
            activeKey = section.key;
          }
        },
      );

      /*
       * If the user is near the very top,
       * keep the first section selected.
       */
      if (container.scrollTop <= 20) {
        activeKey =
          orderedSections[0]?.key ?? "";
      }

      if (activeKey) {
        setSelectedSection(activeKey);
      }
    };

    container.addEventListener(
      "scroll",
      handleScroll,
      { passive: true },
    );

    /*
     * Initial selection.
     */
    handleScroll();

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, [orderedSections]);

  /* ==========================================================
   * DRS SUMMARY
   * ========================================================== */

  const renderDrsSummary = () => {
    return (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {/* DRS SUB TABS */}

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
              height: "34px",
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
                    key={
                      subSection.key
                    }
                    onClick={() =>
                      setSelectedDrsSection(
                        subSection.key,
                      )
                    }
                    sx={{
                      height: "100%",
                      px: 1.6,
                      display: "flex",
                      alignItems:
                        "center",
                      cursor: "pointer",
                      fontSize: "10.5px",
                      fontWeight:
                        isActive
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
                    {
                      subSection.label
                    }
                  </Box>
                );
              },
            )}
          </Box>
        </Paper>

        {/* DRS CONTENT */}

        <Box
          sx={{
            width: "100%",
            minHeight: 0,
          }}
        >
          {selectedDrsSection ===
            "summary" && (
            <DrsApplicationSummary
              application={
                application
              }
            />
          )}

          {selectedDrsSection ===
            "discrepancy" && (
            <SectionContent
              title="Discrepancy"
              application={
                application
              }
            />
          )}

          {selectedDrsSection ===
            "decision" && (
            <SectionContent
              title="Decision"
              application={
                application
              }
            />
          )}
        </Box>
      </Box>
    );
  };

  /* ==========================================================
   * SECTION CONTENT
   * ========================================================== */

  const renderSectionContent = (
    section: ApplicationSection,
  ) => {
    switch (section.key) {
      case "drsSummary":
        return renderDrsSummary();

      case "breDecision1":
        return (
          <BreDecisionSection
            application={
              application
            }
          />
        );

      case "summary":
        return (
          <SectionContent
            title="Summary"
            application={
              application
            }
          />
        );

      case "applicationOverview1":
        return (
          <SectionContent
            title="Application Overview"
            application={
              application
            }
          />
        );

      case "pivvSection":
        return (
          <SectionContent
            title="PIVV Section"
            application={
              application
            }
          />
        );

      case "requirementManagement":
        return (
          <SectionContent
            title="Requirement Management"
            application={
              application
            }
          />
        );

      case "decision":
        return (
          <SectionContent
            title="Decision"
            application={
              application
            }
          />
        );

      case "quickLinks":
        return (
          <SectionContent
            title="Quick Links"
            application={
              application
            }
          />
        );

      default:
        return (
          <SectionContent
            title={
              section.label ||
              formatSectionLabel(
                section.key,
              )
            }
            application={
              application
            }
          />
        );
    }
  };

  /* ==========================================================
   * APPLICATION NUMBER
   * ========================================================== */

  const applicationNumber =
    String(
      application.applicationNo ??
        application.applicationNumber ??
        application.application_no ??
        application.application_number ??
        "-",
    );

  /* ==========================================================
   * MAIN WORKSPACE
   * ========================================================== */

  return (
    <Box
      sx={{
        width: "100%",
        height:
          "calc(90vh - 16px)",
        display: "flex",
        gap: 1.5,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* ======================================================
       * LEFT SIDEBAR
       * ====================================================== */}

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
        {/* HEADER */}

        <Box
          sx={{
            height: "40px",
            minHeight: "40px",
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
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            DRS Summary
          </Typography>
        </Box>

        {/* APPLICATION NUMBER */}

        <Box
          sx={{
            px: 1.5,
            py: 0.9,
            borderBottom:
              "1px solid #e5e7eb",
            backgroundColor:
              "#fafafa",
          }}
        >
          <Typography
            sx={{
              fontSize: "9px",
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
              wordBreak:
                "break-word",
            }}
          >
            {applicationNumber}
          </Typography>
        </Box>

        {/* SECTION LIST */}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            py: 0.6,
            "&::-webkit-scrollbar":
              {
                width: "4px",
              },
            "&::-webkit-scrollbar-thumb":
              {
                backgroundColor:
                  "#d1d5db",
                borderRadius: "4px",
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
                  key={
                    section.key
                  }
                  onClick={() =>
                    handleSectionClick(
                      section.key,
                    )
                  }
                  sx={{
                    mx: 0.7,
                    mb: 0.15,
                    px: 1.1,
                    py: 0.65,
                    cursor: "pointer",
                    borderRadius:
                      "5px",
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
                        "11px",
                      fontWeight:
                        isActive
                          ? 600
                          : 400,
                      lineHeight: 1.25,
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

        {/* BACK TO INBOX */}

        <Box
          onClick={onBack}
          sx={{
            flexShrink: 0,
            px: 1.5,
            py: 0.9,
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
              fontSize: "10.5px",
              fontWeight: 600,
            }}
          >
            ← Back to Inbox
          </Typography>
        </Box>
      </Paper>

      {/* ======================================================
       * RIGHT SCROLLABLE CONTENT
       * ====================================================== */}

      <Box
        ref={rightScrollRef}
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          pr: 0.5,
          scrollBehavior: "smooth",

          /*
           * Keep scrollbar compact.
           */
          "&::-webkit-scrollbar": {
            width: "6px",
          },

          "&::-webkit-scrollbar-track":
            {
              backgroundColor:
                "#f5f5f5",
            },

          "&::-webkit-scrollbar-thumb":
            {
              backgroundColor:
                "#c8cdd2",
              borderRadius: "6px",
            },

          "&::-webkit-scrollbar-thumb:hover":
            {
              backgroundColor:
                "#aeb4ba",
            },
        }}
      >
        {orderedSections.map(
          (section) => (
            <Box
              key={section.key}
              ref={(element) => {
                sectionRefs.current[
                  section.key
                ] = element;
              }}
              data-section-key={
                section.key
              }
              sx={{
                width: "100%",
                minWidth: 0,
                mb: 1.25,
                scrollMarginTop:
                  "8px",
              }}
            >
              {renderSectionContent(
                section,
              )}
            </Box>
          ),
        )}
      </Box>
    </Box>
  );
};

/* ============================================================
 * DRS APPLICATION SUMMARY
 * ============================================================ */

interface DrsApplicationSummaryProps {
  application: Record<string, unknown>;
}

const DrsApplicationSummary = ({
  application,
}: DrsApplicationSummaryProps) => {
  /*
   * Generic JSON reader.
   */
  const getValue = (
    ...keys: string[]
  ): string => {
    for (const key of keys) {
      const value =
        application[key];

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

  /* ==========================================================
   * APPLICANT DETAILS
   * ========================================================== */

  const applicantName =
    getValue(
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

  const applicantAge =
    getValue(
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

  const applicantDob =
    getValue(
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

  const applicantOccupation =
    getValue(
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

  /* ==========================================================
   * APPLICATION DETAILS
   * ========================================================== */

  const productName =
    getValue(
      "productName",
      "product",
      "productCode",
    );

  const appliedSA =
    getValue(
      "appliedSA",
      "appliedSa",
      "sumAssured",
      "appliedSumAssured",
    );

  const faceValue =
    getValue("faceValue");

  const channel =
    getValue("channel");

  const subChannel =
    getValue("subChannel");

  const agentCode =
    getValue("agentCode");

  const customerType =
    getValue("customerType");

  const imageQuality =
    getValue("imageQuality");

  const faceMatchScore =
    getValue(
      "faceMatchScore",
    );

  /* ==========================================================
   * BRE DECISION
   * ========================================================== */

  const initialBre =
    getValue(
      "initialBreDecision",
      "initialBRE",
      "initialBre",
    );

  const finalBre =
    getValue(
      "finalBreDecision",
      "finalBRE",
      "finalBre",
    );

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
      }}
    >
      {/* ======================================================
       * APPLICANT DETAILS
       * ====================================================== */}

      <Box
        sx={{
          px: 1,
          py: 0.75,
          border:
            "1px solid #D1D5DB",
          borderRadius: "6px",
          backgroundColor:
            "#fff",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: 0.65,

            "@media (max-width: 900px)":
              {
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
              },

            "@media (max-width: 600px)":
              {
                gridTemplateColumns:
                  "1fr",
              },
          }}
        >
          <ApplicantInfo
            label="Applicant Name"
            value={
              applicantName
            }
          />

          <ApplicantInfo
            label="Age"
            value={
              applicantAge
            }
          />

          <ApplicantInfo
            label="Date of Birth"
            value={
              applicantDob
            }
          />

          <ApplicantInfo
            label="Occupation"
            value={
              applicantOccupation
            }
          />
        </Box>
      </Box>

      {/* ======================================================
       * APPLICATION DETAIL
       * ====================================================== */}

      <SummaryCard
        title="Application Detail"
      >
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
      </SummaryCard>

      {/* ======================================================
       * BRE DECISION - COMPACT REDESIGN
       * ====================================================== */}

      <CompactBreDecision
        initialDecision={
          initialBre
        }
        finalDecision={
          finalBre
        }
      />

      {/* ======================================================
       * REQUIREMENT STATUS
       * ====================================================== */}

      <SummaryCard
        title="Requirement Status"
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: 0.65,
          }}
        >
          <StatusBox
            label="Total"
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

        <Box
          sx={{
            mt: 0.65,
            display: "grid",
            gridTemplateColumns:
              "repeat(5, minmax(0, 1fr))",
            gap: 0.5,

            "@media (max-width: 1000px)":
              {
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
              },

            "@media (max-width: 650px)":
              {
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
              },
          }}
        >
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
              <RequirementItem
                key={`${category}-${document}`}
                category={
                  category
                }
                document={
                  document
                }
              />
            ),
          )}
        </Box>
      </SummaryCard>

      {/* ======================================================
       * KEY FLAGS
       * ====================================================== */}

      <SummaryCard
        title="Key Flags & Observations"
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: 0.5,

            "@media (max-width: 700px)":
              {
                gridTemplateColumns:
                  "1fr",
              },
          }}
        >
          <FlagRow text="Documents are pending for review." />

          <FlagRow text="Mismatch identified in information provided." />

          <FlagRow text="PAN Card has not been submitted." />

          <FlagRow text="Passport has not been submitted." />
        </Box>
      </SummaryCard>

      {/* ======================================================
       * UNDERWRITER ACTION
       * ====================================================== */}

      <Box
        sx={{
          flexShrink: 0,
          px: 1,
          py: 0.7,
          borderRadius: "6px",
          backgroundColor:
            "#f7f9fb",
          border:
            "1px solid #dfe5ea",
        }}
      >
        <Typography
          sx={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#0D4C7D",
            mb: 0.2,
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
          Review the outstanding
          requirements and
          identified discrepancies
          before proceeding with
          the final CVT decision.
        </Typography>
      </Box>
    </Box>
  );
};

/* ============================================================
 * COMPACT BRE DECISION
 * ============================================================ */

interface CompactBreDecisionProps {
  initialDecision: string;
  finalDecision: string;
}

const CompactBreDecision = ({
  initialDecision,
  finalDecision,
}: CompactBreDecisionProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        px: 1,
        py: 0.7,
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
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: 1,
          mb: 0.55,
        }}
      >
        <Typography
          sx={{
            fontSize: "10.5px",
            fontWeight: 600,
            color: "#333",
          }}
        >
          BRE Decision
        </Typography>

        <Typography
          sx={{
            fontSize: "8.5px",
            color: "#888",
          }}
        >
          Rule engine outcome
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: 0.65,

          "@media (max-width: 600px)":
            {
              gridTemplateColumns:
                "1fr",
            },
        }}
      >
        <CompactDecisionItem
          label="Initial"
          value={
            initialDecision
          }
        />

        <CompactDecisionItem
          label="Final"
          value={
            finalDecision
          }
          highlighted
        />
      </Box>
    </Paper>
  );
};

/* ============================================================
 * COMPACT DECISION ITEM
 * ============================================================ */

const CompactDecisionItem = ({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) => {
  return (
    <Box
      sx={{
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        gap: 1,
        px: 0.85,
        py: 0.55,
        borderRadius: "5px",
        border: highlighted
          ? "1px solid #ead0d1"
          : "1px solid #edf0f2",
        backgroundColor:
          highlighted
            ? "#fff8f8"
            : "#f8fafb",
      }}
    >
      <Typography
        sx={{
          flexShrink: 0,
          fontSize: "9px",
          color: "#666",
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          minWidth: 0,
          fontSize: "10px",
          fontWeight: 600,
          color: highlighted
            ? "#9A2529"
            : "#0D4C7D",
          textAlign: "right",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow:
            "ellipsis",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

/* ============================================================
 * APPLICANT INFO
 * ============================================================ */

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
        px: 0.7,
        py: 0.45,
        backgroundColor:
          "#f8fafb",
        borderRadius: "4px",
        border:
          "1px solid #f0f2f3",
      }}
    >
      <Typography
        sx={{
          fontSize: "9px",
          color: "#374151",
          whiteSpace:
            "nowrap",
          overflow: "hidden",
          textOverflow:
            "ellipsis",
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
          wordBreak:
            "break-word",
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

/* ============================================================
 * SUMMARY CARD
 * ============================================================ */

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
        border:
          "1px solid #e5e7eb",
        borderRadius: "6px",
        backgroundColor:
          "#fff",
      }}
    >
      <Typography
        sx={{
          mb: 0.55,
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

/* ============================================================
 * SUMMARY GRID
 * ============================================================ */

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
        gap: 0.5,

        "@media (max-width: 1100px)":
          {
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
          },

        "@media (max-width: 700px)":
          {
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
          },
      }}
    >
      {items.map(
        ([label, value]) => (
          <Box
            key={label}
            sx={{
              minWidth: 0,
              px: 0.65,
              py: 0.45,
              backgroundColor:
                "#f8fafb",
              borderRadius: "4px",
              border:
                "1px solid #f0f2f3",
            }}
          >
            <Typography
              sx={{
                fontSize: "9px",
                color: "#374151",
                whiteSpace:
                  "nowrap",
                overflow:
                  "hidden",
                textOverflow:
                  "ellipsis",
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
                wordBreak:
                  "break-word",
                lineHeight: 1.2,
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

/* ============================================================
 * STATUS BOX
 * ============================================================ */

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
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        px: 0.8,
        py: 0.4,
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
          color: "#374151",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#0D4C7D",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

/* ============================================================
 * REQUIREMENT ITEM
 * ============================================================ */

const RequirementItem = ({
  category,
  document,
}: {
  category: string;
  document: string;
}) => {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 0.65,
        py: 0.5,
        border:
          "1px solid #edf0f2",
        borderRadius: "5px",
        backgroundColor:
          "#fafbfc",
      }}
    >
      <Typography
        sx={{
          fontSize: "9px",
          fontWeight: 600,
          color: "#444",
          whiteSpace:
            "nowrap",
          overflow: "hidden",
          textOverflow:
            "ellipsis",
        }}
      >
        {category}
      </Typography>

      <Typography
        sx={{
          mt: 0.1,
          fontSize: "9px",
          color: "#374151",
          whiteSpace:
            "nowrap",
          overflow: "hidden",
          textOverflow:
            "ellipsis",
        }}
      >
        {document}
      </Typography>

      <Box
        sx={{
          display:
            "inline-flex",
          mt: 0.3,
          px: 0.55,
          py: 0.1,
          borderRadius: "7px",
          backgroundColor:
            "#fff1f1",
          color: "#9A2529",
          fontSize: "7.5px",
          fontWeight: 600,
        }}
      >
        Pending
      </Box>
    </Box>
  );
};

/* ============================================================
 * FLAG ROW
 * ============================================================ */

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
        gap: 0.5,
        minWidth: 0,
        px: 0.65,
        py: 0.4,
        borderRadius: "4px",
        backgroundColor:
          "#fff8f8",
      }}
    >
      <Box
        sx={{
          width: 4,
          height: 4,
          flexShrink: 0,
          borderRadius:
            "50%",
          backgroundColor:
            "#9A2529",
        }}
      />

      <Typography
        sx={{
          fontSize: "9px",
          color: "#555",
          lineHeight: 1.25,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

/* ============================================================
 * BRE DECISION SECTION
 * ============================================================ */

const BreDecisionSection = ({
  application,
}: {
  application: Record<string, unknown>;
}) => {
  const getValue = (
    ...keys: string[]
  ): string => {
    for (const key of keys) {
      const value =
        application[key];

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

  const initialDecision =
    getValue(
      "initialBreDecision",
      "initialBRE",
      "initialBre",
      "initialDecision",
    );

  const finalDecision =
    getValue(
      "finalBreDecision",
      "finalBRE",
      "finalBre",
      "finalDecision",
    );

  const reason =
    getValue(
      "breDecisionReason",
      "decisionReason",
      "breReason",
      "reason",
    );

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        border:
          "1px solid #e5e7eb",
        borderRadius: "6px",
        backgroundColor:
          "#fff",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          px: 1.2,
          py: 0.65,
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          borderBottom:
            "1px solid #edf0f2",
          backgroundColor:
            "#fafbfc",
        }}
      >
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#0D4C7D",
          }}
        >
          BRE Decision
        </Typography>

        <Typography
          sx={{
            fontSize: "8.5px",
            color: "#888",
          }}
        >
          Decision Overview
        </Typography>
      </Box>

      {/* CONTENT */}

      <Box
        sx={{
          px: 1,
          py: 0.8,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr 2fr",
            gap: 0.65,

            "@media (max-width: 800px)":
              {
                gridTemplateColumns:
                  "1fr 1fr",
              },

            "@media (max-width: 550px)":
              {
                gridTemplateColumns:
                  "1fr",
              },
          }}
        >
          <BreDecisionValue
            label="Initial Decision"
            value={
              initialDecision
            }
          />

          <BreDecisionValue
            label="Final Decision"
            value={
              finalDecision
            }
            highlighted
          />

          <BreDecisionValue
            label="Decision Reason"
            value={reason}
          />
        </Box>
      </Box>
    </Paper>
  );
};

/* ============================================================
 * BRE DECISION VALUE
 * ============================================================ */

const BreDecisionValue = ({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) => {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 0.85,
        py: 0.55,
        borderRadius: "5px",
        border: highlighted
          ? "1px solid #ead0d1"
          : "1px solid #edf0f2",
        backgroundColor:
          highlighted
            ? "#fff8f8"
            : "#f8fafb",
      }}
    >
      <Typography
        sx={{
          fontSize: "8.5px",
          color: "#777",
          mb: 0.15,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: "10px",
          fontWeight: 600,
          color: highlighted
            ? "#9A2529"
            : "#333",
          wordBreak:
            "break-word",
          lineHeight: 1.25,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

/* ============================================================
 * GENERIC SECTION CONTENT
 * ============================================================ */

const SectionContent = ({
  title,
  application,
}: SectionContentProps) => {
  /*
   * Remove application-number fields.
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

  /*
   * Format JSON field name.
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

  /*
   * Format JSON value.
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
        boxSizing: "border-box",
        border:
          "1px solid #e5e7eb",
        borderRadius: "6px",
        backgroundColor:
          "#fff",
        overflow: "hidden",
      }}
    >
      {/* SECTION HEADER */}

      <Box
        sx={{
          px: 1.2,
          py: 0.7,
          borderBottom:
            "1px solid #e5e7eb",
          backgroundColor:
            "#fafbfc",
        }}
      >
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#0D4C7D",
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* APPLICATION DATA */}

      <Box
        sx={{
          p: 1,
        }}
      >
        {informationEntries.length >
        0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(6, minmax(0, 1fr))",
              gap: 0.6,

              "@media (max-width: 1100px)":
                {
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                },

              "@media (max-width: 700px)":
                {
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
                    flexDirection:
                      "column",
                    gap: 0.15,
                    minWidth: 0,
                    px: 0.7,
                    py: 0.5,
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
                        "9px",
                      color:
                        "#374151",
                      fontWeight:
                        500,
                      whiteSpace:
                        "nowrap",
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                    }}
                  >
                    {formatLabel(
                      key,
                    )}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize:
                        "9.5px",
                      color:
                        "#333",
                      wordBreak:
                        "break-word",
                      lineHeight:
                        1.25,
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
              p: 1.2,
              borderRadius: "5px",
              backgroundColor:
                "#f7f9fb",
              border:
                "1px solid #edf0f2",
            }}
          >
            <Typography
              sx={{
                fontSize:
                  "10px",
                color: "#777",
              }}
            >
              No information
              available.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ApplicationWorkspace;