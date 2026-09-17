import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

type RiskDecision = "STD" | "NON STD";

type EditableRiskRow = {
  id: string;
  label: string;
  value: string;
};

type MemberState = {
  id: string;
  memberName: string;
  readOnlyFields: Array<{ label: string; value: string }>;
  riskAssessmentRows: EditableRiskRow[];
  riskRemark: string;
  riskDecision: RiskDecision;
};

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "info";
};

const defaultRiskAssessmentRows: EditableRiskRow[] = [
  { id: "nameAddress", label: "Name, address & stay confirmed", value: "Yes" },
  { id: "standardOfLiving", label: "Standard of living", value: "Good" },
  { id: "lifeAssuredExistence", label: "Life assured existence", value: "Yes" },
  {
    id: "education",
    label: "Educational qualification",
    value: "Graduate",
  },
  { id: "contactability", label: "Contactability established", value: "Yes" },
  { id: "occupation", label: "Occupation category", value: "Salaried" },
  {
    id: "computerPolicy",
    label: "Computer applied for policy",
    value: "Yes",
  },
  {
    id: "annualIncome",
    label: "Annual income",
    value: "Between Rs 5 Lacs and 10 Lacs",
  },
  { id: "metWithWhom", label: "Met with whom", value: "Self" },
  {
    id: "lcAvailability",
    label: "Availability of LC at current address",
    value: "Yes",
  },
  {
    id: "hobbies",
    label: "Hobbies",
    value: "Non-smoker and non-alcoholic",
  },
  { id: "physicalFeatures", label: "Physical features", value: "Healthy" },
  {
    id: "medicalHistory",
    label: "Previous medical history",
    value: "No",
  },
  {
    id: "photoAvailability",
    label: "Photo availability of life assured",
    value: "Yes",
  },
  { id: "vitalityCheck", label: "Vitality check", value: "Positive" },
  { id: "geoTagging", label: "Geo tagging", value: "Yes" },
  { id: "typeOfHouse", label: "Type of house", value: "Owned" },
  { id: "faceMatch", label: "Face match", value: "Yes" },
  {
    id: "investigationScore",
    label: "Investigation score",
    value: "90",
  },
  {
    id: "feRemarks",
    label: "FE remarks",
    value: "Investigation remarks to be mentioned here.",
  },
];

const initialMembers: MemberState[] = [
  {
    id: "life-assured-1",
    memberName: "Life Assured 1",
    readOnlyFields: [
      { label: "KRN No", value: "1316367" },
      { label: "Application No", value: "NB000021" },
      { label: "Customer Name", value: "Ravinder Rvinder" },
      { label: "Vendor Name", value: "The Credentials" },
      {
        label: "Report Revised Date",
        value: "2024-09-07 11:36:09",
      },
    ],
    riskAssessmentRows: defaultRiskAssessmentRows.map((row) => ({ ...row })),
    riskRemark: "The investigation report is satisfactory and supports the application review.",
    riskDecision: "STD",
  },
  {
    id: "life-assured-2",
    memberName: "Life Assured 2",
    readOnlyFields: [
      { label: "KRN No", value: "1316368" },
      { label: "Application No", value: "NB000022" },
      { label: "Customer Name", value: "Amit Sharma" },
      { label: "Vendor Name", value: "The Credentials" },
      {
        label: "Report Revised Date",
        value: "2024-09-08 09:15:42",
      },
    ],
    riskAssessmentRows: defaultRiskAssessmentRows.map((row) => ({ ...row })),
    riskRemark: "Additional verification requested for income and address confirmation.",
    riskDecision: "NON STD",
  },
  {
    id: "proposer",
    memberName: "Proposer",
    readOnlyFields: [
      { label: "KRN No", value: "1316369" },
      { label: "Application No", value: "NB000023" },
      { label: "Customer Name", value: "Priya Singh" },
      { label: "Vendor Name", value: "The Credentials" },
      {
        label: "Report Revised Date",
        value: "2024-09-09 12:42:18",
      },
    ],
    riskAssessmentRows: defaultRiskAssessmentRows.map((row) => ({ ...row })),
    riskRemark: "No adverse observation noted. Approved for review.",
    riskDecision: "STD",
  },
];

const sectionCardSx = {
  border: "1px solid #D8D8D8",
  borderRadius: 2,
  backgroundColor: "#FFFFFF",
  overflow: "hidden",
};

const sectionHeaderSx = {
  px: 2,
  py: 1.2,
  backgroundColor: "#FFEAD7",
  borderBottom: "1px solid #D8D8D8",
  color: "#1F2937",
  fontWeight: 700,
  fontSize: "14px",
};

