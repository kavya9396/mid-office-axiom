import { Box, Radio, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";

type ChecklistAnswer = "yes" | "no";

type ChecklistQuestion = {
  id: string;
  text: string;
};

const checklistQuestions: ChecklistQuestion[] = [
  { id: "validAgeProof", text: "Whether Valid Age Proof Received?" },
  { id: "photoMatch", text: "Have Client Photo Match Between KYC / Video MER / Medicals / PIVC?" },
  { id: "fvFinancialEvidence", text: "Whether Client Is FV Basis Available Financial Evidence?" },
  { id: "reinsuranceManualCheck", text: "Whether Reinsurance Manual Check For Base & Rider Rating + RI Rating Sheet Attached?" },
  { id: "breRemarks", text: "Have You Verified The BRE Remarks?" },
  { id: "annualIncomeMismatch", text: "Have You Checked Life Assured \"Annual Income\" Details As There Is Mismatched Between Tele MER / Video MER And Application Form?" },
  { id: "faceVerification", text: "Have You Verified Face Verification Manually?" },
];

const getInitialAnswers = (): Record<string, ChecklistAnswer | ""> =>
  checklistQuestions.reduce<Record<string, ChecklistAnswer | "">>((accumulator, question) => {
    accumulator[question.id] = "";
    return accumulator;
  }, {});

const UWChecklist = () => {
  const [answers, setAnswers] = useState<Record<string, ChecklistAnswer | "">>(() => getInitialAnswers());
  const [message, setMessage] = useState<string>("");

  const allAnswered = useMemo(
    () => checklistQuestions.every((question) => answers[question.id] === "yes" || answers[question.id] === "no"),
    [answers],
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
        <CustomAccordion title="UW Checklist" defaultExpanded>
          <Box sx={{ mt: 1, p: 2, borderRadius: "8px", backgroundColor: "#F6F6F6" }}>
            <Box sx={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}>
              <Table size="small" sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#DDE3E8" }}>
                    <TableCell sx={{ width: "75%", fontSize: 13, fontWeight: 600, color: "#374151", py: 1.25 }}>
                      Checklist Questions
                    </TableCell>
                    <TableCell align="center" sx={{ width: "12.5%", fontSize: 13, fontWeight: 600, color: "#374151", py: 1.25 }}>
                      Yes
                    </TableCell>
                    <TableCell align="center" sx={{ width: "12.5%", fontSize: 13, fontWeight: 600, color: "#374151", py: 1.25 }}>
                      No
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {checklistQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell sx={{ fontSize: 12, color: "#3D4852", py: 1.5 }}>
                        {question.text}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1 }}>
                        <Radio
                          size="small"
                          checked={answers[question.id] === "yes"}
                          onChange={() => handleChange(question.id, "yes")}
                          sx={{
                            p: 0.5,
                            color: "#D1D5DB",
                            "&.Mui-checked": {
                              color: "#EA7617",
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1 }}>
                        <Radio
                          size="small"
                          checked={answers[question.id] === "no"}
                          onChange={() => handleChange(question.id, "no")}
                          sx={{
                            p: 0.5,
                            color: "#D1D5DB",
                            "&.Mui-checked": {
                              color: "#EA7617",
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {message && (
              <Typography
                sx={{
                  mt: 1,
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
                minWidth: 160,
                height: 42,
                borderRadius: "999px",
                px: 3,
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

export default UWChecklist;
