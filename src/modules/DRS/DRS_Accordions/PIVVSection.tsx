import { Box, Container } from "@mui/material";
import CustomAccordion from "../../../../../../git/copsaxiom/src/component/ui/Accordion/Accordion";
import LastUWRemarks from "../../../../../../git/copsaxiom/src/pages/DRS/UWDecision/LastUWRemarks";

const PIVVSection = () => {
  return (
    <>
      <Container disableGutters>
        <Box sx={{ mt: 2 }}>
          <CustomAccordion title="PIVV Section" defaultExpanded>
            <Box
              sx={{
                backgroundColor: "#F6F6F6",
                p: 2,
                mt: 1,
                borderRadius: "8px",
              }}
            >
              <LastUWRemarks
                title="PIVV Pool Remarks"
                remarks="Applicant is a 38-year-old non-smoker with no significant medical history. Financials and occupation details are satisfactory as per underwriting guidelines. Case is referred to HoD for final review and approval."
                firstFieldLabel="PIVV Pool Decision"
                firstFieldValue="Reject"
                secondFieldLabel="Reason"
                secondFieldValue="Customer not speaking"
                thirdFieldLabel="User ID"
                thirdFieldValue="sunil.sharma"
              />
            </Box>
            {/* <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 2,
            }}
          >
            <CustomButton
              variant="contained"
              sx={{
                minWidth: 200,
                height: 44,
                borderRadius: "50px",
                fontWeight: 600,
                px: 3,
                whiteSpace: "nowrap",
              }}
            >
              Submit
            </CustomButton>
          </Box> */}
          </CustomAccordion>
        </Box>
      </Container>
    </>
  );
};

export default PIVVSection;
