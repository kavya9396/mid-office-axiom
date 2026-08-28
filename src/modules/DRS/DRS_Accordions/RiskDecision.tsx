import { Box, Typography } from "@mui/material";
import type { ChangeEvent, MouseEvent } from "react";
import { useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useAppContext } from "../../../hooks/useAppContext";
import { useAppSelector } from "../../../store/hooks";
import Logo from "../../../assets/ICICI Logo_.svg";
import { validateRequirementDecision } from "../../../validations/drsRequirementDecisionValidation";
import { validateDrsFinalBre } from "../../../validations/drsBreValidation";

type RiskReportForm = {
  krnNo: string;
  applicationNo: string;
  reportReceivedDate: string;
  customerName: string;
  vendorName: string;
  feedbackScore: string;
  nameAddressStatus: string;
  standardOfLiving: string;
  lifeAssuredExistence: string;
  educationalQualification: string;
  contactabilityEstablished: string;
  occupationCategory: string;
  customerAppliedForPolicy: string;
  annualIncome: string;
  metWithWhom: string;
  lcAvailability: string;
  habits: string;
  physicalFeatures: string;
  previousMedicalHistory: string;
  photoAvailability: string;
  vicinityChecks: string;
  geoTagging: string;
  typeOfHouse: string;
  faceMatch: string;
  feRemarks: string;
  investigationScore: string;
};

const defaultRiskReportForm = (applicationNumber?: string | null): RiskReportForm => ({
  krnNo: "1316307",
  applicationNo: String(applicationNumber ?? "").trim() || "OP00859030",
  reportReceivedDate: "2024-09-09 17:11:35.093",
  customerName: "Ravinder Ravinder",
  vendorName: "The Credentials",
  feedbackScore: "90",
  nameAddressStatus: "Address Traced",
  standardOfLiving: "Good",
  lifeAssuredExistence: "Yes",
  educationalQualification: "Graduate",
  contactabilityEstablished: "Yes",
  occupationCategory: "Salaried",
  customerAppliedForPolicy: "Yes",
  annualIncome: "Between 5 Lacs and 10 Lacs",
  metWithWhom: "Self",
  lcAvailability: "Yes",
  habits: "Non-smoker and non-alcoholic",
  physicalFeatures: "Healthy",
  previousMedicalHistory: "No",
  photoAvailability: "Yes",
  vicinityChecks: "Positive",
  geoTagging: "",
  typeOfHouse: "Owned",
  faceMatch: "Yes",
  feRemarks:
    "Investigation remarks Met with Self-Ravinder, address and stay confirmed-Yes, residing by birth, House-Parents owned, Previous medical history-None, KYC checks-Yes, Vicinity checks-yes Any other additional remarks updated.",
  investigationScore: "90",
});

type RiskReportField = {
  label: string;
  key: keyof RiskReportForm;
  multiline?: boolean;
  minRows?: number;
};

const reportRows: Array<[RiskReportField, RiskReportField]> = [
  [
    { label: "01) Name, address & stay confirmed", key: "nameAddressStatus" },
    { label: "02) Standard of Living", key: "standardOfLiving" },
  ],
  [
    { label: "03) Life assured existence", key: "lifeAssuredExistence" },
    { label: "04) Educational qualification", key: "educationalQualification" },
  ],
  [
    { label: "05) Contactability established", key: "contactabilityEstablished" },
    { label: "06) Occupation category", key: "occupationCategory" },
  ],
  [
    { label: "07) Customer applied for policy", key: "customerAppliedForPolicy" },
    { label: "08) Annual income", key: "annualIncome" },
  ],
  [
    { label: "09) Met with whom", key: "metWithWhom" },
    { label: "10) Availability of LC at current address", key: "lcAvailability" },
  ],
  [
    { label: "11) Habits", key: "habits" },
    { label: "12) Physical features", key: "physicalFeatures" },
  ],
  [
    { label: "13) Previous medical history / hospitalization", key: "previousMedicalHistory" },
    { label: "14) Photo availability of Life assured", key: "photoAvailability" },
  ],
  [
    { label: "15) Vicinity checks", key: "vicinityChecks" },
    { label: "16) Geo Tagging", key: "geoTagging" },
  ],
  [
    { label: "17) Type of House", key: "typeOfHouse" },
    { label: "18) Face Match", key: "faceMatch" },
  ],
  [
    { label: "19) FE remarks", key: "feRemarks", multiline: true, minRows: 6 },
    { label: "20) Investigation score", key: "investigationScore" },
  ],
];

