import { Box, Typography } from "@mui/material";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTextField from "../../../components/ui/TextField/TextField";
import CustomSelect from "../../../components/ui/Select/Select";
import { useAppSelector } from "../../../store/hooks";
import { useState } from "react";
import CustomButton from "../../../components/ui/Button/Button";
import { title } from "../../../utils/constant";

interface MiscItem {
  type: string;
  code: string;
  value: string;
  description: string;
  isActive: string;
}

const Decision = () => {
  const [selectedDecision, setSelectedDecision] = useState(
    sessionStorage.getItem("caseDecision") || "",
  );

  const masterData = useAppSelector((state) => state.masterData);
  const finalBreData = useAppSelector((state) => state.bre);

  const finalBreStatus =
    finalBreData?.data?.data?.breOutput?.decisionTypes?.breDecision
      ?.trim()
      ?.toUpperCase();

  const roleType = localStorage.getItem("roleType");

  const decisionCodeMap: Record<string, string> = {
    CVT_TASK: "CVT",
    DVT_TASK: "DVT",
    PIVV_TASK: "PIVV",
    EXCEPTIONAL_TASK: "EXCEPTIONAL",
    RECONSIDERATION_TASK: "RECONS",
    REJECT_TASK: "RECONS",
    DVT_FORMAL_TASK: "DVT_FOR",
  };

  const decisionCode = roleType ? decisionCodeMap[roleType] ?? "" : "";

  const miscData =
    masterData?.data?.data?.misc ||
    JSON.parse(sessionStorage.getItem("masterData") || "{}")?.data?.misc ||
    [];

  const decisionOptions =
    (miscData as MiscItem[])
      ?.filter(
        (item) =>
          item.type === decisionCode &&
          item.isActive === "Y",
      )
      ?.filter((item) => {
        const decisionValue = item.value?.toLowerCase();

        if (
          finalBreStatus === "ST" ||
          finalBreStatus === "STD"
        ) {
          return true;
        }

        return (
          decisionValue !== "accept" &&
          decisionValue !== "standard"
        );
      })
      ?.map((item) => ({
        label: item.value,
        value: item.description,
      })) || [];

  return (
    <Box sx={{ p: 1 }}>
    <CustomAccordion title={title.decision} defaultExpanded>
      <Box
        sx={{
          p: 1,
          borderRadius: "6px",
          backgroundColor: "#f6f6f6",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
            width: "100%",
            alignItems: "center",
          }}
        >
          {/* ================= REMARKS ================= */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 400,
                color: "#444",
                mb: 0.5,
              }}
            >
              Remarks
            </Typography>

            <CustomTextField
              fullWidth
              multiline
              minRows={2}
              placeholder="Enter remarks..."
              value=""
              variant="outlined"
              size="small"
              sx={{
                width: "100%",
                backgroundColor: "#fff",
                borderRadius: "6px",

                "& .MuiInputBase-root": {
                  minHeight: "70px",
                  boxSizing: "border-box",
                  alignItems: "flex-start",
                },
              }}
            />

            <Typography
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "11px",
                color: "#888",
                mt: 0.25,
              }}
            >
              1/10000
            </Typography>
          </Box>

          {/* ================= CASE DECISION ================= */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 400,
                color: "#444",
                mb: 0.5,
              }}
            >
              Case Decision
            </Typography>

            <Box
              sx={{
                width: "100%",

                "& .MuiFormControl-root": {
                  width: "100%",
                  margin: 0,
                },

                "& .MuiInputBase-root": {
                  width: "100%",
                },
              }}
            >
              <CustomSelect
                options={decisionOptions}
                value={selectedDecision}
                onChange={(value: string) => {
                  setSelectedDecision(value);
                  sessionStorage.setItem(
                    "caseDecision",
                    value,
                  );
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* ================= SUBMIT ================= */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: "5px",
          }}
        >
          <CustomButton
            sx={{
              minWidth: 150,
              height: 36,
              borderRadius: "50px",
              fontWeight: 600,
              px: 2.5,
              whiteSpace: "nowrap",
            }}
          >
            Submit
          </CustomButton>
        </Box>
      </Box>
    </CustomAccordion>
    </Box>
  );
};

export default Decision;