import { Box, LinearProgress, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import { useAppSelector } from "../../../store/hooks";

type ChecklistAnswer = "yes" | "no";

type ChecklistQuestion = {
  id: string;
  text: string;
  section: "system" | "review";
  category?: string;
};

type RawChecklistQuestion = {
  id?: unknown;
  question?: unknown;
  text?: unknown;
  label?: unknown;
  section?: unknown;
  category?: unknown;
  source?: unknown;
  type?: unknown;
  autoVerified?: unknown;
  answer?: unknown;
  status?: unknown;
};

const fallbackChecklistQuestions: ChecklistQuestion[] = [
  { id: "sys_valid_id", text: "Has the applicant provided valid government-issued ID?", section: "system", category: "Workflow" },
  { id: "sys_credit_auth", text: "Has the applicant provided complete credit history authorization?", section: "system", category: "Workflow" },
  { id: "sys_employment", text: "Has the applicant provided proof of current employment?", section: "system", category: "Workflow" },
  { id: "sys_residence", text: "Has the applicant provided proof of residence?", section: "system", category: "Workflow" },
  { id: "sys_tax", text: "Has the applicant provided last 3 months of pay stubs?", section: "system", category: "Workflow" },
  { id: "validAgeProof", text: "Whether Valid Age Proof Received?", section: "review", category: "Workflow" },
  { id: "photoMatch", text: "Have Client Photo Match Between KYC/Video MER/Medicals/PIVC?", section: "review", category: "Workflow" },
  { id: "fvFinancialEvidence", text: "Whether Client Is FV Basis Available Financial Evidence?", section: "review", category: "Workflow" },
  { id: "reinsuranceManualCheck", text: "Whether Reinsurance Manual Check For Base & Rider Rating + RI Rating Sheet Attached?", section: "review", category: "Workflow" },
  { id: "breRemarks", text: "Have You Verified The BRE Remarks?", section: "review", category: "Workflow" },
  { id: "annualIncomeMismatch", text: "Have You Checked Life Assured \"Annual Income\" Details As There Is Mismatched Between Tele MER/Video MER And Application Form?", section: "review", category: "Workflow" },
  { id: "faceVerification", text: "Have You Verified Face Verification Manually?", section: "review", category: "Workflow" },
];

const toChecklistAnswer = (value: unknown): ChecklistAnswer | "" => {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "yes" || normalized === "y" || normalized === "true") {
    return "yes";
  }
  if (normalized === "no" || normalized === "n" || normalized === "false") {
    return "no";
  }

  return "";
};

const toChecklistQuestions = (value: unknown): ChecklistQuestion[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      const row = (item ?? {}) as RawChecklistQuestion;
      const id = String(row.id ?? `dynamic_question_${index + 1}`).trim();
      const text = String(row.question ?? row.text ?? row.label ?? "").trim();
      if (!text) {
        return null;
      }

      const sectionHint = String(row.section ?? row.source ?? row.type ?? "").toLowerCase();
      const section: "system" | "review" = row.autoVerified === true
        || sectionHint.includes("system")
        || sectionHint.includes("auto")
        ? "system"
        : "review";

      return {
        id,
        text,
        section,
        category: String(row.category ?? "Workflow").trim() || "Workflow",
      } as ChecklistQuestion;
    })
    .filter((item): item is ChecklistQuestion => item !== null);
};

const getDynamicQuestionSource = (drsData: Record<string, unknown> | null): unknown => {
  if (!drsData) {
    return null;
  }

  const externalApis = drsData.externalAPIs as Record<string, unknown> | undefined;

  return (
    (drsData.uacChecklist as Record<string, unknown> | undefined)?.questions
    ?? (drsData.uwChecklist as Record<string, unknown> | undefined)?.questions
    ?? (externalApis?.uacChecklist as Record<string, unknown> | undefined)?.questions
    ?? (externalApis?.uwChecklist as Record<string, unknown> | undefined)?.questions
    ?? drsData.checklistQuestions
    ?? null
  );
};

const getInitialAnswers = (questions: ChecklistQuestion[], defaults: Record<string, ChecklistAnswer | "">): Record<string, ChecklistAnswer | ""> =>
  questions.reduce<Record<string, ChecklistAnswer | "">>((accumulator, question) => {
    accumulator[question.id] = defaults[question.id] ?? "";
    return accumulator;
  }, {});

const statusButtonSx = {
  width: 20,
  height: 20,
  borderRadius: "6px",
  border: "1px solid",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1,
};