const cellSx = {
  border: "1px solid #8c8c8c",
  p: 0.5,
  minHeight: 36,
};

const headerCellSx = {
  ...cellSx,
  backgroundColor: "#8d8d8d",
  color: "#111",
  fontSize: 12,
  fontWeight: 700,
  textAlign: "center",
};

const fieldInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    fontSize: 12,
    backgroundColor: "#fff",
  },
  "& .MuiOutlinedInput-input": {
    p: "5px 6px",
  },
  "& textarea": {
    fontSize: 12,
    lineHeight: 1.35,
  },
};

const ReportInput = ({
  value,
  onChange,
  multiline = false,
  minRows,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  minRows?: number;
}) => (
  <CustomTextField
    fullWidth
    value={value}
    onChange={onChange}
    multiline={multiline}
    minRows={minRows}
    size="small"
    sx={fieldInputSx}
  />
);

const RiskDecision = () => {
  const { applicationNumber } = useAppContext();
  const drsData = useAppSelector((state) => state.drs.data as unknown as Record<string, unknown> | null);
  const [remarks, setRemarks] = useState("");
  const [riskDecision] = useState("");
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isRiskReportOpen, setIsRiskReportOpen] = useState(false);
  const [riskReportForm, setRiskReportForm] = useState<RiskReportForm>(() =>
    defaultRiskReportForm(applicationNumber ?? localStorage.getItem("applicationNumber")),
  );

  const handleOpenRiskReport = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsRiskReportOpen(true);
  };

  const updateRiskReportField = (key: keyof RiskReportForm, value: string) => {
    setRiskReportForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmitIntent = () => {
    const breValidation = validateDrsFinalBre(drsData);
    if (!breValidation.canPerformAction) {
      setSubmitMessage(breValidation.message);
      return;
    }
    const requirementValidation = validateRequirementDecision(drsData, riskDecision);
    if (!requirementValidation.isValid) {
      setSubmitMessage(requirementValidation.message);
      return;
    }

    setSubmitMessage(null);
    setConfirmationDialogOpen(true);
  };

  const riskReportButton = (
    <CustomButton
      variant="outlined"
      size="small"
      onClick={handleOpenRiskReport}
      onFocus={(event) => event.stopPropagation()}
      sx={{
        height: 28,
        minWidth: 92,
        borderRadius: "8px",
        borderColor: "#C43B40",
        color: "#C43B40",
        fontSize: 12,
        fontWeight: 500,
        px: 1.3,
        "&:hover": {
          borderColor: "#A83337",
          backgroundColor: "#fff5f5",
        },
      }}
    >
      Risk report
    </CustomButton>
  );

  return (
    <>
      <Box sx={{ mt: 1, p: 1 }}>
        <CustomAccordion title="Risk Decision" chip={riskReportButton} defaultExpanded>
          <Box
            sx={{
              p: 1.25,
              borderRadius: "6px",
              backgroundColor: "#f6f6f6",
            }}
          >
            <CustomTextField
              fullWidth
              multiline
              minRows={2}
              label="Risk Remarks"
              placeholder="Enter remarks..."
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              sx={{
                backgroundColor: "#fff",
                borderRadius: "6px",
                mb: 1,
              }}
            />

            <Box sx={{ display: "flex", mt: 1 }}>
              <CustomButton
                variant="contained"
                onClick={handleSubmitIntent}
                sx={{
                  minWidth: 140,
                  height: 36,
                  borderRadius: "50px",
                  fontWeight: 600,
                  px: 2.5,
                }}
              >
                Submit
              </CustomButton>
            </Box>
            {submitMessage && (
              <Typography sx={{ mt: 1, fontSize: 12, color: "#DE2C3B" }}>
                {submitMessage}
              </Typography>
            )}
          </Box>
        </CustomAccordion>
      </Box>

      <CustomDialog
        open={confirmationDialogOpen}
        onClose={() => setConfirmationDialogOpen(false)}
        title={<Typography sx={{ fontSize: 16, fontWeight: 700 }}>Confirmation</Typography>}
        actionsSx={{ justifyContent: "center", gap: 1, pb: 2 }}
        actions={
          <>
            <CustomButton
              variant="contained"
              onClick={() => setConfirmationDialogOpen(false)}
              sx={{ minWidth: 170, borderRadius: "50px" }}
            >
              Okay (Proceed further)
            </CustomButton>
            <CustomButton
              variant="outlined"
              onClick={() => setConfirmationDialogOpen(false)}
              sx={{ minWidth: 190, borderRadius: "50px" }}
            >
              Cancel (back to same screen)
            </CustomButton>
          </>
        }
      >
        <Typography sx={{ fontSize: "12px", color: "#161616" }}>
          You are initiating a risk investigation process for the applicant
        </Typography>
      </CustomDialog>

      <CustomDialog
        open={isRiskReportOpen}
        onClose={() => setIsRiskReportOpen(false)}
        title={
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#063E6F", letterSpacing: 0 }}>
            RISK REPORT
          </Typography>
        }
        maxWidth="md"
        fullWidth
        paperSx={{
          borderRadius: "8px",
          maxHeight: "92vh",
        }}
        contentSx={{
          pt: 0,
          px: 2,
          pb: 2,
        }}
        actions={
          <CustomButton
            variant="contained"
            onClick={() => setIsRiskReportOpen(false)}
            sx={{ minWidth: 120, borderRadius: "8px" }}
          >
            Save
          </CustomButton>
        }
      >
        <Box
          sx={{
            position: "relative",
            border: "1px solid #c9c9c9",
            backgroundColor: "#fff",
            p: 1.25,
            minWidth: 640,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 800,
              color: "rgba(80, 80, 80, 0.28)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            PREVIEW
          </Box>

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 0.75 }}>
              <Box
                component="img"
                src={Logo}
                alt="ICICI Prudential Logo"
                sx={{ width: 210, maxWidth: "55%" }}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                borderTop: "1px solid #8c8c8c",
                borderLeft: "1px solid #8c8c8c",
                fontSize: 12,
              }}
            >
              <Box sx={{ ...headerCellSx, gridColumn: "1 / -1" }}>New Business Risk Report</Box>
              <Box sx={cellSx}><strong>KRN no</strong></Box>
              <Box sx={cellSx}>
                <ReportInput value={riskReportForm.krnNo} onChange={(event) => updateRiskReportField("krnNo", event.target.value)} />
              </Box>
              <Box sx={cellSx}><strong>Customer name</strong></Box>
              <Box sx={cellSx}>
                <ReportInput value={riskReportForm.customerName} onChange={(event) => updateRiskReportField("customerName", event.target.value)} />
              </Box>
              <Box sx={cellSx}><strong>Application no</strong></Box>
              <Box sx={cellSx}>
                <ReportInput value={riskReportForm.applicationNo} onChange={(event) => updateRiskReportField("applicationNo", event.target.value)} />
              </Box>
              <Box sx={cellSx}><strong>Vendor name</strong></Box>
              <Box sx={cellSx}>
                <ReportInput value={riskReportForm.vendorName} onChange={(event) => updateRiskReportField("vendorName", event.target.value)} />
              </Box>
              <Box sx={cellSx}><strong>Report received date</strong></Box>
              <Box sx={{ ...cellSx, gridColumn: "span 3" }}>
                <ReportInput value={riskReportForm.reportReceivedDate} onChange={(event) => updateRiskReportField("reportReceivedDate", event.target.value)} />
              </Box>
            </Box>

            <Box sx={{ height: 10 }} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1.35fr 1fr 1.35fr",
                borderTop: "1px solid #8c8c8c",
                borderLeft: "1px solid #8c8c8c",
                fontSize: 12,
              }}
            >
              <Box
                sx={{
                  ...headerCellSx,
                  gridColumn: "1 / -1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <span>Field Executive Feedback Score:</span>
                <Box sx={{ width: 72 }}>
                  <ReportInput
                    value={riskReportForm.feedbackScore}
                    onChange={(event) => updateRiskReportField("feedbackScore", event.target.value)}
                  />
                </Box>
              </Box>
              {reportRows.map(([left, right]) => (
                <Box key={`${left.key}-${right.key}`} sx={{ display: "contents" }}>
                  <Box sx={cellSx}><strong>{left.label}</strong></Box>
                  <Box sx={cellSx}>
                    <ReportInput
                      value={riskReportForm[left.key]}
                      onChange={(event) => updateRiskReportField(left.key, event.target.value)}
                      multiline={left.multiline}
                      minRows={left.minRows}
                    />
                  </Box>
                  <Box sx={cellSx}><strong>{right.label}</strong></Box>
                  <Box sx={cellSx}>
                    <ReportInput
                      value={riskReportForm[right.key]}
                      onChange={(event) => updateRiskReportField(right.key, event.target.value)}
                      multiline={right.multiline}
                      minRows={right.minRows}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </CustomDialog>
    </>
  );
};

export default RiskDecision;