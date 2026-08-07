import { Box, Typography } from "@mui/material";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import { title } from "../../../utils/constant";
import CustomTextField from "../../../components/ui/TextField/TextField";
import CustomSelect from "../../../components/ui/Select/Select";
import { useAppSelector } from "../../../store/hooks";
import { useState } from "react";
import CustomButton from "../../../components/ui/Button/Button";

interface MiscItem {
  type: string;
  code: string;
  value: string;
  description: string;
  isActive: string;
}
const Decision = () => {
    const [selectedDecision, setSelectedDecision] = useState(
  sessionStorage.getItem("caseDecision") || ""
);


    const masterData = useAppSelector((state) => state.masterData);
    const finalBreData = useAppSelector((state) => state.bre);
     const finalBreStatus = finalBreData?.data?.data?.breOutput?.decisionTypes?.breDecision?.trim()?.toUpperCase();;
    const roleType = localStorage.getItem('roleType');
    
  const decisionCodeMap: Record<string, string> = {
  CVT_TASK: "CVT",
  DVT_TASK: "DVT",
  PIVV_TASK: "PIVV",
  EXCEPTIONAL_TASK: "EXCEPTIONAL",
  RECONSIDERATION_TASK:"RECONS",
  REJECT_TASK:"RECONS",
  DVT_FORMAL_TASK:"DVT_FOR",
};

const decisionCode = roleType ? decisionCodeMap[roleType] ?? "" : "";
const miscData =
  masterData?.data?.data?.misc ||
  JSON.parse(sessionStorage.getItem("masterData") || "{}")?.data?.misc ||
  [];
console.log('miscData',miscData)

const decisionOptions =
  (miscData as MiscItem[])
    ?.filter((item) => item.type === decisionCode && item.isActive === "Y")
    ?.filter((item) => {
      const decisionValue = item.value?.toLowerCase();

      // ST or STD -> show everything
      if (finalBreStatus === "ST" || finalBreStatus === "STD") {
        return true;
      }

      // Other decisions -> hide only Accept
      return decisionValue !== "accept" && decisionValue !== "standard";
    })
    ?.map((item) => ({
      label: item.value,
      value: item.description,
    })) || [];
console.log('decisionOptions',decisionOptions)
  return (
    <>
      <Box sx={{ p: 1 }}>
        <CustomAccordion title={title.decision} defaultExpanded>
          <Box
            sx={{
              borderRadius: "6px",
              backgroundColor: "#f6f6f6",
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 400,
                color: "#444",
                ml:0.5
              }}
            >
              Remarks
            </Typography>
            <CustomTextField
              fullWidth
              multiline
              minRows={2}
              placeholder="Enter remarks..."
              value={""}
            
              variant="outlined"
              size="small"
              sx={{
                backgroundColor: "#fff",
                borderRadius: "6px",
              }}

            />
             <Typography sx={{ display: "flex", justifyContent: "flex-end", fontSize: "11px", color: "#888", mt: 0.25 }}>
                            1/10000
                        </Typography>
                       <CustomSelect
  label="Case Decision"
  options={decisionOptions}
  value={selectedDecision}
  onChange={(value: string) => {
    setSelectedDecision(value);
    sessionStorage.setItem("caseDecision", value);
  }}
/>
                        <CustomButton>Submit</CustomButton>
          </Box>
          
        </CustomAccordion>
      </Box>
    </>
  );
};

export default Decision;
