import { Box } from "@mui/material";
import { useSelector } from "react-redux";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import type { RootState } from "../../../store/store";
import { formatDateWithOrdinalTime } from "../../../utils/helpers";
import LastUWRemarks from "../LastUWRemarks";

type PIVVSectionData = {
  pivvPoolRemarks?: unknown;
  remarks?: unknown;
  remarkDate?: unknown;
  pivvPoolDecision?: unknown;
  decision?: unknown;
  reason?: unknown;
  userId?: unknown;
};

const hasValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
};

const PIVVSection = () => {
  const { data } = useSelector((state: RootState) => state.drs);

  const pivvSection = (
    data as Record<string, unknown> | null
  )?.pivvSection as PIVVSectionData | undefined;

  const displayedValues = [
    pivvSection?.pivvPoolRemarks,
    pivvSection?.remarks,
    pivvSection?.remarkDate,
    pivvSection?.pivvPoolDecision,
    pivvSection?.decision,
    pivvSection?.reason,
    pivvSection?.userId,
  ];

  const hasPivvSectionData = displayedValues.some(hasValue);

  // Hide the complete accordion when every field is empty.
  if (!hasPivvSectionData) {
    return null;
  }

  const formattedRemarkDate = hasValue(pivvSection?.remarkDate)
    ? formatDateWithOrdinalTime(pivvSection?.remarkDate)
    : "";

  return (
    <Box sx={{ p: 1 }}>
      <CustomAccordion
        title="PIVV Section"
        defaultExpanded
      >
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
            remarks={String(
              pivvSection?.pivvPoolRemarks ??
                pivvSection?.remarks ??
                "",
            )}
            firstFieldLabel="PIVV Pool Decision"
            firstFieldValue={String(
              pivvSection?.pivvPoolDecision ??
                pivvSection?.decision ??
                "",
            )}
            secondFieldLabel="Reason"
            secondFieldValue={String(
              pivvSection?.reason ?? "",
            )}
            thirdFieldLabel="User ID"
            thirdFieldValue={String(
              pivvSection?.userId ?? "",
            )}
          />
        </Box>
      </CustomAccordion>
    </Box>
  );
};

export default PIVVSection;