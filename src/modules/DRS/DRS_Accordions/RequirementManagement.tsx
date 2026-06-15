import { Box, Container, Typography } from "@mui/material";
import { useState } from "react";
import type { Column } from "../../../components/ui/Table/Table";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTable from "../../../components/ui/Table/Table";
import CustomButton from "../../../components/ui/Button/Button";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import { columnFlex, modalTitleStyles } from "../../../utils/styles";
import CustomSelect from "../../../components/ui/Select/Select";
import type { AdditionalRequirementRow, CVTRequirementRow } from "../../../types/drs.types";
import type { RootState } from "../../../store/store";
import { useSelector } from "react-redux";

const requirementColumns: Column<CVTRequirementRow>[] = [
  { key: "team", header: "Team", width: "10%" },
  { key: "profile", header: "Profile", width: "10%" },
  { key: "category", header: "Category", width: "10%" },
  { key: "subCategory", header: "Sub Category", width: "12%" },
  { key: "document", header: "Document", width: "10%" },
  { key: "specialTest", header: "Special Test", width: "10%" },
  { key: "reason", header: "Reason", width: "10%" },
  { key: "fupCode", header: "FUP Code", width: "10%" },
  { key: "description", header: "Description", width: "15%" },
  { key: "status", header: "Status", width: "10%" },
  { key: "raisedDate", header: "Raised Date", width: "10%" },
  { key: "raisedBy", header: "Raised By", width: "10%" },
  { key: "receivedDate", header: "Received Date", width: "10%" },
  { key: "receivedBy", header: "Received By", width: "10%" },
  { key: "validity", header: "Validity", width: "10%" },
  { key: "userId", header: "User ID", width: "10%" },
  { key: "remarks", header: "Remarks", width: "15%" },
  { key: "udsLink", header: "UDS Link", width: "15%" },
];

const formFields = [
  [
    {
      name: "team",
      label: "Team",
      options: [
        { label: "Team A", value: "Team A" },
        { label: "Team B", value: "Team B" },
        { label: "Team C", value: "Team C" },
      ],
    },
    {
      name: "profile",
      label: "Profile",
      options: [
        { label: "Profile 1", value: "Profile 1" },
        { label: "Profile 2", value: "Profile 2" },
        { label: "Profile 3", value: "Profile 3" },
      ],
    },
    {
      name: "category",
      label: "Category",
      options: [
        { label: "Category 1", value: "Category 1" },
        { label: "Category 2", value: "Category 2" },
        { label: "Category 3", value: "Category 3" },
      ],
    },
  ],
  [
    {
      name: "subCategory",
      label: "Sub Category",
      options: [
        { label: "Sub Category 1", value: "Sub Category 1" },
        { label: "Sub Category 2", value: "Sub Category 2" },
      ],
    },
    {
      name: "document",
      label: "Document",
      options: [
        { label: "Doc 1", value: "Doc 1" },
        { label: "Doc 2", value: "Doc 2" },
        { label: "Doc 3", value: "Doc 3" },
        { label: "Doc 4", value: "Doc 4" },
      ],
    },
    {
      name: "specialTest",
      label: "Special Test",
      options: [
        { label: "Test 1", value: "Test 1" },
        { label: "Test 2", value: "Test 2" },
      ],
    },
  ],
  [
    {
      name: "reason",
      label: "Reason",
      options: [
        { label: "Reason 1", value: "Reason 1" },
        { label: "Reason 2", value: "Reason 2" },
      ],
    },
    {
      name: "fupCode",
      label: "FUP Code",
      options: [
        { label: "FUP 1", value: "FUP 1" },
        { label: "FUP 2", value: "FUP 2" },
      ],
    },
    {
      name: "description",
      label: "Description",
      options: [
        { label: "Desc 1", value: "Desc 1" },
        { label: "Desc 2", value: "Desc 2" },
      ],
    },
  ],
  [
    {
      name: "status",
      label: "Status",
      options: [
        { label: "Open", value: "Open" },
        { label: "Closed", value: "Closed" },
        { label: "Pending", value: "Pending" },
      ],
    },
    {
      name: "validity",
      label: "Validity",
      options: [
        { label: "Valid", value: "Valid" },
        { label: "Expired", value: "Expired" },
      ],
    },
    {
      name: "userId",
      label: "User ID",
      options: [
        { label: "User 1", value: "User 1" },
        { label: "User 2", value: "User 2" },
      ],
    },
  ],
  [
    {
      name: "raisedBy",
      label: "Raised By",
      options: [
        { label: "System", value: "System" },
        { label: "User", value: "User" },
      ],
    },
    {
      name: "receivedBy",
      label: "Received By",
      options: [
        { label: "Team A", value: "Team A" },
        { label: "Team B", value: "Team B" },
      ],
    },
    {
      name: "remarks",
      label: "Remarks",
      options: [
        { label: "Remark 1", value: "Remark 1" },
        { label: "Remark 2", value: "Remark 2" },
      ],
    },
  ],
  [
    {
      name: "raisedDate",
      label: "Raised Date",
      options: [
        { label: "Today", value: "Today" },
        { label: "Yesterday", value: "Yesterday" },
      ],
    },
    {
      name: "receivedDate",
      label: "Received Date",
      options: [
        { label: "Today", value: "Today" },
        { label: "Yesterday", value: "Yesterday" },
      ],
    },
    {
      name: "udsLink",
      label: "UDS Link",
      options: [
        { label: "Link 1", value: "Link 1" },
        { label: "Link 2", value: "Link 2" },
      ],
    },
  ],
];