const UACChecklist = () => {
  const drsData = useAppSelector((state) => state.drs.data as unknown as Record<string, unknown> | null);

  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("Workflow");
  const [message, setMessage] = useState<string>("");

  const dynamicQuestions = useMemo(() => {
    const mapped = toChecklistQuestions(getDynamicQuestionSource(drsData));
    return mapped.length ? mapped : fallbackChecklistQuestions;
  }, [drsData]);

  const initialAnswersFromData = useMemo(() => {
    const source = getDynamicQuestionSource(drsData);
    if (!Array.isArray(source)) {
      return {} as Record<string, ChecklistAnswer | "">;
    }

    return source.reduce<Record<string, ChecklistAnswer | "">>((accumulator, item, index) => {
      const row = (item ?? {}) as RawChecklistQuestion;
      const id = String(row.id ?? `dynamic_question_${index + 1}`).trim();
      accumulator[id] = toChecklistAnswer(row.answer ?? row.status);
      return accumulator;
    }, {});
  }, [drsData]);

  const [answers, setAnswers] = useState<Record<string, ChecklistAnswer | "">>({});

  const effectiveAnswers = useMemo(
    () => getInitialAnswers(dynamicQuestions, { ...initialAnswersFromData, ...answers }),
    [answers, dynamicQuestions, initialAnswersFromData],
  );

  const categoryTabs = useMemo(() => {
    const grouped = new Map<string, number>();
    dynamicQuestions.forEach((question) => {
      const key = question.category || "Workflow";
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    });

    if (!grouped.size) {
      grouped.set("Workflow", dynamicQuestions.length);
    }

    return Array.from(grouped.entries()).map(([label, count]) => ({ label, count }));
  }, [dynamicQuestions]);

  const activeCategoryValue = categoryTabs.some((tab) => tab.label === activeCategory)
    ? activeCategory
    : categoryTabs[0]?.label ?? "Workflow";

  const filteredQuestions = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return dynamicQuestions.filter((question) => {
      const categoryMatches = (question.category || "Workflow") === activeCategoryValue;
      if (!categoryMatches) {
        return false;
      }

      if (!query) {
        return true;
      }

      return question.text.toLowerCase().includes(query);
    });
  }, [activeCategoryValue, dynamicQuestions, searchText]);

  const systemQuestions = filteredQuestions.filter((question) => question.section === "system");
  const reviewQuestions = filteredQuestions.filter((question) => question.section === "review");

  const completedCount = useMemo(
    () => dynamicQuestions.filter((question) => effectiveAnswers[question.id] === "yes" || effectiveAnswers[question.id] === "no").length,
    [dynamicQuestions, effectiveAnswers],
  );

  const progressPercentage = dynamicQuestions.length ? (completedCount / dynamicQuestions.length) * 100 : 0;

  const allAnswered = useMemo(
    () => dynamicQuestions.every((question) => effectiveAnswers[question.id] === "yes" || effectiveAnswers[question.id] === "no"),
    [dynamicQuestions, effectiveAnswers],
  );

  const handleChange = (questionId: string, value: ChecklistAnswer) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));
    setMessage("");
  };

  const handleSave = () => {
    if (!allAnswered) {
      setMessage("Please answer all checklist questions before saving.");
      return;
    }

    setMessage("Checklist details saved successfully.");
  };

  return (
    // <Container disableGutters>
      <Box sx={{ p:1 }}>
        <CustomAccordion title="UAC Checklist" defaultExpanded>
          <Box sx={{ mt: 1, borderRadius: "8px", backgroundColor: "#F6F6F6", border: "1px solid #E5E7EB" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid #E6E6E6" }}>
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, mb: 1 }}>
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                  Answer All Verification Questions
                </Typography>
                <Box sx={{ textAlign: "right" }}>
                  <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Overall Progress</Typography>
                  <Typography sx={{ fontSize: 24, color: "#9A2529", lineHeight: 1, fontWeight: 700 }}>
                    {completedCount}/{dynamicQuestions.length}
                  </Typography>
                </Box>
              </Box>

              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: "#EFE5CF",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    backgroundColor: "#EA7617",
                  },
                }}
              />

              <Typography sx={{ mt: 0.75, fontSize: 11, color: "#8A8A8A" }}>
                {Math.round(progressPercentage)}% Complete
              </Typography>

              <TextField
                size="small"
                fullWidth
                placeholder="Search Questions..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                sx={{ mt: 1.25, backgroundColor: "#FFFFFF" }}
              />
            </Box>

            <Box sx={{ px: 2, pt: 1, pb: 1.5, borderBottom: "1px solid #E6E6E6", display: "flex", flexWrap: "wrap", gap: 1 }}>
              {categoryTabs.map((tab) => {
                const isActive = tab.label === activeCategoryValue;
                return (
                  <Box
                    key={tab.label}
                    onClick={() => setActiveCategory(tab.label)}
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      borderRadius: "999px",
                      border: "1px solid",
                      borderColor: isActive ? "#0B4F8C" : "#D1D5DB",
                      backgroundColor: isActive ? "#E8F1FA" : "#FFFFFF",
                      color: isActive ? "#0B4F8C" : "#6B7280",
                      fontSize: 11,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      cursor: "pointer",
                    }}
                  >
                    {tab.label}
                    <Box
                      sx={{
                        minWidth: 16,
                        height: 16,
                        borderRadius: "999px",
                        px: 0.5,
                        backgroundColor: isActive ? "#0B4F8C" : "#9CA3AF",
                        color: "#FFFFFF",
                        fontSize: 10,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {tab.count}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ p: 2 }}>
              {!!systemQuestions.length && (
                <Box sx={{ mb: 1.5, border: "1px solid #B7D8BC", borderRadius: "8px", overflow: "hidden", backgroundColor: "#F5FAF6" }}>
                  <Box
                    sx={{
                      px: 1.25,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #DCECDC",
                    }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#2E7D32" }}>
                      {systemQuestions.length} Items Auto-Verified by the System
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Click to view details</Typography>
                  </Box>

                  <Box sx={{ px: 1.25, py: 1 }}>
                    {systemQuestions.map((question) => (
                      <Box
                        key={question.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          alignItems: "center",
                          gap: 1,
                          px: 1,
                          py: 0.75,
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #E5E7EB",
                          borderRadius: "6px",
                          mb: 0.75,
                          "&:last-of-type": { mb: 0 },
                        }}
                      >
                        <Typography sx={{ fontSize: 11.5, color: "#374151" }}>{question.text}</Typography>
                        <Box sx={{ display: "flex", gap: 0.75 }}>
                          <Box
                            role="button"
                            aria-label={`Yes for ${question.text}`}
                            onClick={() => handleChange(question.id, "yes")}
                            sx={{
                              ...statusButtonSx,
                              borderColor: effectiveAnswers[question.id] === "yes" ? "#63A66C" : "#CCD5DD",
                              backgroundColor: effectiveAnswers[question.id] === "yes" ? "#DFF1E2" : "#F7F8FA",
                              color: effectiveAnswers[question.id] === "yes" ? "#2E7D32" : "#9CA3AF",
                            }}
                          >
                            O
                          </Box>
                          <Box
                            role="button"
                            aria-label={`No for ${question.text}`}
                            onClick={() => handleChange(question.id, "no")}
                            sx={{
                              ...statusButtonSx,
                              borderColor: effectiveAnswers[question.id] === "no" ? "#D58080" : "#CCD5DD",
                              backgroundColor: effectiveAnswers[question.id] === "no" ? "#FBE7E7" : "#F7F8FA",
                              color: effectiveAnswers[question.id] === "no" ? "#B94A48" : "#9CA3AF",
                            }}
                          >
                            X
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {!!reviewQuestions.length && (
                <Box sx={{ border: "1px solid #D6DEE6", borderRadius: "8px", overflow: "hidden", backgroundColor: "#FFFFFF" }}>
                  <Box sx={{ px: 1.25, py: 1, backgroundColor: "#E9EEF4", borderBottom: "1px solid #D6DEE6" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#4B5563" }}>
                      Items Requiring Your Review ({reviewQuestions.length})
                    </Typography>
                  </Box>

                  <Box sx={{ px: 1.25, py: 1 }}>
                    {reviewQuestions.map((question, index) => (
                      <Box
                        key={question.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto",
                          alignItems: "center",
                          gap: 1,
                          px: 0.75,
                          py: 0.85,
                          borderBottom: "1px solid #EEF1F4",
                          "&:last-of-type": { borderBottom: "none" },
                        }}
                      >
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "999px",
                            backgroundColor: "#EAF1F9",
                            color: "#4678A8",
                            fontSize: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                          }}
                        >
                          {index + 1}
                        </Box>

                        <Typography sx={{ fontSize: 11.5, color: "#374151" }}>{question.text}</Typography>

                        <Box sx={{ display: "flex", gap: 0.75 }}>
                          <Box
                            role="button"
                            aria-label={`Yes for ${question.text}`}
                            onClick={() => handleChange(question.id, "yes")}
                            sx={{
                              ...statusButtonSx,
                              borderColor: effectiveAnswers[question.id] === "yes" ? "#63A66C" : "#CCD5DD",
                              backgroundColor: effectiveAnswers[question.id] === "yes" ? "#DFF1E2" : "#F7F8FA",
                              color: effectiveAnswers[question.id] === "yes" ? "#2E7D32" : "#9CA3AF",
                            }}
                          >
                            O
                          </Box>
                          <Box
                            role="button"
                            aria-label={`No for ${question.text}`}
                            onClick={() => handleChange(question.id, "no")}
                            sx={{
                              ...statusButtonSx,
                              borderColor: effectiveAnswers[question.id] === "no" ? "#D58080" : "#CCD5DD",
                              backgroundColor: effectiveAnswers[question.id] === "no" ? "#FBE7E7" : "#F7F8FA",
                              color: effectiveAnswers[question.id] === "no" ? "#B94A48" : "#9CA3AF",
                            }}
                          >
                            X
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {!systemQuestions.length && !reviewQuestions.length && (
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                  No checklist questions available for the selected filter.
                </Typography>
              )}
            </Box>

            {message && (
              <Typography
                sx={{
                  mt: 0,
                  px: 2,
                  pb: 2,
                  fontSize: 13,
                  color: message.toLowerCase().includes("success") ? "#0F8A3D" : "#DE2C3B",
                }}
              >
                {message}
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <CustomButton
              variant="contained"
              onClick={handleSave}
              sx={{
                minWidth: 120,
                height: 36,
                borderRadius: "999px",
                px: 2.5,
                fontSize: 12,
              }}
            >
              Save details
            </CustomButton>
          </Box>
        </CustomAccordion>
      </Box>
    // </Container>
  );
};

export default UACChecklist;