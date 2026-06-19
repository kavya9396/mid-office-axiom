import { Box, Container } from "@mui/material";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import LastUWRemarks from "../LastUWRemarks";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";

const PIVVSection = () => {
  const { pivvSection } = useSelector((state: RootState) => state.drs);

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
                remarks={pivvSection?.remarks}
                firstFieldLabel="PIVV Pool Decision"
                firstFieldValue={pivvSection?.decision}
                secondFieldLabel="Reason"
                secondFieldValue={pivvSection?.reason}
                thirdFieldLabel="User ID"
                thirdFieldValue={pivvSection?.userId}
              />
            </Box>
          </CustomAccordion>
        </Box>
      </Container>
    </>
  );
};

export default PIVVSection;
