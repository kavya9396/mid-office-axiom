import { Box, Container, Typography } from "@mui/material"
import Header from "../../component/layout/Header"
import { columnFlex } from "../../utils/styles"
import CustomAccordion from "../../component/ui/Accordion/Accordion"
import { GridSection } from "../../component/layout/GridSection"
import RightPanel from "../Inbox/RightPanel"
import BackButton from "../../component/layout/BackButton"

const grievanceApplicationDetails = [
    { label: "Application Number", value: "Success" },
    { label: "Product Opted", value: "ICICI Pru iProtect Care (Term Plan)" },
    { label: "Premium", value: "₹ 11243" },
    { label: "Sum Assured", value: "₹ 50,00,000" },
    { label: "Medical raised date", value: "21/02/2026" },
    { label: "Medicals Received date", value: "24/02/2026" },
];

const allColumns: ColumnData[] = [
  { dataKey: "applicationNo", label: "Application No." },
  { dataKey: "appliedSa", label: "Applied SA (₹)" },
  { dataKey: "annualPremium", label: "Annual Premium (₹)" },
  { dataKey: "poolTAT", label: "Pool TAT(Hrs)" },
  { dataKey: "dateAndTimeStamp", label: "Date/Time Stamp" },
  { dataKey: "drc", label: "DRC" },
  { dataKey: "hniFlag", label: "HNI Flag" },
  { dataKey: "ptlr", label: "PTLR" },
  { dataKey: "breDecision", label: "BRE Decision" },
  { dataKey: "channel", label: "Channel" },
  {
    dataKey: "munichReMedicalDecision",
    label: "Munich Re Medical Decision",
  },
  { dataKey: "roleType", label: "Role Type" },
  { dataKey: "productType", label: "Product Type" },
  { dataKey: "isMedical", label: "Medical/Non Medical" },
];

const GrievanceApplication = () => {
    return (
        <Box>
            <Header />
            <Box
                sx={{
                    width: "100%",
                    ...columnFlex,
                    backgroundColor: "#F0F3F8",
                    overflowX: "hidden",
                    minHeight: "90vh",
                }}
            >
                <Container disableGutters>
                    <BackButton to="/drs" label="Back to DRS" justify="space-between" />
                </Container>

                <Container disableGutters>
                    <Typography
                        sx={{
                            color: "#1E1E1E",
                            fontSize: "20px",
                            fontWeight: 700,
                            ml: 1,
                        }}
                    >
                        Grievance Application
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        <CustomAccordion title="Application Details" defaultExpanded>
                            <Box sx={{ p: 2, backgroundColor: "#f6f6f6", mt: 1, borderRadius: "8px" }}>
                                <GridSection columns={4} items={grievanceApplicationDetails} />
                            </Box>
                        </CustomAccordion>
                    </Box>
                </Container>

                <Container disableGutters>
                    <Box sx={{ mt: 2 }}>
                        <RightPanel selectedPool="All Cases"
                        
                        />
                    </Box>
                </Container>
            </Box>
        </Box>
    )
}

export default GrievanceApplication