const RequirementManagement = () => {
  const {
    requirements,
  } = useSelector((state: RootState) => state.drs);

  const [openReqDialog, setOpenReqDialog] = useState(false);
  const [requirementForm, setRequirementForm] = useState({
    team: "",
    profile: "",
    category: "",
    subCategory: "",
    document: "",
    specialTest: "",
    reason: "",
    fupCode: "",
    description: "",
    status: "",
    raisedDate: "",
    raisedBy: "",
    receivedDate: "",
    receivedBy: "",
    validity: "",
    userId: "",
    remarks: "",
    udsLink: "",
  });
  const [submittedRequirements, setSubmittedRequirements] = useState<CVTRequirementRow[]>([]);

  const requirementRows = [
    ...(requirements?.map((item: AdditionalRequirementRow) => ({
      team: item.team,
      profile: item.profile,
      category: item.category,
      subCategory: item.subCategory,
      document: item.document,
      specialTest: item.specialTest,
      reason: item.reason,
      fupCode: item.fupCode,
      description: item.description,
      status: item.status,
      raisedDate: item.raisedDate,
      raisedBy: item.raisedBy,
      receivedDate: item.receivedDate,
      receivedBy: item.receivedBy,
      validity: item.validity,
      userId: item.userId,
      remarks: item.remarks,
      udsLink: item.udsLink,
    })) ?? []),
    ...submittedRequirements,
  ];

  const handleChange = (field: string, value: string) => {
    setRequirementForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    const newRequirement: CVTRequirementRow = {
      team: requirementForm.team,
      profile: requirementForm.profile,
      category: requirementForm.category,
      subCategory: requirementForm.subCategory,
      document: requirementForm.document,
      specialTest: requirementForm.specialTest,
      reason: requirementForm.reason,
      fupCode: requirementForm.fupCode,
      description: requirementForm.description,
      status: requirementForm.status,
      raisedDate: requirementForm.raisedDate,
      raisedBy: requirementForm.raisedBy,
      receivedDate: requirementForm.receivedDate,
      receivedBy: requirementForm.receivedBy,
      validity: requirementForm.validity,
      userId: requirementForm.userId,
      remarks: requirementForm.remarks,
      udsLink: requirementForm.udsLink,
    };

    setSubmittedRequirements((prev) => [...prev, newRequirement]);

    setRequirementForm({
      team: "",
      profile: "",
      category: "",
      subCategory: "",
      document: "",
      specialTest: "",
      reason: "",
      fupCode: "",
      description: "",
      status: "",
      raisedDate: "",
      raisedBy: "",
      receivedDate: "",
      receivedBy: "",
      validity: "",
      userId: "",
      remarks: "",
      udsLink: "",
    });

    setOpenReqDialog(false);
  };

  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        <CustomAccordion title="Requirement Management">
          <CustomTable<CVTRequirementRow>
            title="Requirement Management"
            columns={requirementColumns}
            data={requirementRows}
            headerAction={
              <CustomButton
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: "white",
                  color: "#063E6F",
                  fontWeight: 700,
                  fontSize: "14px",
                  "&:hover": {
                    backgroundColor: "white",
                  },
                }}
                onClick={() => setOpenReqDialog(true)}
              >
                + Add
              </CustomButton>
            }
          />
        </CustomAccordion>

        <CustomDialog
          open={openReqDialog}
          onClose={() => setOpenReqDialog(false)}
          maxWidth="md"
          title={
            <Typography
              sx={{
                ...modalTitleStyles
              }}
            >
              add requirement
            </Typography>
          }
          actionsSx={{ justifyContent: "center", pb: 2 }}
          actions={
            <CustomButton
              onClick={handleSubmit}
              sx={{ borderRadius: "50px", paddingX: "40px" }}
            >
              Submit
            </CustomButton>
          }
        >
          <Box
            sx={{
              backgroundColor: "#F6F6F6",
              borderRadius: 2,
              p: 2,
              ...columnFlex,
              gap: 2,
            }}
          >
            {formFields.map((row, rowIndex) => (
              <Box key={rowIndex} sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
                mt: 1,
              }}>
                {row.map((field) => (
                  <Box key={field.name}>
                    <CustomSelect
                      label={field.label}
                      value={
                        requirementForm[
                        field.name as keyof typeof requirementForm
                        ]
                      }
                      onChange={(value) =>
                        handleChange(field.name, value)
                      }
                      options={field.options}
                      placeholder="Select"
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </CustomDialog>
      </Box>
    </Container>
  );
};

export default RequirementManagement;