const RiskDetailsPage = () => {
  const [activeMemberIndex, setActiveMemberIndex] = useState(0);
  const [members, setMembers] = useState<MemberState[]>(initialMembers);
  const [editModeByMember, setEditModeByMember] = useState<Record<string, boolean>>({
    "life-assured-1": false,
    "life-assured-2": false,
    proposer: false,
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const activeMember = members[activeMemberIndex];
  const isEditing = !!editModeByMember[activeMember.id];

  const updateMemberAssessment = (rowId: string, value: string) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) => {
        if (member.id !== activeMember.id) return member;

        return {
          ...member,
          riskAssessmentRows: member.riskAssessmentRows.map((row) =>
            row.id === rowId ? { ...row, value } : row,
          ),
        };
      }),
    );
  };

  const handleResetAssessment = () => {
    const sourceMember = initialMembers.find((member) => member.id === activeMember.id);

    if (!sourceMember) return;

    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === activeMember.id
          ? {
              ...member,
              riskAssessmentRows: sourceMember.riskAssessmentRows.map((row) => ({
                ...row,
              })),
            }
          : member,
      ),
    );

    setEditModeByMember((prev) => ({ ...prev, [activeMember.id]: false }));
    setSnackbar({
      open: true,
      message: `${activeMember.memberName} assessment reset successfully.`,
      severity: "info",
    });
  };

  const handleSaveAssessment = () => {
    console.log(
      `Saved assessment for ${activeMember.memberName}`,
      activeMember.riskAssessmentRows,
    );

    setEditModeByMember((prev) => ({ ...prev, [activeMember.id]: false }));
    setSnackbar({
      open: true,
      message: `${activeMember.memberName} assessment saved successfully.`,
      severity: "success",
    });
  };

  const handleRiskSubmit = () => {
    console.log(
      `Submitted risk decision for ${activeMember.memberName}`,
      {
        riskRemark: activeMember.riskRemark,
        riskDecision: activeMember.riskDecision,
      },
    );

    setSnackbar({
      open: true,
      message: `${activeMember.memberName} risk decision submitted successfully.`,
      severity: "success",
    });
  };

  const handleAssessmentFieldChange = (
    field: "riskRemark" | "riskDecision",
    value: string,
  ) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === activeMember.id
          ? { ...member, [field]: value }
          : member,
      ),
    );
  };

  return (
    <Container maxWidth={false} sx={{ py: 3, bgcolor: "#F5F5F5" }}>
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #D8D8D8",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: "#E45F14",
            color: "#FFFFFF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
            Risk Details
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <Tabs
            value={activeMemberIndex}
            onChange={(_, newValue) => setActiveMemberIndex(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: "1px solid #D8D8D8",
              mb: 2,
              minHeight: 42,
              "& .MuiTabs-indicator": {
                backgroundColor: "#E45F14",
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                color: "#4A4A4A",
                minHeight: 42,
                padding: "0 18px",
              },
              "& .Mui-selected": {
                color: "#E45F14 !important",
              },
            }}
          >
            {members.map((member, index) => (
              <Tab key={member.id} label={member.memberName} value={index} />
            ))}
          </Tabs>

          <Stack spacing={2}>
            <Box sx={sectionCardSx}>
              <Box sx={sectionHeaderSx}>Section 1: Member Details</Box>
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      md: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  {activeMember.readOnlyFields.map((field) => (
                    <Box key={field.label}>
                      <Typography
                        sx={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#4A4A4A",
                          mb: 0.5,
                        }}
                      >
                        {field.label}
                      </Typography>
                      <TextField
                        value={field.value}
                        size="small"
                        fullWidth
                        slotProps={{
                          input: {
                            readOnly: true,
                            style: {
                              backgroundColor: "#F7F7F7",
                              borderRadius: 8,
                              fontSize: "12px",
                              color: "#1F2937",
                            },
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            <Box sx={sectionCardSx}>
              <Box
                sx={{
                  ...sectionHeaderSx,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: "14px", fontWeight: 700 }}>
                  Section 2: Risk Assessment
                </Typography>

                {!isEditing ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                      setEditModeByMember((prev) => ({
                        ...prev,
                        [activeMember.id]: true,
                      }))
                    }
                    sx={{
                      backgroundColor: "#E45F14",
                      color: "#FFFFFF",
                      textTransform: "none",
                      borderRadius: 1,
                      minWidth: 90,
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: "#D95712",
                      },
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleResetAssessment}
                      sx={{
                        color: "#E45F14",
                        borderColor: "#E45F14",
                        textTransform: "none",
                        borderRadius: 1,
                        fontWeight: 600,
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSaveAssessment}
                      sx={{
                        backgroundColor: "#E45F14",
                        color: "#FFFFFF",
                        textTransform: "none",
                        borderRadius: 1,
                        fontWeight: 600,
                        "&:hover": {
                          backgroundColor: "#D95712",
                        },
                      }}
                    >
                      Save
                    </Button>
                  </Stack>
                )}
              </Box>

              <Box sx={{ p: 1.5 }}>
                {Array.from({ length: Math.ceil(activeMember.riskAssessmentRows.length / 2) }).map(
                  (_, rowIndex) => {
                    const firstRow = activeMember.riskAssessmentRows[rowIndex * 2];
                    const secondRow = activeMember.riskAssessmentRows[rowIndex * 2 + 1];

                    return (
                      <Box
                        key={`risk-row-${rowIndex}`}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                          gap: 1,
                          mb: rowIndex === Math.ceil(activeMember.riskAssessmentRows.length / 2) - 1 ? 0 : 1,
                        }}
                      >
                        {firstRow && (
                          <>
                            <Box
                              sx={{
                                border: "1px solid #E1E1E1",
                                borderRadius: 1,
                                backgroundColor: "#F9F9F9",
                                px: 1,
                                py: 0.75,
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#1F2937",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {firstRow.label}
                            </Box>

                            <Box
                              sx={{
                                border: "1px solid #E1E1E1",
                                borderRadius: 1,
                                backgroundColor: "#FFFFFF",
                                px: 1,
                                py: 0.75,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {isEditing ? (
                                <TextField
                                  value={firstRow.value}
                                  onChange={(event) =>
                                    updateMemberAssessment(firstRow.id, event.target.value)
                                  }
                                  size="small"
                                  fullWidth
                                  sx={{
                                    "& .MuiInputBase-root": {
                                      fontSize: "12px",
                                      backgroundColor: "#FFFFFF",
                                    },
                                  }}
                                />
                              ) : (
                                <Typography sx={{ fontSize: "12px", color: "#4A4A4A" }}>
                                  {firstRow.value}
                                </Typography>
                              )}
                            </Box>
                          </>
                        )}

                        {secondRow && (
                          <>
                            <Box
                              sx={{
                                border: "1px solid #E1E1E1",
                                borderRadius: 1,
                                backgroundColor: "#F9F9F9",
                                px: 1,
                                py: 0.75,
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#1F2937",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {secondRow.label}
                            </Box>

                            <Box
                              sx={{
                                border: "1px solid #E1E1E1",
                                borderRadius: 1,
                                backgroundColor: "#FFFFFF",
                                px: 1,
                                py: 0.75,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {isEditing ? (
                                <TextField
                                  value={secondRow.value}
                                  onChange={(event) =>
                                    updateMemberAssessment(secondRow.id, event.target.value)
                                  }
                                  size="small"
                                  fullWidth
                                  sx={{
                                    "& .MuiInputBase-root": {
                                      fontSize: "12px",
                                      backgroundColor: "#FFFFFF",
                                    },
                                  }}
                                />
                              ) : (
                                <Typography sx={{ fontSize: "12px", color: "#4A4A4A" }}>
                                  {secondRow.value}
                                </Typography>
                              )}
                            </Box>
                          </>
                        )}

                        {!secondRow && firstRow && (
                          <>
                            <Box sx={{ visibility: "hidden" }} />
                            <Box sx={{ visibility: "hidden" }} />
                          </>
                        )}
                      </Box>
                    );
                  },
                )}
              </Box>
            </Box>

            <Box sx={sectionCardSx}>
              <Box sx={sectionHeaderSx}>Section 3: Risk Decision</Box>
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    label="Risk Remark"
                    value={activeMember.riskRemark}
                    onChange={(event) =>
                      handleAssessmentFieldChange("riskRemark", event.target.value)
                    }
                    multiline
                    minRows={2}
                    sx={{
                      flex: 3,
                      minWidth: { xs: "100%", sm: 260 },
                      "& .MuiInputLabel-root": {
                        color: "#4A4A4A",
                      },
                    }}
                  />

                  <FormControl
                    sx={{
                      flex: 1,
                      minWidth: { xs: "100%", sm: 150 },
                    }}
                  >
                    <InputLabel id="risk-decision-label">Risk Decision</InputLabel>
                    <Select
                      labelId="risk-decision-label"
                      value={activeMember.riskDecision}
                      label="Risk Decision"
                      onChange={(event) =>
                        handleAssessmentFieldChange(
                          "riskDecision",
                          event.target.value as RiskDecision,
                        )
                      }
                    >
                      <MenuItem value="STD">STD</MenuItem>
                      <MenuItem value="NON STD">NON STD</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    onClick={handleRiskSubmit}
                    sx={{
                      backgroundColor: "#E45F14",
                      color: "#FFFFFF",
                      textTransform: "none",
                      borderRadius: 1,
                      px: 3,
                      fontWeight: 700,
                      minWidth: 110,
                      height: 56,
                      "&:hover": {
                        backgroundColor: "#D95712",
                      },
                    }}
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RiskDetailsPage;
