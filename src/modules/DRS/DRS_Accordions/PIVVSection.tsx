import { Box, Container } from "@mui/material";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import LastUWRemarks from "../LastUWRemarks";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { formatDateWithOrdinalTime } from "../../../utils/helpers";

const PIVVSection = () => {
  const { data } = useSelector((state: RootState) => state.drs);
  const pivvSection = (data as unknown as Record<string, unknown> | null)?.pivvSection as
    | Record<string, unknown>
    | undefined;
  const hasPivvSection = Boolean(pivvSection && Object.keys(pivvSection).length > 0);

  if (!hasPivvSection) {
    return null;
  }

  const formattedRemarkDate = formatDateWithOrdinalTime(pivvSection?.remarkDate);

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
                date={formattedRemarkDate}
                remarks={String(pivvSection?.pivvPoolRemarks ?? pivvSection?.remarks ?? "")}
                firstFieldLabel="PIVV Pool Decision"
                firstFieldValue={String(pivvSection?.pivvPoolDecision ?? pivvSection?.decision ?? "")}
                secondFieldLabel="Reason"
                secondFieldValue={String(pivvSection?.reason ?? "")}
                thirdFieldLabel="User ID"
                thirdFieldValue={String(pivvSection?.userId ?? "")}
              />
            </Box>
          </CustomAccordion>
        </Box>
      </Container>
    </>
  );
};

export default PIVVSection;
